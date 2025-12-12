/**
 * CSDN 平台一键发布脚本
 */

const API_BASE = 'http://localhost:3456';
const PLATFORM = 'csdn';

async function fetchArticle() {
  const response = await fetch(`${API_BASE}/api/article/${PLATFORM}`);
  if (!response.ok) throw new Error('获取文章失败');
  return response.json();
}

async function fillTitle(title) {
  const titleInput = document.querySelector('.article-bar input[type="text"]');
  if (titleInput) {
    titleInput.value = title;
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('[一键发布] 标题已填充');
  }
}

async function fillContent(content) {
  // CSDN 使用 CodeMirror
  const cm = document.querySelector('.CodeMirror');
  if (cm && cm.CodeMirror) {
    cm.CodeMirror.setValue(content);
    console.log('[一键发布] 内容已填充');
    return;
  }
  throw new Error('未找到编辑器');
}

async function autoPublish(btn) {
  btn.textContent = '发布中...';
  btn.classList.add('loading');

  try {
    const article = await fetchArticle();
    await fillTitle(article.title);
    await new Promise(r => setTimeout(r, 500));
    await fillContent(article.content);

    btn.textContent = '填充完成';
    btn.classList.remove('loading');
    btn.classList.add('success');
  } catch (error) {
    console.error('[一键发布] 错误:', error);
    btn.textContent = '发布失败';
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
  btn.textContent = '一键发布';
  btn.onclick = () => autoPublish(btn);
  document.body.appendChild(btn);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectButton);
} else {
  injectButton();
}
