# Service Worker 跨页面通信使用说明

## 目录

1. [概述](#概述)
2. [核心概念](#核心概念)
3. [实现原理](#实现原理)
4. [快速开始](#快速开始)
5. [API 文档](#api-文档)
6. [完整示例](#完整示例)
7. [注意事项](#注意事项)
8. [常见问题](#常见问题)
9. [与 SharedWorker 对比](#与-sharedworker-对比)
10. [浏览器兼容性](#浏览器兼容性)

---

## 概述

Service Worker 是一种运行在浏览器后台的脚本，独立于网页，主要用于离线缓存、推送通知等功能。本项目展示了如何使用 Service Worker 实现跨页面通信。

### 主要特性

- **广播消息**：一对多通信，消息发送给所有打开的页面
- **点对点消息**：一对一通信，消息仅发送给指定页面
- **在线列表查询**：实时查看当前在线的所有页面
- **自动连接管理**：页面关闭自动清理，定期检测失效连接
- **持久化运行**：即使关闭所有页面，Service Worker 也会继续运行一段时间

---

## 核心概念

### Service Worker 生命周期

```
注册 (Register)
    ↓
安装 (Install)
    ↓
激活 (Activate)
    ↓
运行 (Active)
    ↓
终止 (Terminated)
```

### Service Worker vs SharedWorker

| 特性 | Service Worker | SharedWorker |
|------|----------------|--------------|
| 生命周期 | 持久化，独立于页面 | 所有页面关闭后终止 |
| 主要用途 | 离线缓存、推送通知、跨页面通信 | 跨页面通信、共享状态 |
| 通信方式 | postMessage（单向） | MessagePort（双向） |
| HTTPS 要求 | 必须（开发环境可用 localhost） | 不强制要求 |
| 浏览器支持 | 广泛支持 | Safari 需开启实验性功能 |
| 调试难度 | 较高（独立线程） | 中等 |
| 缓存能力 | 原生支持 Cache API | 需要自己实现 |

### 通信模型

```
页面 A ──┐
         ├──→ Service Worker ←──┐
页面 B ──┘   (持久化运行)        ├── 页面 C
                                └── 页面 D
```

所有页面通过 `postMessage` 与 Service Worker 通信，Service Worker 通过 `clients.matchAll()` 获取所有页面并发送消息。

---

## 实现原理

### 1. 注册 Service Worker

```javascript
// 页面端
if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.register('./service-worker.js');
    await navigator.serviceWorker.ready;
}
```

### 2. 连接管理

使用 **Map** 存储页面连接：

```javascript
// Service Worker 端
const connections = new Map();
// key: pageId (页面标识)
// value: { client, id, pageId } (客户端信息)
```

**为什么用 Map？**
- 通过 pageId 作为唯一标识
- 页面刷新时自动覆盖旧连接
- 快速查找目标页面

### 3. 消息流程

```
1. 页面注册 Service Worker
   ↓
2. 等待 Service Worker 激活
   ↓
3. 发送 register 消息（携带 pageId）
   ↓
4. Service Worker 保存连接
   ↓
5. 页面可以开始收发消息
```

### 4. 广播实现

```javascript
// Service Worker 端
const allClients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
});

allClients.forEach((client) => {
    client.postMessage({
        type: 'broadcast',
        data: '消息内容'
    });
});
```

### 5. 点对点实现

```javascript
// Service Worker 端
if (connections.has(targetPageId)) {
    const targetConn = connections.get(targetPageId);
    const allClients = await self.clients.matchAll();
    const targetClient = allClients.find(c => c.id === targetConn.id);

    if (targetClient) {
        targetClient.postMessage({
            type: 'private',
            data: '消息内容'
        });
    }
}
```

---

## 快速开始

### 步骤 1：启动本地服务器

**重要：** Service Worker 需要 HTTPS 环境（开发环境可使用 localhost）。

```bash
# 方式 1：使用 Node.js
npx http-server -p 8000

# 方式 2：使用 Python
python -m http.server 8000

# 方式 3：使用 VS Code Live Server
右键 HTML 文件 → Open with Live Server
```

### 步骤 2：打开页面

访问 http://localhost:8000/index.html，然后：
1. 点击"打开页面 A"（会在新标签页打开）
2. 点击"打开页面 B"（会在新标签页打开）
3. 等待 Service Worker 注册并激活（状态指示变绿）

### 步骤 3：测试通信

**测试广播：**
1. 在页面 A 输入消息
2. 点击"广播消息"
3. 页面 A 和页面 B 都会收到消息

**测试私信：**
1. 在页面 A 输入消息
2. 点击"发给页面B"
3. 只有页面 B 收到消息

**查看在线列表：**
1. 点击"获取在线列表"
2. 查看当前在线的所有页面 ID

---

## API 文档

### Service Worker 端 API (service-worker.js)

#### connections

```javascript
const connections = new Map();
// 结构：Map<pageId: string, { client, id, pageId }>
```

存储所有注册的页面连接。

#### 生命周期事件

**install 事件**
```javascript
self.addEventListener('install', (event) => {
    console.log('Service Worker 安装中...');
    self.skipWaiting(); // 跳过等待，立即激活
});
```

**activate 事件**
```javascript
self.addEventListener('activate', (event) => {
    console.log('Service Worker 已激活');
    event.waitUntil(self.clients.claim()); // 立即控制所有页面
});
```

#### 消息处理

**message 事件**
```javascript
self.addEventListener('message', async (event) => {
    const { type, pageId, target, data } = event.data;
    const client = event.source;

    // 处理不同类型的消息
});
```

**消息类型：**

| 类型 | 用途 | 参数 | 返回 |
|------|------|------|------|
| `register` | 注册页面 | `pageId` | `registered` 消息 |
| `broadcast` | 广播消息 | `pageId`, `data` | 所有页面收到 `broadcast` |
| `private` | 点对点消息 | `pageId`, `target`, `data` | 目标页面收到 `private` |
| `get-online` | 获取在线列表 | `pageId` | `online-list` 消息 |
| `heartbeat` | 心跳检测 | `pageId` | 无 |
| `disconnect` | 断开连接 | `pageId` | 无 |

#### 客户端管理 API

**获取所有客户端**
```javascript
const allClients = await self.clients.matchAll({
    type: 'window',              // 只获取 window 类型
    includeUncontrolled: true    // 包括未受控的客户端
});
```

**向客户端发送消息**
```javascript
client.postMessage({
    type: 'message-type',
    from: 'ServiceWorker',
    data: '消息内容'
});
```

---

### 页面端 API

#### 注册 Service Worker

```javascript
// 检查浏览器支持
if ('serviceWorker' in navigator) {
    // 注册
    const registration = await navigator.serviceWorker.register('./service-worker.js');

    // 等待激活
    await navigator.serviceWorker.ready;

    // 发送注册消息
    navigator.serviceWorker.controller.postMessage({
        type: 'register',
        pageId: 'your-unique-page-id'
    });
}
```

#### 监听消息

```javascript
navigator.serviceWorker.addEventListener('message', (event) => {
    const { type, sender, data } = event.data;

    if (type === 'broadcast') {
        console.log('收到广播:', data);
    } else if (type === 'private') {
        console.log('收到私信:', data);
    }
});
```

#### 发送消息

**发送广播**
```javascript
navigator.serviceWorker.controller.postMessage({
    type: 'broadcast',
    pageId: 'page-123',
    data: 'Hello everyone!'
});
```

**发送私信**
```javascript
navigator.serviceWorker.controller.postMessage({
    type: 'private',
    pageId: 'page-123',
    target: 'page-456',
    data: 'Hello page-456!'
});
```

**获取在线列表**
```javascript
navigator.serviceWorker.controller.postMessage({
    type: 'get-online',
    pageId: 'page-123'
});
```

**断开连接**
```javascript
window.addEventListener('beforeunload', () => {
    navigator.serviceWorker.controller.postMessage({
        type: 'disconnect',
        pageId: 'page-123'
    });
});
```

---

## 完整示例

### Service Worker 脚本

```javascript
const connections = new Map();

// 安装
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// 激活
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// 消息处理
self.addEventListener('message', async (event) => {
    const { type, pageId, target, data } = event.data;
    const client = event.source;

    // 注册
    if (type === 'register') {
        connections.set(pageId, {
            client: client,
            id: client.id,
            pageId: pageId
        });
        client.postMessage({
            type: 'registered',
            data: '注册成功'
        });
        return;
    }

    // 广播
    if (type === 'broadcast') {
        const allClients = await self.clients.matchAll();
        allClients.forEach((c) => {
            c.postMessage({
                type: 'broadcast',
                sender: pageId,
                data: data
            });
        });
    }

    // 私信
    if (type === 'private') {
        if (connections.has(target)) {
            const targetConn = connections.get(target);
            const allClients = await self.clients.matchAll();
            const targetClient = allClients.find(c => c.id === targetConn.id);

            if (targetClient) {
                targetClient.postMessage({
                    type: 'private',
                    sender: pageId,
                    data: data
                });
            }
        }
    }
});
```

### 页面脚本

```javascript
const pageId = 'page-123';

// 注册 Service Worker
async function init() {
    const registration = await navigator.serviceWorker.register('./service-worker.js');
    await navigator.serviceWorker.ready;

    // 发送注册消息
    navigator.serviceWorker.controller.postMessage({
        type: 'register',
        pageId: pageId
    });
}

// 监听消息
navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('收到消息:', event.data);
});

// 发送广播
function sendBroadcast(message) {
    navigator.serviceWorker.controller.postMessage({
        type: 'broadcast',
        pageId: pageId,
        data: message
    });
}

init();
```

---

## 注意事项

### 1. 必须使用 HTTPS 或 localhost

**错误：**
```
http://192.168.1.100:8000/pagesA.html  ✗ 不支持 Service Worker
file:///C:/project/pagesA.html          ✗ 不支持 Service Worker
```

**正确：**
```
https://example.com/pagesA.html         ✓ 支持
http://localhost:8000/pagesA.html       ✓ 支持（仅开发环境）
http://127.0.0.1:8000/pagesA.html       ✓ 支持（仅开发环境）
```

### 2. Service Worker 作用域

Service Worker 只能控制与其同级或下级的页面：

```
/app/
  service-worker.js    ← 可以控制 /app/ 及其子目录
  pages/
    pagesA.html        ✓ 可控制
    pagesB.html        ✓ 可控制
/other/
  pagesC.html          ✗ 无法控制
```

### 3. 首次加载需要刷新

首次注册 Service Worker 后，需要刷新页面才能使其生效：

```javascript
// 检测是否需要刷新
navigator.serviceWorker.register('./service-worker.js').then((registration) => {
    if (registration.installing) {
        console.log('首次安装，需要刷新页面');
    }
});
```

### 4. 更新 Service Worker

修改 Service Worker 脚本后，浏览器会自动检测并更新：

```javascript
// 强制更新
registration.update();

// 监听更新事件
registration.addEventListener('updatefound', () => {
    console.log('发现新版本');
});
```

**开发调试技巧：**
- Chrome DevTools → Application → Service Workers
- 勾选 "Update on reload"（每次刷新时更新）
- 点击 "Unregister" 注销 Service Worker

### 5. pageId 必须唯一

**错误做法：**
```javascript
const pageId = Math.random();  // ✗ 刷新后变化
```

**正确做法：**
```javascript
// 方式 1：固定 ID
const pageId = 'page-123';

// 方式 2：基于 URL
const pageId = window.location.pathname;

// 方式 3：使用 sessionStorage
let pageId = sessionStorage.getItem('pageId');
if (!pageId) {
    pageId = 'page-' + Date.now() + '-' + Math.random();
    sessionStorage.setItem('pageId', pageId);
}
```

### 6. 调试 Service Worker

**Chrome/Edge：**
1. 开发者工具 → Application → Service Workers
2. 点击 Service Worker 名称下的 "Inspect" 链接
3. 查看 Service Worker 的控制台输出

**或访问：** `chrome://serviceworker-internals/`

### 7. 清理无效连接

Service Worker 会定期检查并清理断开的连接：

```javascript
// 每30秒检查一次
setInterval(async () => {
    const allClients = await self.clients.matchAll();
    const activeClientIds = new Set(allClients.map(c => c.id));

    for (const [pageId, conn] of connections.entries()) {
        if (!activeClientIds.has(conn.id)) {
            connections.delete(pageId);
        }
    }
}, 30000);
```

---

## 常见问题

### Q1: Service Worker 注册成功但页面收不到消息？

**可能原因：**
1. Service Worker 未激活（首次注册需要刷新页面）
2. 未发送 `register` 消息
3. `navigator.serviceWorker.controller` 为 null

**解决方案：**
```javascript
// 等待 Service Worker 就绪
await navigator.serviceWorker.ready;

// 检查是否受控
if (!navigator.serviceWorker.controller) {
    console.log('页面未受控，刷新页面后重试');
    window.location.reload();
    return;
}

// 发送注册消息
navigator.serviceWorker.controller.postMessage({
    type: 'register',
    pageId: 'page-123'
});
```

### Q2: 如何注销 Service Worker？

**开发调试：**
```javascript
// 注销所有 Service Worker
navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
        registration.unregister();
    });
});
```

**或在 Chrome 中：**
- 访问 `chrome://serviceworker-internals/`
- 点击 "Unregister" 按钮

### Q3: Service Worker 更新后旧版本不退出？

**原因：** 有页面仍在使用旧版本。

**解决方案：**
```javascript
// Service Worker 端
self.addEventListener('install', (event) => {
    self.skipWaiting(); // 强制跳过等待
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim()); // 立即控制所有页面
});
```

### Q4: 如何实现请求-响应模式？

```javascript
// 发送请求（页面 A）
const requestId = Date.now();
navigator.serviceWorker.controller.postMessage({
    type: 'request',
    requestId: requestId,
    pageId: 'page-A',
    target: 'page-B',
    data: '请求数据'
});

// 等待响应
const handler = (event) => {
    if (event.data.type === 'response' && event.data.requestId === requestId) {
        console.log('收到响应:', event.data.data);
        navigator.serviceWorker.removeEventListener('message', handler);
    }
};
navigator.serviceWorker.addEventListener('message', handler);

// 处理请求并响应（页面 B）
navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'request') {
        const result = processRequest(event.data.data);

        navigator.serviceWorker.controller.postMessage({
            type: 'response',
            requestId: event.data.requestId,
            pageId: 'page-B',
            target: event.data.pageId,
            data: result
        });
    }
});
```

### Q5: 如何监控 Service Worker 状态？

```javascript
navigator.serviceWorker.register('./service-worker.js').then((registration) => {
    // 监听状态变化
    registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
            console.log('Service Worker 状态:', newWorker.state);
            // 可能的状态：installing, installed, activating, activated, redundant
        });
    });

    // 检查当前状态
    if (registration.waiting) {
        console.log('有新版本等待激活');
    }

    if (registration.active) {
        console.log('Service Worker 已激活');
    }
});
```

### Q6: 如何实现消息持久化？

结合 Cache API 或 IndexedDB：

```javascript
// Service Worker 端
self.addEventListener('message', async (event) => {
    if (event.data.type === 'broadcast') {
        // 保存到 Cache
        const cache = await caches.open('messages');
        await cache.put('/messages', new Response(JSON.stringify(event.data)));

        // 广播消息
        const allClients = await self.clients.matchAll();
        allClients.forEach((client) => {
            client.postMessage(event.data);
        });
    }
});

// 页面连接时读取历史消息
self.addEventListener('message', async (event) => {
    if (event.data.type === 'get-history') {
        const cache = await caches.open('messages');
        const response = await cache.match('/messages');
        if (response) {
            const messages = await response.json();
            event.source.postMessage({
                type: 'history',
                data: messages
            });
        }
    }
});
```

---

## 与 SharedWorker 对比

### 适用场景

**使用 Service Worker：**
- 需要离线缓存功能
- 需要推送通知
- 构建 PWA 应用
- 需要拦截网络请求
- 需要持久化运行

**使用 SharedWorker：**
- 仅需要简单的页面间通信
- 不需要离线功能
- 不需要持久化运行
- 希望所有页面关闭后立即终止

### 代码复杂度对比

**Service Worker（较复杂）：**
- 需要注册和生命周期管理
- 需要处理激活和更新逻辑
- 需要使用 clients API 获取页面
- 调试相对困难

**SharedWorker（较简单）：**
- 直接创建实例即可使用
- 通过 MessagePort 双向通信
- 连接管理更直观
- 调试相对容易

### 性能对比

| 指标 | Service Worker | SharedWorker |
|------|----------------|--------------|
| 启动速度 | 较慢（需要注册和激活） | 快 |
| 消息延迟 | 略高 | 低 |
| 内存占用 | 较高（持久化运行） | 中等 |
| CPU 占用 | 中等 | 低 |

---

## 浏览器兼容性

| 浏览器 | 版本 | 支持情况 |
|--------|------|----------|
| Chrome | 40+ | 完全支持 |
| Edge | 17+ | 完全支持 |
| Firefox | 44+ | 完全支持 |
| Safari | 11.1+ | 完全支持 |
| Opera | 27+ | 完全支持 |
| IE | 不支持 | 不支持 |

**检测支持性：**
```javascript
if ('serviceWorker' in navigator) {
    console.log('浏览器支持 Service Worker');
} else {
    console.log('浏览器不支持 Service Worker');
    // 降级方案
}
```

**降级方案：**
1. **BroadcastChannel**（现代浏览器）
2. **SharedWorker**（兼容性较好）
3. **localStorage + storage 事件**（兼容性最好）
4. **WebSocket**（需要服务器）

---

## 项目结构

```
serviceWorker/
├── service-worker.js    # Service Worker 脚本
├── pagesA.html          # 页面 A
├── pagesB.html          # 页面 B
├── index.html           # 入口页面
└── README.md            # 本文档
```

---

## 最佳实践

### 1. 优雅降级

```javascript
async function initCommunication() {
    if ('serviceWorker' in navigator) {
        await initServiceWorker();
    } else if (typeof SharedWorker !== 'undefined') {
        await initSharedWorker();
    } else if ('BroadcastChannel' in window) {
        await initBroadcastChannel();
    } else {
        await initLocalStorage();
    }
}
```

### 2. 错误处理

```javascript
navigator.serviceWorker.register('./service-worker.js')
    .then((registration) => {
        console.log('注册成功');
    })
    .catch((error) => {
        console.error('注册失败:', error);
        // 降级到其他方案
    });
```

### 3. 版本管理

```javascript
// Service Worker 端
const VERSION = '1.0.0';

self.addEventListener('message', (event) => {
    if (event.data.type === 'get-version') {
        event.source.postMessage({
            type: 'version',
            data: VERSION
        });
    }
});
```

---

## 许可证

MIT License

---

## 参考资料

- [MDN - Service Worker API](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)
- [MDN - Using Service Workers](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Google - Service Worker 生命周期](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)
- [Service Worker Cookbook](https://serviceworke.rs/)
