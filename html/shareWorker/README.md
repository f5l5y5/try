# SharedWorker 跨页面通信使用说明

## 目录

1. [概述](#概述)
2. [核心概念](#核心概念)
3. [实现原理](#实现原理)
4. [快速开始](#快速开始)
5. [API 文档](#api-文档)
6. [完整示例](#完整示例)
7. [注意事项](#注意事项)
8. [常见问题](#常见问题)
9. [浏览器兼容性](#浏览器兼容性)

---

## 概述

SharedWorker 是 Web Workers API 的一种，允许多个浏览器标签页、iframe 或窗口共享同一个 Worker 线程。本项目实现了基于 SharedWorker 的跨页面通信解决方案，支持：

- **广播消息**：一对多通信，消息发送给所有连接的页面
- **点对点消息**：一对一通信，消息仅发送给指定页面
- **自动去重**：页面刷新时自动清理旧连接
- **连接管理**：自动处理页面连接和断开

---

## 核心概念

### SharedWorker vs Service Worker

| 特性 | SharedWorker | Service Worker |
|------|--------------|----------------|
| 生命周期 | 所有页面关闭后终止 | 持久化，独立于页面 |
| 通信方式 | MessagePort（双向） | postMessage（单向） |
| 主要用途 | 跨页面通信、共享状态 | 离线缓存、推送通知 |
| 调试方式 | chrome://inspect | chrome://serviceworker-internals |

### 连接模型

```
页面 A ──┐
         ├──→ SharedWorker (share.js) ←──┐
页面 B ──┘                                ├── 页面 C
                                         └── 页面 D
```

所有页面通过 MessagePort 与同一个 Worker 实例通信。

---

## 实现原理

### 1. 数据结构

使用 **Map** 存储连接，而非 Set：

```javascript
// key: pageId (字符串)
// value: MessagePort (对象)
const connections = new Map();
```

**为什么用 Map？**
- 页面刷新时 port 对象会改变，Set 无法识别重复
- Map 通过 pageId 作为唯一标识，自动去重

### 2. 连接流程

```
1. 页面创建 SharedWorker 实例
   ↓
2. 调用 port.start() 启动通信
   ↓
3. 注册 onmessage 监听器
   ↓
4. 发送 register 消息（携带 pageId）
   ↓
5. Worker 保存连接到 Map: connections.set(pageId, port)
   ↓
6. 页面可以开始发送/接收消息
```

### 3. 消息类型

| 类型 | 用途 | 参数 |
|------|------|------|
| `register` | 页面注册 | `pageId` |
| `broadcast` | 广播消息 | `pageId`, `data` |
| `private` | 点对点消息 | `pageId`, `target`, `data` |

---

## 快速开始

### 步骤 1：启动本地服务器

**重要：** SharedWorker 必须通过 HTTP/HTTPS 访问，不能使用 `file://` 协议。

```bash
# 方式 1：使用 Node.js
npx http-server -p 8000

# 方式 2：使用 Python
python -m http.server 8000

# 方式 3：使用 VS Code Live Server 插件
右键 HTML 文件 → Open with Live Server
```

### 步骤 2：打开页面

在浏览器中打开两个标签页：
- http://localhost:8000/pagesA.html
- http://localhost:8000/pagesB.html

### 步骤 3：测试通信

1. 在页面 A 输入消息，点击"广播消息" → 两个页面都收到
2. 在页面 A 输入消息，点击"发给页面B" → 只有页面 B 收到
3. 刷新页面 A → 连接自动重新注册，通信正常

---

## API 文档

### Worker 端 API (share.js)

#### connections

```javascript
const connections = new Map();
```

存储所有页面连接，结构：`Map<pageId: string, port: MessagePort>`

#### 事件：connect

```javascript
self.addEventListener('connect', (event) => {
    const port = event.ports[0];
    // 处理新连接
});
```

当页面创建 SharedWorker 实例时触发。

#### 消息处理

```javascript
port.onmessage = (msg) => {
    const { type, pageId, target, data } = msg.data;
    // 处理消息
};
```

**消息格式：**

**注册消息**
```javascript
{
    type: 'register',
    pageId: 'page-123'
}
```

**广播消息**
```javascript
{
    type: 'broadcast',
    pageId: 'page-123',
    data: '消息内容'
}
```

**点对点消息**
```javascript
{
    type: 'private',
    pageId: 'page-123',
    target: 'page-456',
    data: '消息内容'
}
```

---

### 页面端 API

#### 创建连接

```javascript
// 1. 创建 SharedWorker 实例
const worker = new SharedWorker('./share.js');

// 2. 获取通信端口
const port = worker.port;

// 3. 启动端口（必须在监听器之前）
port.start();

// 4. 注册消息监听器
port.onmessage = (msg) => {
    console.log('收到消息:', msg.data);
};

// 5. 发送注册消息
port.postMessage({
    type: 'register',
    pageId: 'your-unique-page-id'
});
```

#### 发送广播消息

```javascript
port.postMessage({
    type: 'broadcast',
    pageId: 'page-123',
    data: 'Hello everyone!'
});
```

**效果：** 所有连接的页面（包括发送者）都会收到消息。

#### 发送点对点消息

```javascript
port.postMessage({
    type: 'private',
    pageId: 'page-123',
    target: 'page-456',
    data: 'Hello page-456!'
});
```

**效果：** 只有 `page-456` 会收到消息。

#### 断开连接

```javascript
// 页面关闭时自动断开
window.addEventListener('beforeunload', () => {
    port.close();
});
```

---

## 完整示例

### Worker 脚本 (share.js)

```javascript
// 存储所有页面连接
const connections = new Map();

self.addEventListener('connect', (e) => {
    const port = e.ports[0];

    port.onmessage = (msg) => {
        const { type, target, data, pageId } = msg.data;

        // 处理注册
        if (type === 'register') {
            // 页面刷新时清理旧连接
            if (connections.has(pageId)) {
                const oldPort = connections.get(pageId);
                try {
                    oldPort.close();
                } catch (e) {}
            }

            port.pageId = pageId;
            connections.set(pageId, port);
            console.log(`页面 ${pageId} 已注册`);
            return;
        }

        // 广播消息
        if (type === 'broadcast') {
            connections.forEach((conn) => {
                try {
                    conn.postMessage({
                        from: 'Worker',
                        data: `广播消息：${data}`
                    });
                } catch (e) {
                    console.error('发送失败:', e);
                }
            });
        }

        // 点对点消息
        if (type === 'private') {
            if (connections.has(target)) {
                try {
                    connections.get(target).postMessage({
                        from: 'Worker',
                        data: `私发消息：${data}`
                    });
                } catch (e) {
                    console.error('发送失败:', e);
                }
            }
        }
    };

    // 监听连接关闭
    port.addEventListener('close', () => {
        if (port.pageId) {
            connections.delete(port.pageId);
            console.log(`页面 ${port.pageId} 断开连接`);
        }
    });

    port.start();
});
```

### 页面脚本 (pagesA.html)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>页面 A</title>
</head>
<body>
    <h3>页面 A</h3>
    <input type="text" id="msgInput" placeholder="输入消息">
    <button onclick="sendBroadcast()">广播消息</button>
    <button onclick="sendToPageB()">发给页面B</button>
    <div id="log"></div>

    <script>
        const pageId = 'page-123';
        const worker = new SharedWorker('./share.js');
        const port = worker.port;

        // 启动端口
        port.start();

        // 监听消息
        port.onmessage = (msg) => {
            const log = document.getElementById('log');
            log.innerHTML += `<p>收到：${JSON.stringify(msg.data)}</p>`;
        };

        // 注册
        port.postMessage({
            type: 'register',
            pageId: pageId
        });

        // 广播消息
        function sendBroadcast() {
            const input = document.getElementById('msgInput');
            port.postMessage({
                type: 'broadcast',
                pageId: pageId,
                data: input.value
            });
        }

        // 点对点消息
        function sendToPageB() {
            const input = document.getElementById('msgInput');
            port.postMessage({
                type: 'private',
                pageId: pageId,
                target: 'page-456',
                data: input.value
            });
        }

        // 页面关闭时断开连接
        window.addEventListener('beforeunload', () => {
            port.close();
        });
    </script>
</body>
</html>
```

---

## 注意事项

### 1. 必须使用 HTTP 服务器

**错误做法：**
```
file:///C:/Users/user/project/pagesA.html  ✗ 不工作
```

**正确做法：**
```
http://localhost:8000/pagesA.html  ✓ 正常工作
```

### 2. port.start() 必须在监听器之前

**错误顺序：**
```javascript
port.onmessage = (msg) => { /* ... */ };
port.start();  // ✗ 可能丢失早期消息
```

**正确顺序：**
```javascript
port.start();  // ✓ 先启动
port.onmessage = (msg) => { /* ... */ };
```

### 3. 页面必须在同一域名

SharedWorker 遵循同源策略：

```
http://localhost:8000/pagesA.html  ✓
http://localhost:8000/pagesB.html  ✓  可以共享

http://localhost:8000/pagesA.html  ✗
http://localhost:9000/pagesB.html  ✗  不能共享（端口不同）

http://example.com/pagesA.html     ✗
http://other.com/pagesB.html       ✗  不能共享（域名不同）
```

### 4. pageId 必须唯一且稳定

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

// 方式 3：使用 sessionStorage（保持刷新后不变）
let pageId = sessionStorage.getItem('pageId');
if (!pageId) {
    pageId = 'page-' + Date.now();
    sessionStorage.setItem('pageId', pageId);
}
```

### 5. 调试 Worker 控制台

Worker 的 `console.log` 不会显示在页面控制台，需要：

**Chrome/Edge：**
1. 打开页面
2. 开发者工具 → Application → Shared Workers
3. 点击 `share.js` → 查看 Worker 控制台

**或访问：** `chrome://inspect/#workers`

---

## 常见问题

### Q1: 为什么页面收不到消息？

**可能原因：**
1. 未调用 `port.start()`
2. 未发送 `register` 消息
3. 使用了 `file://` 协议
4. Worker 脚本路径错误

**解决方案：**
```javascript
// 确保这三步顺序正确
port.start();                    // 1. 启动端口
port.onmessage = (msg) => {};    // 2. 注册监听器
port.postMessage({type: 'register', pageId: 'xxx'});  // 3. 注册页面
```

### Q2: 页面刷新后连接数翻倍？

**原因：** 使用了 `Set` 存储连接，无法去重。

**解决方案：** 使用 `Map`，以 `pageId` 为 key：
```javascript
const connections = new Map();  // ✓ 正确
// const connections = new Set();  // ✗ 错误
```

### Q3: 如何知道有哪些页面在线？

**Worker 端：**
```javascript
const onlinePages = Array.from(connections.keys());
console.log('在线页面:', onlinePages);
```

**发送给页面：**
```javascript
port.postMessage({
    type: 'online-list',
    pages: Array.from(connections.keys())
});
```

### Q4: 如何实现页面间的请求-响应模式？

**发送请求（页面 A）：**
```javascript
const requestId = Date.now();
port.postMessage({
    type: 'request',
    requestId: requestId,
    pageId: 'page-A',
    target: 'page-B',
    data: '请求数据'
});

// 等待响应
const responseHandler = (msg) => {
    if (msg.data.requestId === requestId) {
        console.log('收到响应:', msg.data);
        port.removeEventListener('message', responseHandler);
    }
};
port.addEventListener('message', responseHandler);
```

**处理请求并响应（页面 B）：**
```javascript
port.onmessage = (msg) => {
    if (msg.data.type === 'request') {
        // 处理请求
        const result = processRequest(msg.data.data);

        // 发送响应
        port.postMessage({
            type: 'response',
            requestId: msg.data.requestId,
            pageId: 'page-B',
            target: msg.data.pageId,
            data: result
        });
    }
};
```

### Q5: 如何实现消息持久化？

SharedWorker 本身不支持持久化，可以结合 IndexedDB：

**Worker 端：**
```javascript
// 保存消息到 IndexedDB
port.onmessage = async (msg) => {
    if (msg.data.type === 'broadcast') {
        // 保存到数据库
        await saveMessageToDB(msg.data);

        // 广播给在线页面
        connections.forEach((conn) => {
            conn.postMessage(msg.data);
        });
    }
};

// 页面连接时发送历史消息
self.addEventListener('connect', async (e) => {
    const port = e.ports[0];

    // ... 注册逻辑 ...

    // 发送历史消息
    const history = await getMessagesFromDB();
    port.postMessage({
        type: 'history',
        data: history
    });
});
```

### Q6: 如何关闭 SharedWorker？

SharedWorker 会在所有页面关闭后自动终止，无法手动关闭。

**强制终止（仅用于开发调试）：**
1. 关闭所有相关页面
2. 刷新页面重新加载 Worker

---

## 浏览器兼容性

| 浏览器 | 版本 | 支持情况 |
|--------|------|----------|
| Chrome | 4+ | 完全支持 |
| Edge | 79+ | 完全支持 |
| Firefox | 29+ | 完全支持 |
| Safari | 5+ (需开启实验性功能) | 部分支持 |
| Opera | 10.6+ | 完全支持 |
| IE | 不支持 | 不支持 |

**检测支持性：**
```javascript
if (typeof SharedWorker !== 'undefined') {
    console.log('浏览器支持 SharedWorker');
} else {
    console.log('浏览器不支持 SharedWorker');
    // 降级方案：使用 BroadcastChannel 或 localStorage
}
```

**降级方案：**

如果浏览器不支持 SharedWorker，可以使用以下替代方案：

1. **BroadcastChannel**（现代浏览器）
2. **localStorage + storage 事件**（兼容性好）
3. **Service Worker + MessageChannel**（离线支持）
4. **WebSocket**（需要服务器）

---

## 项目结构

```
shareWorker/
├── share.js          # Worker 脚本
├── pagesA.html       # 页面 A
├── pagesB.html       # 页面 B
├── index.html        # 入口页面（可选）
└── README.md         # 本文档
```

---

## 许可证

MIT License

---

## 参考资料

- [MDN - SharedWorker](https://developer.mozilla.org/zh-CN/docs/Web/API/SharedWorker)
- [MDN - Web Workers API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API)
- [HTML Living Standard - SharedWorker](https://html.spec.whatwg.org/multipage/workers.html#shared-workers)
