/**
 * 掘金平台一键发布脚本
 */

const API_BASE = 'http://localhost:3456';
const PLATFORM = 'juejin';

/**
 * 从本地服务器获取文章内容
 */
async function fetchArticle() {
  const response = await fetch(`${API_BASE}/api/article/${PLATFORM}`);
  if (!response.ok) {
    throw new Error('获取文章失败');
  }
  return response.json();
}

/**
 * 等待元素出现
 */
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`等待元素超时: ${selector}`));
    }, timeout);
  });
}

/**
 * 填充标题
 */
async function fillTitle(title) {
  const titleInput = await waitForElement('input.title-input, input[placeholder*="标题"]');
  titleInput.value = title;
  titleInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('[一键发布] 标题已填充');
}

/**
 * 填充内容到编辑器
 */
async function fillContent(content) {
  // 掘金使用 ByteMD (CodeMirror)
  const cm = document.querySelector('.CodeMirror');
  if (cm && cm.CodeMirror) {
    cm.CodeMirror.setValue(content);
    console.log('[一键发布] 内容已填充 (CodeMirror)');
    return;
  }

  // 备用: textarea
  const textarea = document.querySelector('.bytemd-editor textarea');
  if (textarea) {
    textarea.value = content;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('[一键发布] 内容已填充 (textarea)');
    return;
  }

  throw new Error('未找到编辑器');
}

/**
 * 主发布流程
 */
async function autoPublish(btn) {
  btn.textContent = '发布中...';
  btn.classList.add('loading');

  try {
    // 1. 获取文章
    console.log('[一键发布] 获取文章内容...');
    const article = await fetchArticle();

    // 2. 填充标题
    await fillTitle(article.title);
    await new Promise(r => setTimeout(r, 500));

    // 3. 填充内容
    await fillContent(article.content);

    // 4. 完成
    btn.textContent = '填充完成';
    btn.classList.remove('loading');
    btn.classList.add('success');

    console.log('[一键发布] 完成! 请检查内容后手动发布');

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

/**
 * 注入一键发布按钮
 */
function injectButton() {
  if (document.querySelector('.auto-publish-btn')) {
    return;
  }

  const btn = document.createElement('button');
  btn.className = 'auto-publish-btn';
  btn.textContent = '一键发布';
  btn.onclick = () => autoPublish(btn);

  document.body.appendChild(btn);
  console.log('[一键发布] 按钮已注入');
}

// 页面加载完成后注入按钮
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectButton);
} else {
  injectButton();
}
