import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * 图片上传器
 * 将本地图片上传到图床，返回在线 URL
 */

/**
 * 读取配置
 */
function loadConfig() {
  const configPath = path.join(rootDir, 'config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * 上传图片到博客园（支持 MetaWeblog API）
 * @param {string} imagePath - 本地图片路径
 * @param {Object} config - 博客园配置
 * @returns {Promise<string>} 图片 URL
 */
async function uploadToCnblogs(imagePath, config) {
  const { blogId, username, password } = config;

  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString('base64');
  const fileName = path.basename(imagePath);

  // MetaWeblog API XML-RPC 请求
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<methodCall>
  <methodName>metaWeblog.newMediaObject</methodName>
  <params>
    <param><value><string>${blogId}</string></value></param>
    <param><value><string>${username}</string></value></param>
    <param><value><string>${password}</string></value></param>
    <param>
      <value>
        <struct>
          <member>
            <name>name</name>
            <value><string>${fileName}</string></value>
          </member>
          <member>
            <name>type</name>
            <value><string>image/png</string></value>
          </member>
          <member>
            <name>bits</name>
            <value><base64>${base64}</base64></value>
          </member>
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'rpc.cnblogs.com',
      path: '/metaweblog/' + blogId,
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(xml)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // 解析 XML 响应获取 URL
        const urlMatch = data.match(/<string>(https?:\/\/[^<]+)<\/string>/);
        if (urlMatch) {
          resolve(urlMatch[1]);
        } else {
          reject(new Error('上传失败: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.write(xml);
    req.end();
  });
}

/**
 * 上传图片到 SM.MS（免费图床）
 * @param {string} imagePath - 本地图片路径
 * @returns {Promise<string>} 图片 URL
 */
async function uploadToSmms(imagePath) {
  const form = new FormData();
  form.append('smfile', fs.createReadStream(imagePath));

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'sm.ms',
      path: '/api/v2/upload',
      method: 'POST',
      headers: form.getHeaders()
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            resolve(result.data.url);
          } else if (result.code === 'image_repeated') {
            resolve(result.images);
          } else {
            reject(new Error(result.message || '上传失败'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

/**
 * 解析 Markdown 中的本地图片
 * @param {string} content - Markdown 内容
 * @param {string} basePath - 基础路径
 * @returns {Array} 图片信息数组
 */
export function parseLocalImages(content, basePath) {
  const images = [];
  // 匹配 ![alt](path) 格式
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const [fullMatch, alt, imagePath] = match;

    // 跳过网络图片
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      continue;
    }

    // 计算绝对路径
    const absolutePath = path.isAbsolute(imagePath)
      ? imagePath
      : path.resolve(basePath, imagePath);

    if (fs.existsSync(absolutePath)) {
      images.push({
        markdown: fullMatch,
        alt,
        relativePath: imagePath,
        absolutePath
      });
    }
  }

  return images;
}

/**
 * 上传 Markdown 中的所有本地图片并替换为在线 URL
 * @param {string} content - Markdown 内容
 * @param {string} basePath - 基础路径
 * @param {string} provider - 图床提供商 ('cnblogs' | 'smms')
 * @returns {Promise<string>} 替换后的 Markdown 内容
 */
export async function uploadAndReplaceImages(content, basePath, provider = 'smms') {
  const config = loadConfig();
  const images = parseLocalImages(content, basePath);

  if (images.length === 0) {
    console.log('没有发现本地图片');
    return content;
  }

  console.log(`发现 ${images.length} 张本地图片，开始上传...`);

  let newContent = content;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    console.log(`  [${i + 1}/${images.length}] 上传: ${path.basename(image.absolutePath)}`);

    try {
      let url;
      if (provider === 'cnblogs') {
        url = await uploadToCnblogs(image.absolutePath, config.cnblogs);
      } else {
        url = await uploadToSmms(image.absolutePath);
      }

      console.log(`    -> ${url}`);
      newContent = newContent.replace(image.markdown, `![${image.alt}](${url})`);
    } catch (error) {
      console.error(`    -> 上传失败: ${error.message}`);
    }
  }

  return newContent;
}

// 命令行执行
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const mdFile = process.argv[2];
  const provider = process.argv[3] || 'smms';

  if (!mdFile) {
    console.log('用法: node image-uploader.js <markdown文件> [provider]');
    console.log('provider: smms (默认) | cnblogs');
    process.exit(1);
  }

  const content = fs.readFileSync(mdFile, 'utf-8');
  const basePath = path.dirname(mdFile);

  uploadAndReplaceImages(content, basePath, provider)
    .then(newContent => {
      const outputPath = mdFile.replace('.md', '-uploaded.md');
      fs.writeFileSync(outputPath, newContent);
      console.log(`\n已保存到: ${outputPath}`);
    })
    .catch(console.error);
}
