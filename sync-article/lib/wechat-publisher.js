import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import { ClipboardUtils } from './clipboard-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 微信公众号发布器
 */
export class WechatPublisher {
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
      const dataDir = path.resolve(__dirname, '..', userDataDir || './browser-data', 'wechat');

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
   * 发布文章到微信公众号
   * @param {Object} article - 文章对象（由 MarkdownParser 解析）
   */
  async publish(article) {
    try {
      console.log(`\n开始发布到微信公众号: ${article.title}`);

      // 1. 打开微信公众号后台
      await this.openPlatform();

      // 2. 等待用户登录
      await this.waitForLogin();

      // 3. 进入图文编辑器
      await this.openEditor();

      // 4. 填充标题
      await this.fillTitle(article.title);

      // 5. 处理内容（Markdown 转 HTML + 图片上传）
      await this.fillContentWithImages(article);

      // 6. 等待用户手动保存草稿/发布
      console.log('\n内容已填充，请在浏览器中检查并手动保存草稿');
      console.log('按 Ctrl+C 退出脚本');

      // 保持浏览器打开
      await this.page.waitForTimeout(300000); // 等待 5 分钟

    } catch (error) {
      console.error('微信公众号发布失败:', error.message);
      throw error;
    }
  }

  /**
   * 打开微信公众号平台
   */
  async openPlatform() {
    console.log('正在打开微信公众号平台...');
    await this.page.goto(this.config.editorUrl);
    await this.page.waitForTimeout(2000);
  }

  /**
   * 等待用户登录
   */
  async waitForLogin() {
    console.log('\n请在浏览器中扫码登录微信公众号');
    console.log('登录完成后，脚本将自动继续...');

    try {
      // 等待登录成功，检测左侧导航栏
      await this.page.waitForSelector('.weui-desktop-layout__sidebar, .menu_item', {
        timeout: 120000
      });
      console.log('登录成功');
      await this.page.waitForTimeout(2000);
    } catch (error) {
      throw new Error('登录超时，请重新运行脚本');
    }
  }

  /**
   * 打开图文编辑器
   */
  async openEditor() {
    console.log('正在打开图文编辑器...');

    try {
      // 方法1: 直接访问新建图文消息页面
      await this.page.goto('https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit_v2&action=edit&isNew=1&type=10&createType=0&token=&lang=zh_CN');
      await this.page.waitForTimeout(3000);

      // 等待编辑器加载
      await this.page.waitForSelector('#edui1_iframeholder, .rich_media_editor', {
        timeout: 10000
      });

      console.log('编辑器已打开');
    } catch (error) {
      console.error('编辑器打开失败，请手动点击"新建图文消息"');
      throw error;
    }
  }

  /**
   * 填充标题
   * @param {string} title - 文章标题
   */
  async fillTitle(title) {
    console.log('正在填充标题...');

    try {
      const titleInput = await this.page.$('#title, input[placeholder*="标题"]');
      if (titleInput) {
        await titleInput.fill(title);
        console.log(`标题已填充: ${title}`);
      }
    } catch (error) {
      console.error('标题填充失败:', error.message);
    }
  }

  /**
   * 填充内容（包含图片处理）
   * @param {Object} article - 文章对象
   */
  async fillContentWithImages(article) {
    console.log('正在处理文章内容...');

    try {
      // 定位富文本编辑器 iframe
      const editorFrame = await this.page.frameLocator('#edui1_iframeholder iframe, iframe[id*="ueditor"]');

      // 如果有本地图片，需要逐段处理
      if (article.hasLocalImages) {
        await this.processContentWithImages(article, editorFrame);
      } else {
        // 没有本地图片，直接转换 Markdown 为 HTML 并粘贴
        const html = marked(article.content);
        await this.pasteHtmlToEditor(html, editorFrame);
      }

      console.log('内容填充完成');
    } catch (error) {
      console.error('内容填充失败:', error.message);
      console.log('请手动复制粘贴文章内容');
    }
  }

  /**
   * 处理包含图片的内容
   * @param {Object} article - 文章对象
   * @param {Object} editorFrame - 编辑器 frame
   */
  async processContentWithImages(article, editorFrame) {
    console.log(`检测到 ${article.images.length} 张本地图片`);

    // 将内容分段：按图片位置切分
    const segments = this.splitContentByImages(article.content, article.images);

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (segment.type === 'text') {
        // 文本段落：转换为 HTML 并粘贴
        const html = marked(segment.content);
        await this.pasteHtmlToEditor(html, editorFrame);
      } else if (segment.type === 'image') {
        // 图片：通过剪贴板粘贴
        console.log(`\n上传图片 ${segment.index + 1}/${article.images.length}`);
        await ClipboardUtils.copyImageToClipboard(segment.absolutePath);
        await this.page.waitForTimeout(500);

        // 在编辑器中粘贴图片
        await editorFrame.locator('body').click();
        await ClipboardUtils.pasteImageInPage(this.page);
        await this.page.waitForTimeout(3000); // 等待图片上传
      }
    }
  }

  /**
   * 按图片位置切分内容
   * @param {string} content - Markdown 内容
   * @param {Array} images - 图片数组
   * @returns {Array} 切分后的段落数组
   */
  splitContentByImages(content, images) {
    const segments = [];
    let lastIndex = 0;

    images.forEach((image, index) => {
      const imagePos = content.indexOf(image.markdown, lastIndex);

      if (imagePos > lastIndex) {
        // 添加图片前的文本
        segments.push({
          type: 'text',
          content: content.substring(lastIndex, imagePos)
        });
      }

      // 添加图片
      segments.push({
        type: 'image',
        index,
        absolutePath: image.absolutePath,
        alt: image.alt
      });

      lastIndex = imagePos + image.markdown.length;
    });

    // 添加最后一段文本
    if (lastIndex < content.length) {
      segments.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }

    return segments;
  }

  /**
   * 将 HTML 粘贴到编辑器
   * @param {string} html - HTML 内容
   * @param {Object} editorFrame - 编辑器 frame
   */
  async pasteHtmlToEditor(html, editorFrame) {
    try {
      // 方法1: 直接设置 innerHTML（如果可以访问）
      await editorFrame.locator('body').evaluate((body, htmlContent) => {
        body.innerHTML += htmlContent;
      }, html);

      await this.page.waitForTimeout(500);
    } catch (error) {
      console.error('HTML 粘贴失败，请手动粘贴内容');
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
