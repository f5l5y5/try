import fs from 'fs';
import path from 'path';

/**
 * Markdown 文章解析器
 */
export class MarkdownParser {
  /**
   * 解析 Markdown 文件
   * @param {string} filePath - Markdown 文件路径
   * @returns {Object} 解析结果
   */
  static parse(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const title = this.extractTitle(content);
    const images = this.extractImages(content, filePath);

    return {
      filePath,
      title,
      content,
      images,
      hasLocalImages: images.length > 0
    };
  }

  /**
   * 提取文章标题（第一个一级标题）
   * @param {string} content - Markdown 内容
   * @returns {string} 标题
   */
  static extractTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : '未命名文章';
  }

  /**
   * 提取所有本地图片路径
   * @param {string} content - Markdown 内容
   * @param {string} baseFilePath - Markdown 文件路径（用于解析相对路径）
   * @returns {Array} 图片信息数组
   */
  static extractImages(content, baseFilePath) {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const images = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const alt = match[1];
      const imagePath = match[2];

      // 跳过网络图片
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        continue;
      }

      // 解析本地图片路径
      const absolutePath = this.resolveImagePath(imagePath, baseFilePath);

      if (fs.existsSync(absolutePath)) {
        images.push({
          alt,
          originalPath: imagePath,
          absolutePath,
          markdown: match[0]
        });
      } else {
        console.warn(`警告: 图片文件不存在: ${absolutePath}`);
      }
    }

    return images;
  }

  /**
   * 解析图片路径为绝对路径
   * @param {string} imagePath - 图片路径（可能是相对路径或绝对路径）
   * @param {string} baseFilePath - Markdown 文件路径
   * @returns {string} 绝对路径
   */
  static resolveImagePath(imagePath, baseFilePath) {
    // 如果已经是绝对路径
    if (path.isAbsolute(imagePath)) {
      return imagePath;
    }

    // 相对路径：相对于 Markdown 文件所在目录
    const baseDir = path.dirname(baseFilePath);
    return path.resolve(baseDir, imagePath);
  }

  /**
   * 替换 Markdown 中的图片链接
   * @param {string} content - 原始 Markdown 内容
   * @param {Array} replacements - 替换映射数组 [{original: string, newUrl: string}]
   * @returns {string} 替换后的 Markdown 内容
   */
  static replaceImageUrls(content, replacements) {
    let newContent = content;

    for (const { original, newUrl } of replacements) {
      // 转义特殊字符
      const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedOriginal, 'g');
      newContent = newContent.replace(regex, newUrl);
    }

    return newContent;
  }
}
