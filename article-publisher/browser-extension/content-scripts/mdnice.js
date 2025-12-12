/**
 * mdnice 平台脚本
 * 用于生成微信公众号富文本
 */

const API_BASE = 'http://localhost:3456';
const PLATFORM = 'wechat';

async function fetchArticle() {
  const response = await fetch(`${API_BASE}/api/article/${PLATFORM}`);
  if (!response.ok) throw new Error('获取文章失败');
  return response.json();
}

/**
 * 填充内容到 mdnice 编辑器
 */
async function fillContent(content) {
  // mdnice 使用 CodeMirror
  const cm = document.querySelector('.CodeMirror');
  if (cm && cm.CodeMirror) {
    cm.CodeMirror.setValue(content);
    console.log('[一键发布] 内容已填充到 mdnice');
    return true;
  }

  // 备用方案：直接操作 textarea
  const textarea = document.querySelector('textarea');
  if (textarea) {
    textarea.value = content;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }

  throw new Error('未找到 mdnice 编辑器');
}

/**
 * 点击复制按钮
 */
async function clickCopyButton() {
  // 查找复制按钮
  const copyBtn = document.querySelector('button[class*="copy"], .copy-button, [title*="复制"]');
  if (copyBtn) {
    copyBtn.click();
    console.log('[一键发布] 已点击复制按钮');
    return true;
  }

  // 尝试通过文字查找
  const buttons = document.querySelectorAll('button');
  for (const btn of buttons) {
    if (btn.textContent.includes('复制')) {
      btn.click();
      console.log('[一键发布] 已点击复制按钮');
      return true;
    }
  }

  console.warn('[一键发布] 未找到复制按钮，请手动点击');
  return false;
}

async function autoPublish(btn) {
  btn.textContent = '处理中...';
  btn.classList.add('loading');

  try {
    // 1. 获取文章
    const article = await fetchArticle();

    // 2. 填充内容
    await fillContent(article.content);

    // 3. 等待渲染
    await new Promise(r => setTimeout(r, 2000));

    // 4. 点击复制按钮
    await clickCopyButton();

    btn.textContent = '已复制到剪贴板';
    btn.classList.remove('loading');
    btn.classList.add('success');

    // 5. 提示下一步
    console.log('[一键发布] 请打开微信公众号后台粘贴内容');

  } catch (error) {
    console.error('[一键发布] 错误:', error);
    btn.textContent = '处理失败';
    btn.classList.remove('loading');
    btn.classList.add('error');
    setTimeout(() => {
      btn.textContent = '一键发布';
      btn.classList.remove('error');
    }, 3000);
  }
}

function injectButton() {
  if (document.querySelector('.auto-publish-btn')) return;

  const btn = document.createElement('button');
  btn.className = 'auto-publish-btn';
  btn.textContent = '填充并复制';
  btn.onclick = () => autoPublish(btn);
  document.body.appendChild(btn);
  console.log('[一键发布] mdnice 按钮已注入');
}

// mdnice 页面加载较慢
setTimeout(injectButton, 3000);
