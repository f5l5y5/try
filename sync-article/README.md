# Obsidian 文章同步工具

自动将 Obsidian 中的 Markdown 文章同步发布到掘金和微信公众号。

## 功能特性

- 支持掘金平台自动发布（Markdown 格式）
- 支持微信公众号自动发布（富文本格式）
- 自动上传本地图片（通过剪贴板粘贴）
- 自动解析 Markdown 文件标题和内容
- 记录同步历史，避免重复发布
- 非侵入式操作，保留人工审核环节

## 环境要求

- Node.js >= 16.0.0
- Windows 10/11（剪贴板图片操作依赖 Windows PowerShell）
- Chrome 浏览器

## 安装步骤

### 1. 安装依赖

```bash
cd sync-article
npm install
```

### 2. 安装 Playwright 浏览器驱动

```bash
npx playwright install chromium
```

### 3. 配置文件

编辑 `config.json`，修改 Obsidian 目录路径：

```json
{
  "obsidianDir": "C:\\Users\\fuyunlong\\Desktop\\lvyun\\yinuoVault",
  "platforms": {
    "juejin": {
      "enabled": true,
      "editorUrl": "https://juejin.cn/editor/drafts/new",
      "headless": false
    },
    "wechat": {
      "enabled": true,
      "editorUrl": "https://mp.weixin.qq.com",
      "headless": false
    }
  }
}
```

## 使用方法

### 运行脚本

```bash
npm run sync
```

### 操作流程

1. 脚本启动后，输入要同步的 Markdown 文件路径（支持相对路径和绝对路径）
   - 相对路径示例: `文章/2025/我的第一篇文章.md`
   - 绝对路径示例: `C:\Users\...\文章.md`

2. 选择发布平台:
   - 1: 仅掘金
   - 2: 仅微信公众号
   - 3: 掘金 + 微信公众号

3. 确认发布后，脚本会自动打开浏览器

4. 如果未登录，请在浏览器中登录对应平台

5. 脚本会自动填充标题和内容（包括上传图片）

6. 内容填充完成后，请在浏览器中手动检查并点击"保存草稿"或"发布"

7. 检查完成后，按 Ctrl+C 退出脚本

## 工作原理

### 掘金发布流程

1. 打开掘金编辑器页面
2. 等待用户登录
3. 遍历本地图片：
   - 复制图片到剪贴板
   - 在编辑器中粘贴（Ctrl+V）
   - 等待图片上传完成
   - 提取上传后的图片 URL
4. 替换 Markdown 中的本地图片路径为在线 URL
5. 将完整的 Markdown 内容填充到编辑器
6. 等待用户手动发布

### 微信公众号发布流程

1. 打开微信公众号后台
2. 等待用户扫码登录
3. 自动打开图文编辑器
4. 填充文章标题
5. 将 Markdown 转换为 HTML
6. 按顺序处理内容：
   - 文本段落：直接插入 HTML
   - 图片：复制到剪贴板 → 粘贴到编辑器 → 等待上传
7. 等待用户手动保存草稿或发布

### 图片上传原理

- 使用 Windows PowerShell 将图片文件复制到系统剪贴板
- 通过 Playwright 模拟键盘操作（Ctrl+V）粘贴图片
- 平台自动识别剪贴板图片并上传

## 文件结构

```
sync-article/
├── index.js                 # 主入口
├── config.json              # 配置文件
├── sync-history.json        # 同步历史记录
├── package.json             # 项目配置
├── lib/
│   ├── markdown-parser.js   # Markdown 解析器
│   ├── clipboard-utils.js   # 剪贴板工具
│   ├── juejin-publisher.js  # 掘金发布器
│   └── wechat-publisher.js  # 微信公众号发布器
└── README.md                # 使用说明
```

## 注意事项

1. 图片格式支持: PNG, JPG, JPEG, GIF, WebP
2. 图片路径支持:
   - 相对路径（相对于 Markdown 文件）: `./images/pic.png`
   - 绝对路径: `C:\Users\...\pic.png`
   - 网络图片会被跳过（无需上传）
3. 首次运行需要手动登录各平台
4. 脚本不会自动点击"发布"按钮，需要人工审核后发布
5. 建议先测试单张图片的文章，确认流程正常后再处理复杂文章

## 常见问题

### 1. 图片上传失败

检查图片文件是否存在，路径是否正确。可以尝试手动在编辑器中 Ctrl+V 测试剪贴板功能。

### 2. 编辑器定位失败

各平台可能更新 UI，导致选择器失效。可以根据实际情况修改对应 publisher 文件中的选择器。

### 3. 登录超时

增加 `waitForLogin()` 方法中的 timeout 值。

### 4. 内容填充不完整

检查 Markdown 格式是否正确，特殊字符可能需要转义。

## 开发者信息

- 基于 Playwright 浏览器自动化框架
- 使用 marked 库进行 Markdown 转 HTML
- Windows 平台剪贴板操作基于 PowerShell

## 许可证

MIT License
