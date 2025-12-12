/**
 * 微信公众号平台一键发布脚本
 * 微信只支持富文本，需要配合 mdnice 使用
 */

const API_BASE = 'http://localhost:3456';
const PLATFORM = 'wechat';

async function fetchArticle() {
  const response = await fetch(`${API_BASE}/api/article/${PLATFORM}`);
  if (!response.ok) throw new Error('获取文章失败');
  return response.json();
}

async function fillTitle(title) {
  const titleInput = document.querySelector('#title');
  if (titleInput) {
    titleInput.value = title;
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('[一键发布] 标题已填充');
  }
}

async function autoPublish(btn) {
  btn.textContent = '发布中...';
  btn.classList.add('loading');

  try {
    const article = await fetchArticle();
    await fillTitle(article.title);

    // 微信需要手动从 mdnice 复制富文本
    btn.textContent = '请从 mdnice 复制内容';
    btn.classList.remove('loading');
    btn.classList.add('success');

    console.log('[一键发布] 标题已填充');
    console.log('[一键发布] 请打开 mdnice 复制富文本内容');

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

// 微信公众号页面加载较慢
setTimeout(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }
}, 3000);
