# 自动发布文章到多平台

请按照以下步骤自动发布文章:

## 步骤 1: 生成发布文件

首先执行发布脚本，生成 logo 和各平台的文章文件:

```bash
cd article-publisher && npm run publish -- "$ARGUMENTS"
```

## 步骤 2: 启动本地服务器

在后台启动本地服务器:

```bash
cd article-publisher && npm run server
```

## 步骤 3: 使用 mcp-chrome 发布到各平台

依次打开以下平台的文章发布页面，并等待浏览器插件的"一键发布"按钮:

1. **掘金**: https://juejin.cn/editor/drafts/new
2. **CSDN**: https://editor.csdn.net/md
3. **知乎**: https://zhuanlan.zhihu.com/write
4. **博客园**: https://i.cnblogs.com/posts/edit
5. **微信公众号**: 先打开 https://editor.mdnice.com/ 复制富文本，再打开 https://mp.weixin.qq.com

对于每个平台:
- 打开编辑器页面
- 等待页面加载完成
- 点击浏览器插件注入的"一键发布"按钮
- 等待内容填充完成
- 确认无误后手动点击发布

## 注意事项

- 确保已登录各平台账号
- 确保已安装对应的浏览器插件
- 发布前检查内容是否正确
