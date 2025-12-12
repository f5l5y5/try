import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * 平台文章生成器
 * 为各平台生成带有引流钩子的 Markdown 文件
 */

/**
 * 读取配置
 */
function loadConfig() {
  const configPath = path.join(rootDir, 'config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * 解析 Markdown 文件（支持 front matter）
 * @param {string} filePath - 文件路径
 * @returns {Object} { title, content, metadata }
 */
export function parseMarkdown(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: metadata, content } = matter(raw);

  // 从内容中提取标题（如果没有在 front matter 中）
  let title = metadata.title;
  if (!title) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
  }

  return {
    title,
    content,
    metadata,
    raw
  };
}

/**
 * 为指定平台生成 Markdown 文件
 * @param {string} content - 原始内容（图片已上传）
 * @param {string} platform - 平台名称
 * @param {Object} platformConfig - 平台配置
 * @returns {string} 带钩子的内容
 */
export function generatePlatformContent(content, platform, platformConfig) {
  let result = content;

  // 添加引流钩子（在文章末尾）
  if (platformConfig.hook) {
    result = result.trimEnd() + platformConfig.hook;
  }

  return result;
}

/**
 * 为所有平台生成文章文件
 * @param {string} content - 原始内容（图片已上传）
 * @param {string} title - 文章标题
 * @param {string} outputDir - 输出目录
 * @returns {Object} 各平台文件路径
 */
export function generateAllPlatformFiles(content, title, outputDir) {
  const config = loadConfig();
  const results = {};

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('为各平台生成文章文件...');

  for (const [platform, platformConfig] of Object.entries(config.platforms)) {
    if (!platformConfig.enabled) {
      continue;
    }

    const platformContent = generatePlatformContent(content, platform, platformConfig);
    const fileName = `article-${platform}.md`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, platformContent, 'utf-8');
    console.log(`  -> ${platformConfig.name}: ${fileName}`);

    results[platform] = {
      name: platformConfig.name,
      filePath,
      content: platformContent,
      editorUrl: platformConfig.editorUrl
    };
  }

  // 保存元信息
  const metaPath = path.join(outputDir, 'meta.json');
  fs.writeFileSync(metaPath, JSON.stringify({
    title,
    generatedAt: new Date().toISOString(),
    platforms: Object.keys(results)
  }, null, 2));

  return results;
}

// 命令行执行
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const mdFile = process.argv[2];
  const outputDir = process.argv[3] || path.join(rootDir, 'output');

  if (!mdFile) {
    console.log('用法: node platform-generator.js <markdown文件> [输出目录]');
    process.exit(1);
  }

  const { title, content } = parseMarkdown(mdFile);
  console.log(`文章标题: ${title}`);

  generateAllPlatformFiles(content, title, outputDir);
  console.log('\n平台文件生成完成');
}
