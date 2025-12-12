# 多平台文章一键发布工具

参考文章: https://juejin.cn/post/7558468868600283186

## 功能特点

- 自动生成文章 Logo（普通版 + 微信版）
- 将本地图片上传到图床（支持 SM.MS、博客园）
- 为各平台生成带引流钩子的 Markdown 文件
- 浏览器插件实现一键填充内容
- 本地服务器为插件提供文章数据

## 支持平台

| 平台 | 状态 | 说明 |
|------|------|------|
| 掘金 | 支持 | Markdown 编辑器 |
| CSDN | 支持 | Markdown 编辑器 |
| 知乎 | 支持 | 支持 MD 上传 |
| 博客园 | 支持 | Markdown 编辑器 |
| 微信公众号 | 支持 | 需配合 mdnice |

## 安装

```bash
cd article-publisher
npm install
```

## 使用流程

### 1. 准备文章

将 Markdown 文章放入 `articles/` 目录

### 2. 执行发布准备

```bash
npm run publish -- ./articles/your-article.md
```

这个命令会:
- 生成 Logo 文件
- 上传文章中的本地图片到图床
- 为各平台生成定制化的 Markdown 文件

### 3. 启动本地服务器

```bash
npm run server
```

服务器会在 `http://localhost:3456` 启动

### 4. 安装浏览器插件

1. 打开 Chrome 扩展管理页面 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `browser-extension` 目录

### 5. 发布文章

1. 打开各平台的文章编辑页面
2. 点击右上角的"一键发布"按钮
3. 等待内容填充完成
4. 检查无误后手动点击发布

## 配置说明

编辑 `config.json`:

```json
{
  "article": {
    "sourceDir": "./articles",    // 文章源目录
    "outputDir": "./output"       // 输出目录
  },
  "logo": {
    "backgroundColor": "#1e3a5f", // Logo 背景色
    "textColor": "#ffffff"        // Logo 文字颜色
  },
  "platforms": {
    "juejin": {
      "enabled": true,
      "hook": "引流文案..."       // 添加到文章末尾
    }
  },
  "server": {
    "port": 3456                  // 本地服务器端口
  }
}
```

## 目录结构

```
article-publisher/
  articles/           # 原始文章目录
  output/             # 生成的文件
    logo.png          # 普通 Logo
    logo-wechat.png   # 微信 Logo
    article-juejin.md # 掘金版文章
    article-csdn.md   # CSDN版文章
    ...
  scripts/
    publish.js        # 主发布脚本
    logo-generator.js # Logo 生成器
    image-uploader.js # 图片上传器
    platform-generator.js # 平台文件生成器
    server.js         # 本地服务器
  browser-extension/  # 浏览器插件
  config.json         # 配置文件
```

## API 接口

本地服务器提供以下接口:

| 接口 | 说明 |
|------|------|
| GET /api/meta | 获取文章元信息 |
| GET /api/article/:platform | 获取指定平台的文章 |
| GET /api/platforms | 获取平台配置 |
| GET /static/logo.png | 获取普通 Logo |

## Claude Code 集成

项目包含 Claude Code 自定义命令:

```
/auto-publish <文章路径>
```

使用 mcp-chrome 可以实现全自动发布流程。
