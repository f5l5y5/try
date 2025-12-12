import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { ClipboardUtils } from './clipboard-utils.js';
import { MarkdownParser } from './markdown-parser.js';
import { ImageUploader } from './image-uploader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 掘金平台发布器
 */
export class JuejinPublisher {
  constructor(config, browserConfig = {}) {
    this.config = config;
    this.browserConfig = browserConfig;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.isConnectedBrowser = false;
  }

  /**
   * 初始化浏览器
   */
  async init() {
    const { connectToExisting, cdpEndpoint, usePersistentContext, userDataDir } = this.browserConfig;

    if (connectToExisting && cdpEndpoint) {
      console.log(`正在连接到已打开的浏览器: ${cdpEndpoint}`);
      try {
        this.browser = await chromium.connectOverCDP(cdpEndpoint);
        this.isConnectedBrowser = true;

        const contexts = this.browser.contexts();
        if (contexts.length > 0) {
          const pages = contexts[0].pages();
          this.page = pages.length > 0 ? pages[0] : await contexts[0].newPage();
        } else {
          const context = await this.browser.newContext();
          this.page = await context.newPage();
        }

        console.log('已连接到现有浏览器');
      } catch (error) {
        throw new Error(
          `连接浏览器失败: ${error.message}\n` +
          '请确保已启动 Chrome 并启用远程调试:\n' +
          'chrome.exe --remote-debugging-port=9222'
        );
      }
    } else if (usePersistentContext) {
      console.log('正在启动浏览器（持久化模式，保留登录状态）...');
      const dataDir = path.resolve(__dirname, '..', userDataDir || './browser-data', 'juejin');

      this.context = await chromium.launchPersistentContext(dataDir, {
        headless: this.config.headless || false,
        channel: 'chrome',
        args: ['--start-maximized'],
        viewport: null
      });

      this.page = this.context.pages()[0] || await this.context.newPage();
      console.log('浏览器启动成功（登录状态将被保留）');
    } else {
      console.log('正在启动新浏览器...');
      this.browser = await chromium.launch({
        headless: this.config.headless || false,
        channel: 'chrome',
        args: ['--start-maximized']
      });

      const context = await this.browser.newContext({
        viewport: null,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });

      this.page = await context.newPage();
      console.log('浏览器启动成功');
    }
  }

  /**
   * 发布文章到掘金
   * @param {Object} article - 文章对象（由 MarkdownParser 解析）
   */
  async publish(article) {
    try {
      console.log(`\n开始发布到掘金: ${article.title}`);

      // 1. 处理图片（在打开浏览器前先上传到图床）
      let contentToPublish = article.content;
      if (article.hasLocalImages) {
        const { imageUpload } = this.browserConfig;
        if (imageUpload?.enabled) {
          console.log(`检测到 ${article.images.length} 张本地图片，上传到图床...`);
          contentToPublish = await this.uploadImagesToHost(article, imageUpload);
        } else {
          console.log(`检测到 ${article.images.length} 张本地图片，将通过浏览器上传...`);
        }
      }

      // 2. 打开掘金编辑器
      await this.openEditor();

      // 3. 等待用户登录（如果需要）
      await this.waitForLogin();

      // 4. 如果没有使用图床，通过浏览器上传图片
      if (article.hasLocalImages && !this.browserConfig.imageUpload?.enabled) {
        contentToPublish = await this.uploadImages(article);
      }

      // 5. 填充内容
      await this.fillContent(contentToPublish);

      // 6. 等待用户手动发布
      console.log('\n内容已填充，请在浏览器中检查并手动点击"发布"按钮');
      console.log('按 Ctrl+C 退出脚本');

      // 保持浏览器打开
      await this.page.waitForTimeout(300000); // 等待 5 分钟

    } catch (error) {
      console.error('掘金发布失败:', error.message);
      throw error;
    }
  }

  /**
   * 上传图片到图床
   * @param {Object} article - 文章对象
   * @param {Object} options - 图床配置
   * @returns {string} 替换图片 URL 后的内容
   */
  async uploadImagesToHost(article, options) {
    const urlMap = await ImageUploader.uploadBatch(article.images, options);

    let content = article.content;
    for (const [original, replacement] of urlMap) {
      content = content.replace(original, replacement);
    }

    return content;
  }

  /**
   * 打开掘金编辑器
   */
  async openEditor() {
    console.log('正在打开掘金编辑器...');
    await this.page.goto(this.config.editorUrl);
    await this.page.waitForTimeout(2000);
  }

  /**
   * 等待用户登录
   */
  async waitForLogin() {
    console.log('\n请在浏览器中登录掘金账号（如果尚未登录）');
    console.log('登录完成后，脚本将自动继续...');

    // 等待编辑器加载（检测编辑器容器）
    try {
      await this.page.waitForSelector('.CodeMirror, .bytemd, [contenteditable="true"]', {
        timeout: 60000
      });
      console.log('编辑器已加载');
    } catch (error) {
      throw new Error('编辑器加载超时，请确认已正确登录');
    }
  }

  /**
   * 上传图片并获取 URL
   * @param {Object} article - 文章对象
   * @returns {string} 替换图片 URL 后的 Markdown 内容
   */
  async uploadImages(article) {
    const replacements = [];

    for (let i = 0; i < article.images.length; i++) {
      const image = article.images[i];
      console.log(`\n上传图片 ${i + 1}/${article.images.length}: ${image.absolutePath}`);

      try {
        // 1. 先清空编辑器
        await this.clearEditor();
        await this.page.waitForTimeout(300);

        // 2. 聚焦编辑器
        await this.focusEditor();
        await this.page.waitForTimeout(300);

        // 3. 复制图片到剪贴板
        await ClipboardUtils.copyImageToClipboard(image.absolutePath);
        await this.page.waitForTimeout(500);

        // 4. 粘贴图片
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('KeyV');
        await this.page.keyboard.up('Control');
        console.log('已粘贴图片，等待上传...');

        // 5. 等待图片上传完成（检测 URL 出现）
        const uploadedUrl = await this.waitForImageUrl(15000);

        if (uploadedUrl) {
          console.log(`图片上传成功: ${uploadedUrl}`);
          replacements.push({
            original: image.markdown,
            newUrl: `![${image.alt}](${uploadedUrl})`
          });
        } else {
          console.warn(`警告: 无法获取图片 URL，将保留原路径`);
        }

      } catch (error) {
        console.error(`图片上传失败: ${error.message}`);
      }
    }

    // 清空编辑器，准备填充完整内容
    await this.clearEditor();

    // 替换 Markdown 中的图片 URL
    return MarkdownParser.replaceImageUrls(article.content, replacements);
  }

  /**
   * 聚焦编辑器
   */
  async focusEditor() {
    await this.page.evaluate(() => {
      // ByteMD 编辑器
      const cm = document.querySelector('.CodeMirror');
      if (cm && cm.CodeMirror) {
        cm.CodeMirror.focus();
        return;
      }

      // 其他编辑器
      const textarea = document.querySelector('.bytemd-editor textarea');
      if (textarea) {
        textarea.focus();
        return;
      }

      const editable = document.querySelector('[contenteditable="true"]');
      if (editable) {
        editable.focus();
      }
    });
  }

  /**
   * 等待图片 URL 出现
   * @param {number} timeout - 超时时间
   * @returns {Promise<string|null>} 图片 URL
   */
  async waitForImageUrl(timeout = 15000) {
    const startTime = Date.now();
    const checkInterval = 500;

    while (Date.now() - startTime < timeout) {
      const url = await this.extractLastUploadedImageUrl();
      if (url) {
        return url;
      }
      await this.page.waitForTimeout(checkInterval);
    }

    return null;
  }

  /**
   * 提取最后一次上传的图片 URL
   * @returns {Promise<string|null>} 图片 URL
   */
  async extractLastUploadedImageUrl() {
    try {
      const content = await this.page.evaluate(() => {
        // ByteMD 使用 CodeMirror
        const cm = document.querySelector('.CodeMirror');
        if (cm && cm.CodeMirror) {
          return cm.CodeMirror.getValue();
        }

        // 尝试从 textarea 获取
        const textarea = document.querySelector('.bytemd-editor textarea, textarea.editor');
        if (textarea) {
          return textarea.value;
        }

        return '';
      });

      // 匹配掘金图片 URL 格式
      const patterns = [
        /!\[.*?\]\((https:\/\/p\d+-juejin\.byteimg\.com\/[^)]+)\)/g,
        /!\[.*?\]\((https?:\/\/[^)]+\.(png|jpg|jpeg|gif|webp)[^)]*)\)/gi
      ];

      for (const pattern of patterns) {
        const matches = [...content.matchAll(pattern)];
        if (matches.length > 0) {
          return matches[matches.length - 1][1];
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 清空编辑器内容
   */
  async clearEditor() {
    await this.page.evaluate(() => {
      const editor = document.querySelector('.CodeMirror');
      if (editor && editor.CodeMirror) {
        editor.CodeMirror.setValue('');
        return;
      }

      const textarea = document.querySelector('.bytemd-editor textarea');
      if (textarea) {
        textarea.value = '';
        return;
      }

      const contentEditable = document.querySelector('[contenteditable="true"]');
      if (contentEditable) {
        contentEditable.innerHTML = '';
      }
    });

    await this.page.waitForTimeout(500);
  }

  /**
   * 填充文章内容
   * @param {string} content - Markdown 内容
   */
  async fillContent(content) {
    console.log('\n正在填充文章内容...');

    try {
      // 方法1: 通过 CodeMirror API
      await this.page.evaluate((text) => {
        const editor = document.querySelector('.CodeMirror');
        if (editor && editor.CodeMirror) {
          editor.CodeMirror.setValue(text);
          return true;
        }
        return false;
      }, content);

      await this.page.waitForTimeout(1000);

      // 方法2: 通过 textarea
      const textarea = await this.page.$('.bytemd-editor textarea');
      if (textarea) {
        await textarea.fill(content);
      }

      console.log('内容填充成功');
    } catch (error) {
      console.error('内容填充失败:', error.message);
      console.log('请手动复制粘贴文章内容');
    }
  }

  /**
   * 关闭浏览器
   */
  async close() {
    if (this.context) {
      await this.context.close();
      console.log('浏览器已关闭');
    } else if (this.browser) {
      if (this.isConnectedBrowser) {
        console.log('断开与浏览器的连接（浏览器保持打开）');
      } else {
        console.log('浏览器已关闭');
      }
      await this.browser.close();
    }
  }
}
