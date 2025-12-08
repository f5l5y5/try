# postMessage 跨页面通讯

## 1. 什么是 postMessage

postMessage 是 HTML5 引入的 API，允许来自不同源的脚本采用异步方式进行有限的通信，可以实现跨窗口、跨域的消息传递。

## 2. 基本语法

```javascript
// 发送消息
otherWindow.postMessage(message, targetOrigin, [transfer]);

// 接收消息
window.addEventListener('message', (event) => {
  // 处理消息
});
```

### 参数说明

- **otherWindow**: 接收消息的窗口对象，如 iframe.contentWindow、window.open 返回的窗口对象等
- **message**: 要发送的数据，可以是任何能够通过结构化克隆算法序列化的值
- **targetOrigin**: 目标窗口的源，格式为 `协议+域名+端口`，可以是 `*` 表示不限制源（不安全，生产环境不推荐）
- **transfer** (可选): 是一串和 message 同时传递的 Transferable 对象，这些对象的所有权将被转移给消息的接收方，而发送方将不再保留所有权

## 3. 事件对象属性

当通过 `message` 事件接收消息时，事件对象包含以下属性：

- **data**: 从其他窗口传递过来的数据
- **origin**: 发送消息的窗口的源（协议+域名+端口）
- **source**: 发送消息的窗口对象的引用

## 4. 安全性考虑

1. **始终验证 origin**: 在接收消息时，应该验证发送方的 origin，只处理来自可信源的消息
2. **限制 targetOrigin**: 发送消息时，尽量使用具体的 origin 而不是 `*`
3. **验证消息格式**: 对接收到的消息进行格式验证，确保是预期的数据结构

## 5. 应用场景

- 跨域 iframe 通信
- 多窗口通信
- 浏览器扩展与网页通信
- Web Workers 通信

## 6. 浏览器兼容性

| 浏览器 | 版本 |
|--------|------|
| Chrome | 1.0+ |
| Firefox | 3.0+ |
| Safari | 4.0+ |
| Edge | 12.0+ |
| IE | 8.0+ |

## 7. 实践案例说明

本案例演示了 postMessage 在三种通讯场景下的应用：

### 7.1 父子通讯（主页面 → iframe）

- **主页面** (`postMessage.html`):
  - 提供输入框和发送按钮
  - 可以向一个或多个 iframe 发送消息
  - 支持选择目标 iframe
  - 接收并显示来自 iframe 的消息

- **iframe 页面** (`postMessage-iframe.html`):
  - 接收并显示来自主页面的消息
  - 区分显示父子通讯的消息

### 7.2 子父通讯（iframe → 主页面）

- **iframe 页面** (`postMessage-iframe.html`):
  - 提供输入框和发送按钮
  - 可以向主页面发送消息
  - 明确标识为子父通讯

- **主页面** (`postMessage.html`):
  - 接收并显示来自 iframe 的消息
  - 区分显示不同 iframe 发送的消息

### 7.3 兄弟通讯（iframe → iframe）

- **iframe 页面** (`postMessage-iframe.html`):
  - 提供选择兄弟 iframe 的下拉菜单
  - 可以向指定的兄弟 iframe 发送消息
  - 明确标识为兄弟通讯

- **主页面** (`postMessage.html`):
  - 作为消息中介，转发兄弟 iframe 之间的消息
  - 显示消息转发日志

## 8. 运行方式

1. 在浏览器中打开 `postMessage.html`
2. **父子通讯测试**：
   - 在主页面输入框中输入消息，选择目标 iframe（或选择"发送到所有 iframe"）
   - 点击"设置 iframe window.name"，在相应的 iframe 中可以看到接收到的消息

3. **子父通讯测试**：
   - 在任意 iframe 输入框中输入消息
   - 点击"发送给主页面"，在主页面可以看到接收到的消息

4. **兄弟通讯测试**：
   - 在 iframe 1 中输入消息
   - 选择"发送到 iframe 2"
   - 点击"发送给兄弟iframe"，在 iframe 2 中可以看到接收到的消息
   - 同样可以从 iframe 2 向 iframe 1 发送消息

5. **观察通讯类型标识**：
   - 每种通讯类型（父子、子父、兄弟）都有不同的颜色标识
   - 可以清晰地看到消息的发送者、接收者和通讯类型

## 9. 代码示例

### 主页面发送消息

```javascript
const iframe = document.getElementById('targetIframe');
iframe.contentWindow.postMessage('Hello from parent!', '*');
```

### 主页面接收消息

```javascript
window.addEventListener('message', (event) => {
  // 验证来源
  if (event.origin === 'http://example.com') {
    console.log('Received message:', event.data);
  }
});
```

### iframe 发送消息

```javascript
window.parent.postMessage('Hello from iframe!', '*');
```

### iframe 接收消息

```javascript
window.addEventListener('message', (event) => {
  // 验证来源
  if (event.origin === 'http://example.com') {
    console.log('Received message:', event.data);
  }
});
```

## 10. 优缺点

### 优点
- 支持跨域通信
- 可以传递复杂数据结构
- 异步通信，不阻塞主线程
- 浏览器兼容性好

### 缺点
- 安全性需要额外注意
- 调试相对复杂
- 消息传递是单向的，需要双方都实现消息处理逻辑