const CACHE_NAME = 'my-cache';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if(response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


// 这段服务工作（Service Worker）代码中，我们已经帮助你实现了缓存静态文件（如 CSS 和 JavaScript 文件）的功能。当发起请求时，此代码会先检查缓存，如果找到匹配的请求则返回缓存的响应；否则，将从网络上请求该资源，并缓存该响应以供将来使用。

// 现在，您已经创建了一个使用 Express 的后端并支持缓存功能的服务工作（Service Worker）的案例。

// 要运行此示例，请确保安装了依赖（如 express）并运行：


// 然后转到 `http://localhost:3000` 查看运行中的示例。检查浏览器开发工具中的 Cache Storage 以查看缓存结果。