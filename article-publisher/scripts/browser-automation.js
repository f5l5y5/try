import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * 浏览器自动化脚本
 * 配合 mcp-chrome 使用，自动打开各平台并触发发布
 */

function loadConfig() {
  const configPath = path.join(rootDir, 'config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * 生成 mcp-chrome 操作指令
 * 这些指令可以直接在 Claude Code 中使用
 */
export function generateMcpInstructions() {
  const config = loadConfig();
  const instructions = [];

  instructions.push('## 使用 mcp-chrome 自动发布文章\n');
  instructions.push('请按顺序执行以下操作:\n');

  // 1. 掘金
  if (config.platforms.juejin?.enabled) {
    instructions.push(`### 1. 掘金
1. 打开页面: ${config.platforms.juejin.editorUrl}
2. 等待页面加载完成
3. 点击右上角的"一键发布"按钮
4. 等待内容填充完成
5. 检查无误后手动点击发布
`);
  }

  // 2. CSDN
  if (config.platforms.csdn?.enabled) {
    instructions.push(`### 2. CSDN
1. 打开页面: ${config.platforms.csdn.editorUrl}
2. 等待页面加载完成
3. 点击"一键发布"按钮
4. 检查无误后手动点击发布
`);
  }

  // 3. 知乎
  if (config.platforms.zhihu?.enabled) {
    instructions.push(`### 3. 知乎
1. 打开页面: ${config.platforms.zhihu.editorUrl}
2. 等待页面加载完成
3. 点击"一键发布"按钮
4. 检查无误后手动点击发布
`);
  }

  // 4. 博客园
  if (config.platforms.cnblogs?.enabled) {
    instructions.push(`### 4. 博客园
1. 打开页面: ${config.platforms.cnblogs.editorUrl}
2. 等待页面加载完成
3. 点击"一键发布"按钮
4. 检查无误后手动点击发布
`);
  }

  // 5. 微信公众号
  if (config.platforms.wechat?.enabled) {
    instructions.push(`### 5. 微信公众号
1. 先打开 mdnice: ${config.platforms.wechat.mdniceUrl}
2. 从本地服务器获取文章内容粘贴到 mdnice
3. 点击 mdnice 的复制按钮
4. 打开公众号: ${config.platforms.wechat.editorUrl}
5. 粘贴富文本内容
`);
  }

  return instructions.join('\n');
}

/**
 * 生成发布检查清单
 */
export function generateChecklist() {
  return `
## 发布前检查清单

- [ ] 文章标题是否正确
- [ ] 图片是否全部显示正常
- [ ] 引流钩子是否添加
- [ ] 分类/标签是否选择
- [ ] Logo 是否上传（如需要）
- [ ] 摘要/描述是否填写

## 发布后检查

- [ ] 掘金文章链接
- [ ] CSDN文章链接
- [ ] 知乎文章链接
- [ ] 博客园文章链接
- [ ] 微信公众号是否发送成功
`;
}

// 命令行执行
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(generateMcpInstructions());
  console.log(generateChecklist());
}
