import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { uploadAndReplaceImages } from './image-uploader.js';
import { parseMarkdown, generateAllPlatformFiles } from './platform-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * 一键发布脚本
 * 整合图片上传、平台文件生成
 */

/**
 * 读取配置
 */
function loadConfig() {
  const configPath = path.join(rootDir, 'config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * 创建命令行输入接口
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * 提示用户输入
 */
function question(rl, query) {
  return new Promise(resolve => {
    rl.question(query, answer => resolve(answer.trim()));
  });
}

/**
 * 主发布流程
 * @param {string} mdFilePath - Markdown 文件路径
 * @param {Object} options - 选项
 */
async function publish(mdFilePath, options = {}) {
  const config = loadConfig();
  const outputDir = path.resolve(rootDir, config.article.outputDir);

  console.log('========================================');
  console.log('  多平台文章一键发布工具');
  console.log('========================================\n');

  // 1. 解析 Markdown 文件
  console.log('[1/2] 解析文章...');
  if (!fs.existsSync(mdFilePath)) {
    throw new Error(`文件不存在: ${mdFilePath}`);
  }
  const { title, content } = parseMarkdown(mdFilePath);
  console.log(`  标题: ${title}`);

  // 2. 上传图片到图床
  console.log('\n[2/3] 上传图片到图床...');
  const basePath = path.dirname(mdFilePath);
  const uploadedContent = await uploadAndReplaceImages(
    content,
    basePath,
    options.imageProvider || 'smms'
  );

  // 3. 为各平台生成文章文件
  console.log('\n[3/3] 生成平台文章...');
  const platformFiles = generateAllPlatformFiles(uploadedContent, title, outputDir);

  console.log('\n========================================');
  console.log('  发布准备完成');
  console.log('========================================');
  console.log(`\n输出目录: ${outputDir}`);
  console.log('\n生成的文件:');
  for (const [platform, info] of Object.entries(platformFiles)) {
    console.log(`  - article-${platform}.md (${info.name})`);
  }

  console.log('\n下一步:');
  console.log('  1. 运行 "npm run server" 启动本地服务器');
  console.log('  2. 打开各平台编辑器，点击"一键发布"按钮');

  return {
    title,
    outputDir,
    platformFiles
  };
}

/**
 * 交互式发布
 */
async function interactivePublish() {
  const config = loadConfig();
  const rl = createReadlineInterface();

  try {
    // 选择文章
    const articlesDir = path.resolve(rootDir, config.article.sourceDir);
    console.log(`文章目录: ${articlesDir}\n`);

    const mdFilePath = await question(rl, '请输入 Markdown 文件路径: ');
    if (!mdFilePath) {
      console.log('未输入文件路径');
      return;
    }

    const fullPath = path.isAbsolute(mdFilePath)
      ? mdFilePath
      : path.resolve(process.cwd(), mdFilePath);

    // 选择图床
    const provider = await question(rl, '图床选择 (smms/cnblogs) [smms]: ');
    const imageProvider = provider || 'smms';

    rl.close();

    // 执行发布
    await publish(fullPath, { imageProvider });

  } catch (error) {
    console.error('\n发生错误:', error.message);
  } finally {
    rl.close();
  }
}

// 命令行执行
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const mdFile = process.argv[2];

  if (mdFile) {
    // 直接指定文件
    publish(mdFile).catch(console.error);
  } else {
    // 交互模式
    interactivePublish();
  }
}

export { publish };
