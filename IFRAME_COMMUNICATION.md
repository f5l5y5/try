# Iframe 通讯系统文档

## 项目概述

本项目实现了一个完整的 iframe 跨窗口通讯系统，使用 `postMessage` API 实现父页面与子 iframe 之间，以及子 iframe 之间的双向通讯。

### 技术栈

- **父页面**: 原生 HTML/JavaScript
- **子页面**: Vue 3 + Vue Router
- **通讯协议**: window.postMessage API
- **开发工具**: Vite

---

## 系统架构

### 文件结构

```
try/
├── html/
│   ├── iframe.html          # 父页面（通讯中心）
│   ├── iframe1.html         # 静态示例页面 1（未使用）
│   └── iframe2.html         # 静态示例页面 2（未使用）
├── src/
│   ├── views/
│   │   ├── Home.vue         # 子页面 1 - Home（作为 iframe1）
│   │   └── About.vue        # 子页面 2 - About（作为 iframe2）
│   ├── router/
│   │   └── index.js         # Vue Router 配置
│   ├── App.vue              # Vue 根组件
│   └── main.js              # Vue 入口文件
└── package.json             # 项目依赖
```

### 通讯架构图

```
┌─────────────────────────────────────────────────────┐
│              父页面 (iframe.html)                    │
│  - 接收并转发所有子页面之间的消息                    │
│  - 可以主动向任意子页面发送消息                      │
│  - 显示所有通讯日志                                  │
└─────────────┬───────────────────────┬───────────────┘
              │                       │
      ┌───────▼────────┐      ┌──────▼────────┐
      │   Iframe 1     │      │   Iframe 2    │
      │  (Home 页面)   │◄────►│ (About 页面)  │
      │ localhost:5173 │      │ localhost:5173│
      │    /home       │      │    /about     │
      └────────────────┘      └───────────────┘
          - 发送消息              - 发送消息
          - 接收消息              - 接收消息
          - 显示日志              - 显示日志
```

---

## 通讯流程详解

### 1. 父页面 → 子页面通讯

**发送端（父页面）：**
```javascript
// 发送到指定 iframe
iframe1.contentWindow.postMessage({
    from: 'Parent (父页面)',
    message: '消息内容'
}, '*');
```

**接收端（子页面 - Vue）：**
```javascript
// 在 Vue 组件中监听消息
window.addEventListener('message', function(event) {
    if (event.data && event.data.message) {
        addLog(event.data.from, event.data.message)
    }
});
```

### 2. 子页面 → 父页面通讯

**发送端（子页面 - Vue）：**
```javascript
// 从子页面发送消息到父页面
window.parent.postMessage({
    target: 'parent',
    from: 'Home (iframe1)',
    message: '消息内容'
}, '*');
```

**接收端（父页面）：**
```javascript
// 父页面监听消息
window.addEventListener('message', function(event) {
    if (event.data.target === 'parent') {
        console.log('父页面处理消息:', event.data.message);
        // 在页面上显示日志
    }
});
```

### 3. 子页面 ↔ 子页面通讯（通过父页面转发）

**场景：Iframe 1 发送消息给 Iframe 2**

#### 步骤 1: Iframe 1 发送消息到父页面
```javascript
// Iframe 1 (Home.vue)
window.parent.postMessage({
    target: 'iframe2',
    from: 'Home (iframe1)',
    message: '你好，Iframe 2'
}, '*');
```

#### 步骤 2: 父页面接收并转发
```javascript
// 父页面 (iframe.html)
window.addEventListener('message', function(event) {
    if (event.data.target === 'iframe2') {
        // 转发给 iframe2
        iframe2.contentWindow.postMessage(event.data, '*');
    }
});
```

#### 步骤 3: Iframe 2 接收消息
```javascript
// Iframe 2 (About.vue)
window.addEventListener('message', function(event) {
    if (event.data && event.data.message) {
        // 显示接收到的消息
        addLog(event.data.from, event.data.message)
    }
});
```

---

## 消息数据格式

### 标准消息格式

```typescript
interface Message {
    target?: string;    // 目标：'iframe1' | 'iframe2' | 'parent'
    from: string;       // 发送者标识
    message: string;    // 消息内容
}
```

### 示例

```javascript
// Iframe 间通讯
{
    target: 'iframe2',
    from: 'Home (iframe1)',
    message: 'Hello from Home'
}

// 发送给父页面
{
    target: 'parent',
    from: 'About (iframe2)',
    message: 'Hello from About'
}

// 父页面发送（无需 target）
{
    from: 'Parent (父页面)',
    message: 'Hello from Parent'
}
```

---

## 使用指南

### 启动项目

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```
   - Vue 应用会运行在 `http://localhost:5173`

3. **打开测试页面**
   - 直接在浏览器中打开 `html/iframe.html`
   - 或者配置本地服务器访问

### 测试通讯功能

#### 测试场景 1: 父页面向子页面发送消息

1. 在父页面的橙色输入框中输入消息
2. 点击 "发送到 Iframe 1 (Home)" 或 "发送到 Iframe 2 (About)"
3. 观察对应子页面的接收日志

#### 测试场景 2: 子页面向父页面发送消息

1. 在任一子页面的输入框中输入消息
2. 点击 "发送到父页面" 按钮
3. 观察父页面的绿色日志区域

#### 测试场景 3: 子页面之间通讯

1. 在 Home 页面输入消息
2. 点击 "发送到 About 页面" 按钮
3. 观察 About 页面的接收日志
4. 反向测试同理

#### 测试场景 4: 广播消息

1. 在父页面输入框中输入消息
2. 点击 "广播到所有 Iframe" 按钮
3. 观察两个子页面都收到相同消息

### 快捷键

- **回车键**: 在父页面输入框按回车，自动广播消息到所有子页面
- **回车键**: 在子页面输入框按回车，发送消息到对方子页面

---

## API 文档

### 父页面 API

#### `sendMessageToIframe1()`
向 Iframe 1 (Home) 发送消息

**参数**: 无（从输入框读取）

**返回**: void

**示例**:
```javascript
sendMessageToIframe1()
```

#### `sendMessageToIframe2()`
向 Iframe 2 (About) 发送消息

**参数**: 无（从输入框读取）

**返回**: void

#### `sendMessageToAll()`
广播消息到所有子 iframe

**参数**: 无（从输入框读取）

**返回**: void

#### `sendToIframe1(message)` 和 `sendToIframe2(message)`
控制台专用函数，可直接传递消息

**参数**:
- `message` (string): 要发送的消息内容

**示例**:
```javascript
// 在浏览器控制台中使用
sendToIframe1("测试消息")
sendToIframe2("另一条测试消息")
```

### 子页面 API (Vue)

#### `sendToAbout()` / `sendToHome()`
发送消息到另一个子页面

**参数**: 无（使用组件内部状态）

**返回**: void

#### `sendToParent()`
发送消息到父页面

**参数**: 无（使用组件内部状态）

**返回**: void

#### `addLog(from, message)`
添加消息日志

**参数**:
- `from` (string): 消息来源
- `message` (string): 消息内容

**返回**: void

---

## 核心代码说明

### 父页面核心逻辑

```javascript
// 1. 监听来自子页面的消息
window.addEventListener('message', function(event) {
    // 记录日志
    logMessage(event.data);

    // 根据目标转发消息
    if (event.data.target === 'iframe1') {
        iframe1.contentWindow.postMessage(event.data, '*');
    } else if (event.data.target === 'iframe2') {
        iframe2.contentWindow.postMessage(event.data, '*');
    }
});

// 2. 主动发送消息
function sendMessageToIframe1() {
    iframe1.contentWindow.postMessage({
        from: 'Parent',
        message: messageInput.value
    }, '*');
}
```

### Vue 子页面核心逻辑

```javascript
// 1. 在 onMounted 时添加监听器
onMounted(() => {
    window.addEventListener('message', handleMessage)
})

// 2. 处理接收到的消息
const handleMessage = (event) => {
    if (event.data && event.data.message) {
        addLog(event.data.from, event.data.message)
    }
}

// 3. 发送消息
const sendToParent = () => {
    window.parent.postMessage({
        target: 'parent',
        from: 'Home (iframe1)',
        message: messageInput.value
    }, '*')
}

// 4. 清理监听器
onUnmounted(() => {
    window.removeEventListener('message', handleMessage)
})
```

---

## 安全性说明

### 当前配置

```javascript
// 使用通配符 '*' 允许任何源
postMessage(data, '*')
```

### 生产环境建议

在生产环境中，应该指定明确的源：

```javascript
// 仅允许特定域名
postMessage(data, 'http://localhost:5173')

// 在接收端验证消息来源
window.addEventListener('message', function(event) {
    // 验证来源
    if (event.origin !== 'http://localhost:5173') {
        return; // 拒绝非法来源的消息
    }

    // 验证消息格式
    if (!event.data || typeof event.data.message !== 'string') {
        return;
    }

    // 处理消息
    handleMessage(event.data);
});
```

---

## 扩展功能建议

### 1. 消息类型系统

定义不同类型的消息：

```javascript
const MessageType = {
    TEXT: 'text',
    COMMAND: 'command',
    DATA: 'data'
}

// 发送时指定类型
postMessage({
    type: MessageType.COMMAND,
    from: 'iframe1',
    command: 'refresh',
    params: {}
}, '*')
```

### 2. 消息确认机制

实现消息的发送确认：

```javascript
// 发送消息并等待确认
function sendWithConfirmation(message) {
    const messageId = Date.now();

    window.parent.postMessage({
        id: messageId,
        message: message,
        requireConfirm: true
    }, '*');

    // 等待确认
    return new Promise((resolve) => {
        const handler = (event) => {
            if (event.data.confirmId === messageId) {
                window.removeEventListener('message', handler);
                resolve(event.data);
            }
        };
        window.addEventListener('message', handler);
    });
}
```

### 3. 消息队列

处理大量消息时的队列管理：

```javascript
class MessageQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    add(message) {
        this.queue.push(message);
        this.process();
    }

    async process() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        const message = this.queue.shift();

        // 发送消息
        await this.send(message);

        this.processing = false;
        this.process(); // 处理下一条
    }
}
```

### 4. 错误处理

添加完善的错误处理机制：

```javascript
function safePostMessage(target, data) {
    try {
        if (!target || !target.contentWindow) {
            throw new Error('Invalid target iframe');
        }

        target.contentWindow.postMessage(data, '*');
        return { success: true };

    } catch (error) {
        console.error('Failed to send message:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
```

---

## 调试技巧

### 1. 使用浏览器控制台

```javascript
// 查看所有发送的消息
console.log('发送消息:', messageData);

// 查看接收到的消息
window.addEventListener('message', (event) => {
    console.log('收到消息:', event);
    console.log('  来源:', event.origin);
    console.log('  数据:', event.data);
});
```

### 2. 消息追踪

在父页面添加全局消息追踪：

```javascript
const messageHistory = [];

window.addEventListener('message', (event) => {
    messageHistory.push({
        timestamp: Date.now(),
        from: event.origin,
        data: event.data
    });

    console.table(messageHistory);
});
```

### 3. 检查 iframe 加载状态

```javascript
iframe1.addEventListener('load', () => {
    console.log('Iframe 1 已加载完成');
});

iframe2.addEventListener('load', () => {
    console.log('Iframe 2 已加载完成');
});
```

---

## 常见问题

### Q1: 消息发送后子页面没有接收到？

**可能原因**:
- 子页面还未完全加载
- 监听器未正确注册
- 消息格式不正确

**解决方案**:
```javascript
// 确保 iframe 加载完成后再发送
iframe1.addEventListener('load', () => {
    sendMessageToIframe1();
});

// 或者添加延迟
setTimeout(() => {
    sendMessageToIframe1();
}, 1000);
```

### Q2: 如何知道消息是从哪个 iframe 发送的？

**解决方案**:
在消息中包含发送者标识：
```javascript
postMessage({
    from: 'Home (iframe1)',  // 明确标识来源
    message: '内容'
}, '*');
```

### Q3: 跨域情况下如何处理？

**解决方案**:
```javascript
// 发送端指定目标域
postMessage(data, 'https://example.com');

// 接收端验证来源
if (event.origin === 'https://example.com') {
    // 处理消息
}
```

### Q4: 如何处理大量数据传输？

**解决方案**:
- 使用数据分片
- 考虑使用 `SharedWorker` 或 `BroadcastChannel`
- 对于大数据，使用 `Blob` URL

---

## 性能优化

### 1. 节流发送

```javascript
const throttle = (func, delay) => {
    let timeout = null;
    return function(...args) {
        if (!timeout) {
            timeout = setTimeout(() => {
                func.apply(this, args);
                timeout = null;
            }, delay);
        }
    };
};

const throttledSend = throttle(sendMessage, 300);
```

### 2. 消息去重

```javascript
const sentMessages = new Set();

function sendUnique(message) {
    const hash = JSON.stringify(message);
    if (sentMessages.has(hash)) {
        return; // 已发送过
    }
    sentMessages.add(hash);
    postMessage(message, '*');
}
```

---

## 总结

本系统实现了一个完整的 iframe 通讯架构，具有以下特点：

✅ **双向通讯**: 父页面 ↔ 子页面
✅ **中转转发**: 子页面间通过父页面转发
✅ **实时日志**: 所有通讯都有日志记录
✅ **友好界面**: 清晰的 UI 展示通讯状态
✅ **扩展性强**: 易于添加新的通讯模式

通过本系统，你可以学习和实践：
- `postMessage` API 的使用
- iframe 跨窗口通讯
- Vue 3 与原生 JS 的交互
- 消息转发机制
- 前端架构设计

---

## 相关资源

- [MDN - Window.postMessage()](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)
- [Vue 3 文档](https://cn.vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/zh/)
