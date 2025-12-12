import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

/**
 * 图片上传器 - 支持多种图床
 */
export class ImageUploader {
  /**
   * 上传图片到 SM.MS 图床（免费，无需注册）
   * @param {string} imagePath - 本地图片路径
   * @returns {Promise<string>} 图片 URL
   */
  static async uploadToSmms(imagePath) {
    const FormData = (await import('form-data')).default;
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
   * 上传图片到 imgbb（免费，需要 API key）
   * @param {string} imagePath - 本地图片路径
   * @param {string} apiKey - imgbb API key
   * @returns {Promise<string>} 图片 URL
   */
  static async uploadToImgbb(imagePath, apiKey) {
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString('base64');

    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('image', base64);

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.imgbb.com',
        path: '/1/upload',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.success) {
              resolve(result.data.url);
            } else {
              reject(new Error(result.error?.message || '上传失败'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(params.toString());
      req.end();
    });
  }

  /**
   * 将图片转为 Base64 Data URL（不需要上传，直接嵌入）
   * @param {string} imagePath - 本地图片路径
   * @returns {string} Base64 Data URL
   */
  static toBase64DataUrl(imagePath) {
    const imageData = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase().slice(1);
    const mimeType = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp'
    }[ext] || 'image/png';

    return `data:${mimeType};base64,${imageData.toString('base64')}`;
  }

  /**
   * 批量上传图片并返回 URL 映射
   * @param {Array} images - 图片数组 [{absolutePath, markdown, alt}]
   * @param {Object} options - 配置选项
   * @returns {Promise<Map>} 原始路径 -> 新 URL 的映射
   */
  static async uploadBatch(images, options = {}) {
    const { provider = 'base64', apiKey } = options;
    const urlMap = new Map();

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`上传图片 ${i + 1}/${images.length}: ${path.basename(image.absolutePath)}`);

      try {
        let url;
        switch (provider) {
          case 'smms':
            url = await this.uploadToSmms(image.absolutePath);
            break;
          case 'imgbb':
            if (!apiKey) {
              throw new Error('imgbb 需要 API key');
            }
            url = await this.uploadToImgbb(image.absolutePath, apiKey);
            break;
          case 'base64':
          default:
            url = this.toBase64DataUrl(image.absolutePath);
            break;
        }

        urlMap.set(image.markdown, `![${image.alt}](${url})`);
        console.log(`  -> 上传成功`);
      } catch (error) {
        console.error(`  -> 上传失败: ${error.message}`);
        urlMap.set(image.markdown, image.markdown);
      }
    }

    return urlMap;
  }
}
