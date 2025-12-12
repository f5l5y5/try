import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * 本地服务器
 * 为浏览器插件提供文章内容接口
 */

/**
 * 读取配置
 */
function loadConfig() {
  const configPath = path.join(rootDir, 'config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * 启动服务器
 */
export function startServer() {
  const config = loadConfig();
  const app = express();
  const outputDir = path.join(rootDir, config.article.outputDir);

  // 启用 CORS（允许浏览器插件访问）
  app.use(cors());
  app.use(express.json());

  // 静态文件服务（logo 等）
  app.use('/static', express.static(outputDir));

  /**
   * 获取文章元信息
   */
  app.get('/api/meta', (req, res) => {
    try {
      const metaPath = path.join(outputDir, 'meta.json');
      if (!fs.existsSync(metaPath)) {
        return res.status(404).json({ error: '未找到文章元信息' });
      }
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      res.json(meta);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * 获取指定平台的文章内容
   */
  app.get('/api/article/:platform', (req, res) => {
    try {
      const { platform } = req.params;
      const filePath = path.join(outputDir, `article-${platform}.md`);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: `未找到 ${platform} 平台的文章` });
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const metaPath = path.join(outputDir, 'meta.json');
      const meta = fs.existsSync(metaPath)
        ? JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
        : {};

      res.json({
        platform,
        title: meta.title || '',
        content,
        logoUrl: `http://localhost:${config.server.port}/static/logo.png`,
        wechatLogoUrl: `http://localhost:${config.server.port}/static/logo-wechat.png`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * 获取所有平台配置
   */
  app.get('/api/platforms', (req, res) => {
    res.json(config.platforms);
  });

  /**
   * 健康检查
   */
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 启动服务器
  const port = config.server.port;
  app.listen(port, () => {
    console.log(`\n本地服务器已启动: http://localhost:${port}`);
    console.log('\n可用接口:');
    console.log(`  GET /api/meta          - 获取文章元信息`);
    console.log(`  GET /api/article/:platform - 获取平台文章 (juejin/csdn/zhihu/cnblogs/wechat)`);
    console.log(`  GET /api/platforms     - 获取平台配置`);
    console.log(`  GET /static/logo.png   - 普通 Logo`);
    console.log(`  GET /static/logo-wechat.png - 微信 Logo`);
    console.log('\n按 Ctrl+C 停止服务器');
  });

  return app;
}

// 命令行执行
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}
