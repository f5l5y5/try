import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 剪贴板工具类（Windows 平台）
 */
export class ClipboardUtils {
  /**
   * 将图片文件复制到剪贴板（Windows）
   * @param {string} imagePath - 图片文件绝对路径
   * @returns {Promise<void>}
   */
  static async copyImageToClipboard(imagePath) {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`图片文件不存在: ${imagePath}`);
    }

    // Windows PowerShell 脚本：将图片复制到剪贴板
    const psScript = `
      Add-Type -AssemblyName System.Windows.Forms
      $img = [System.Drawing.Image]::FromFile("${imagePath.replace(/\\/g, '\\\\')}")
      [System.Windows.Forms.Clipboard]::SetImage($img)
      $img.Dispose()
    `;

    try {
      await execAsync(`powershell -command "${psScript.replace(/"/g, '\\"')}"`);
      console.log(`图片已复制到剪贴板: ${imagePath}`);
    } catch (error) {
      throw new Error(`复制图片到剪贴板失败: ${error.message}`);
    }
  }

  /**
   * 通过 Playwright 页面粘贴图片
   * @param {Object} page - Playwright 页面对象
   * @param {string} selector - 编辑器选择器（可选）
   * @returns {Promise<void>}
   */
  static async pasteImageInPage(page, selector = null) {
    if (selector) {
      // 聚焦到指定元素
      await page.click(selector);
      await page.waitForTimeout(500);
    }

    // 模拟 Ctrl+V 粘贴
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyV');
    await page.keyboard.up('Control');

    console.log('已触发粘贴操作（Ctrl+V）');
  }

  /**
   * 等待图片上传完成（通过检测特定元素或等待时间）
   * @param {Object} page - Playwright 页面对象
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<void>}
   */
  static async waitForImageUpload(page, timeout = 10000) {
    // 简单等待策略：等待固定时间
    // 更好的做法是监听网络请求或检测 DOM 变化
    await page.waitForTimeout(timeout);
    console.log('图片上传等待完成');
  }
}
