import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * SVG Logo 生成器
 * 不依赖 canvas，直接生成 SVG 文件
 */

function loadConfig() {
  const configPath = path.join(rootDir, 'config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * 智能换行
 */
function smartLineBreak(text, maxCharsPerLine = 8) {
  // 中文按字符数分割，英文按单词分割
  const isChinese = /[\u4e00-\u9fa5]/.test(text);

  if (isChinese) {
    const lines = [];
    for (let i = 0; i < text.length; i += maxCharsPerLine) {
      lines.push(text.slice(i, i + maxCharsPerLine));
    }
    return lines;
  }

  // 英文按单词分割
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine * 2) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

/**
 * 转义 XML 特殊字符
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 生成 SVG Logo
 */
export function generateSvgLogo(text, options = {}) {
  const config = loadConfig();
  const {
    width = config.logo.normalSize.width,
    height = config.logo.normalSize.height,
    backgroundColor = config.logo.backgroundColor,
    textColor = config.logo.textColor
  } = options;

  const lines = smartLineBreak(text, 10);
  const fontSize = Math.min(width, height) / (lines.length + 2);
  const lineHeight = fontSize * 1.4;
  const startY = (height - lines.length * lineHeight) / 2 + fontSize / 2;

  const textElements = lines.map((line, i) => {
    const y = startY + i * lineHeight + lineHeight / 2;
    return `  <text x="${width / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" font-weight="bold" fill="${textColor}" font-family="Microsoft YaHei, PingFang SC, sans-serif">${escapeXml(line)}</text>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
${textElements}
</svg>`;
}

/**
 * 生成 HTML 页面（可用浏览器截图转 PNG）
 */
export function generateLogoHtml(text, options = {}) {
  const config = loadConfig();
  const {
    width = config.logo.normalSize.width,
    height = config.logo.normalSize.height,
    backgroundColor = config.logo.backgroundColor,
    textColor = config.logo.textColor
  } = options;

  const lines = smartLineBreak(text, 10);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Logo - ${escapeXml(text)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${width}px;
      height: ${height}px;
      background: ${backgroundColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
    }
    .logo-text {
      color: ${textColor};
      font-size: ${Math.min(width, height) / (lines.length + 2)}px;
      font-weight: bold;
      text-align: center;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="logo-text">${lines.map(l => escapeXml(l)).join('<br>')}</div>
</body>
</html>`;
}

/**
 * 生成所有 Logo 文件
 */
export async function generateLogos(title, outputDir) {
  const config = loadConfig();

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('生成 Logo 文件...');

  // 生成普通 Logo (SVG)
  const normalSvg = generateSvgLogo(title, config.logo.normalSize);
  const normalSvgPath = path.join(outputDir, 'logo.svg');
  fs.writeFileSync(normalSvgPath, normalSvg);
  console.log(`  -> ${normalSvgPath}`);

  // 生成微信 Logo (SVG)
  const wechatSvg = generateSvgLogo(title, {
    ...config.logo.wechatSize,
    backgroundColor: config.logo.backgroundColor,
    textColor: config.logo.textColor
  });
  const wechatSvgPath = path.join(outputDir, 'logo-wechat.svg');
  fs.writeFileSync(wechatSvgPath, wechatSvg);
  console.log(`  -> ${wechatSvgPath}`);

  // 生成 HTML 文件（可用浏览器打开后截图转 PNG）
  const normalHtml = generateLogoHtml(title, config.logo.normalSize);
  const normalHtmlPath = path.join(outputDir, 'logo.html');
  fs.writeFileSync(normalHtmlPath, normalHtml);
  console.log(`  -> ${normalHtmlPath} (浏览器打开后截图可得 PNG)`);

  return {
    normalSvg: normalSvgPath,
    wechatSvg: wechatSvgPath,
    normalHtml: normalHtmlPath
  };
}

// 命令行执行
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const title = process.argv[2] || '测试标题';
  const outputDir = process.argv[3] || path.join(rootDir, 'output');

  generateLogos(title, outputDir)
    .then(() => console.log('\nLogo 生成完成'))
    .catch(console.error);
}
