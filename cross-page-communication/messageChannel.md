# MessageChannel 跨页面通讯

## 1. 什么是 MessageChannel

MessageChannel 是 HTML5 引入的 API，用于创建一个双向通信通道，允许两个不同的执行上下文（如主页面和 iframe、Worker 等）之间进行高效、安全的通信。它创建了两个端口（port1 和 port2），通过这两个端口可以进行双向通信。

## 2. 基本语法

```javascript
// 创建 MessageChannel
const channel = new MessageChannel();

// 获取两个端口
const port1 = channel.port1;
const port2 = channel.port2;

// 发送消息
port1.postMessage(message, [transfer]);

// 接收消息
port2.onmessage = (event) => {
  // 处理消息
};

// 监听错误
port2.onerror = (error) => {
  // 处理错误
};

// 关闭端口
port1.close();
port2.close();
```

### 参数说明

- **message**: 要发送的数据，可以是任何能够通过结构化克隆算法序列化的值
- **transfer** (可选): 是一串和 message 同时传递的 Transferable 对象，这些对象的所有权将被转移给消息的接收方

## 3. 核心概念

1. **双向通道**: MessageChannel 创建的是双向通信通道，两个端口可以互相发送和接收消息
2. **端口传递**: 一个端口可以通过 postMessage 传递给另一个执行上下文
3. **同源限制**: 通常用于同源通信，但也可以通过 postMessage 实现跨域通信
4. **异步通信**: 消息传递是异步的，不会阻塞主线程
5. **高效传输**: 支持 Transferable 对象，可以高效传输大数据

## 4. 工作原理

1. 创建 MessageChannel 实例时，会自动创建两个关联的端口（port1 和 port2）
2. 一个端口保留在当前上下文，另一个端口通过 postMessage 传递给目标上下文
3. 两个上下文可以通过各自的端口发送和接收消息
4. 消息在两个端口之间直接传递，不需要经过中间层

## 5. 应用场景

- 主页面与 iframe 之间的双向通信
- Web Workers 之间的通信
- Service Workers 与页面之间的通信
- 复杂应用中不同模块之间的通信
- 需要高效传输大数据的场景

## 6. 浏览器兼容性

| 浏览器 | 版本 |
|--------|------|
| Chrome | 4+ |
| Firefox | 4+ |
| Safari | 5+ |
| Edge | 12+ |
| IE | 10+ |

## 7. 实践案例说明

本案例演示了 MessageChannel 在三种通讯场景下的应用：

### 7.1 父子通讯（主页面 → iframe）

- **主页面** (`messageChannel.html`):
  - 创建两个 MessageChannel 实例，分别用于与两个 iframe 通信
  - 保留 port1 用于发送和接收消息
  - 通过 postMessage 将 port2 传递给对应的 iframe
  - 提供输入框和按钮，用于向 iframe 发送消息
  - 明确标识为父子通讯

- **iframe 页面** (`messageChannel-iframe.html?child=1` 和 `messageChannel-iframe.html?child=2`):
  - 接收主页面传递的 port2
  - 使用 port2 接收来自主页面的消息
  - 区分显示父子通讯的消息

### 7.2 子父通讯（iframe → 主页面）

- **iframe 页面** (`messageChannel-iframe.html?child=1` 和 `messageChannel-iframe.html?child=2`):
  - 提供输入框和按钮，用于向主页面发送消息
  - 使用 port2 发送消息
  - 明确标识为子父通讯

- **主页面** (`messageChannel.html`):
  - 接收并显示来自 iframe 的消息
  - 区分显示不同 iframe 发送的消息

### 7.3 兄弟通讯（iframe → iframe）

- **iframe 页面** (`messageChannel-iframe.html?child=1` 和 `messageChannel-iframe.html?child=2`):
  - 提供选择兄弟 iframe 的下拉菜单
  - 可以向指定的兄弟 iframe 发送消息
  - 使用 port2 将消息发送到主页面
  - 明确标识为兄弟通讯

- **主页面** (`messageChannel.html`):
  - 作为消息中介，转发兄弟 iframe 之间的消息
  - 显示消息转发日志

## 8. 运行方式

1. 在浏览器中打开 `messageChannel.html`
2. 等待两个 iframe 加载完成，观察状态变为 "所有 iframe 连接已建立"

3. **父子通讯测试**：
   - 在主页面输入框中输入消息
   - 选择目标 iframe（或选择"发送到所有 iframe"）
   - 点击"发送"，在相应的 iframe 中可以看到接收到的消息

4. **子父通讯测试**：
   - 在任意 iframe 输入框中输入消息
   - 点击"发送给主页面"，在主页面可以看到接收到的消息

5. **兄弟通讯测试**：
   - 在 iframe 1 中输入消息
   - 选择"发送到 iframe 2"
   - 点击"发送给兄弟iframe"，在 iframe 2 中可以看到接收到的消息
   - 同样可以从 iframe 2 向 iframe 1 发送消息

6. **观察通讯类型标识**：
   - 每种通讯类型（父子、子父、兄弟）都有不同的颜色标识
   - 可以清晰地看到消息的发送者、接收者和通讯类型

7. **注意事项**：
   - 每个 iframe 都有自己独立的 MessageChannel 连接
   - 主页面负责管理和转发兄弟 iframe 之间的消息
   - 消息传递是实时的，不需要轮询

## 9. 代码示例

### 主页面代码

```javascript
// 创建 MessageChannel
const channel = new MessageChannel();
const port1 = channel.port1;

// 监听来自 iframe 的消息
port1.onmessage = (event) => {
  console.log('从 iframe 收到消息:', event.data);
};

// 发送消息到 iframe
document.getElementById('sendBtn').addEventListener('click', () => {
  const message = document.getElementById('messageInput').value;
  port1.postMessage(message);
});

// 将 port2 传递给 iframe
iframe.contentWindow.postMessage('init', '*', [channel.port2]);
```

### iframe 代码

```javascript
let port2;

// 接收主页面传递的 port2
window.addEventListener('message', (event) => {
  if (event.data === 'init' && event.ports && event.ports.length > 0) {
    port2 = event.ports[0];
    
    // 监听来自主页面的消息
    port2.onmessage = (e) => {
      console.log('从主页面收到消息:', e.data);
    };
  }
});

// 发送消息到主页面
document.getElementById('sendBtn').addEventListener('click', () => {
  const message = document.getElementById('messageInput').value;
  port2.postMessage(message);
});
```

## 10. 与 postMessage 的区别

| 特性 | MessageChannel | postMessage |
|------|----------------|-------------|
| 通信方式 | 双向通道 | 单向发送 |
| 端口数量 | 2个关联端口 | 无端口概念 |
| 消息传递 | 直接在端口间传递 | 需要指定目标窗口 |
| 传输效率 | 支持 Transferable 对象，效率更高 | 不支持 Transferable 对象 |
| 适用场景 | 频繁双向通信 | 简单的单向通信 |
| API 复杂度 | 稍复杂 | 简单 |

## 11. 优缺点

### 优点
- 双向通信，使用简单
- 支持 Transferable 对象，高效传输大数据
- 安全可靠，端口机制提供了良好的隔离
- 异步通信，不阻塞主线程
- 浏览器兼容性好

### 缺点
- 需要手动管理端口
- 跨域通信时需要额外的安全验证
- 对于简单通信场景，API 相对复杂

## 12. 最佳实践

1. **及时关闭端口**: 在通信结束或页面卸载时，关闭不再使用的端口，释放资源
2. **处理错误**: 添加 onerror 事件监听器，处理可能出现的错误
3. **验证消息格式**: 接收消息时验证数据格式，确保安全性
4. **使用 Transferable 对象**: 对于大数据传输，使用 Transferable 对象提高效率
5. **合理设计消息结构**: 设计清晰的消息结构，包含类型、数据等字段，便于处理

## 13. 注意事项

1. **端口只能使用一次**: 一个端口只能用于一个通信通道，不能重复使用
2. **端口传递后才能通信**: 只有当端口被传递到目标上下文后，才能开始通信
3. **同源限制**: 通常用于同源通信，跨域通信需要额外配置
4. **结构化克隆限制**: 某些类型的数据（如函数、DOM 节点等）不能通过结构化克隆算法序列化
5. **错误处理**: 端口错误会触发 onerror 事件，需要妥善处理

## 14. Transferable 对象

MessageChannel 支持传输 Transferable 对象，这些对象的所有权会从发送方转移到接收方，发送方将不再拥有该对象的访问权。支持的 Transferable 对象包括：

- ArrayBuffer
- MessagePort
- ImageBitmap
- OffscreenCanvas

使用 Transferable 对象可以大幅提高大数据传输的效率，避免不必要的数据复制。

```javascript
// 创建一个大的 ArrayBuffer
const buffer = new ArrayBuffer(1024 * 1024); // 1MB

// 使用 Transferable 对象发送
port1.postMessage(buffer, [buffer]);
```

## 15. 与其他通信方式的比较

| 特性 | MessageChannel | BroadcastChannel | localStorage | SharedWorker |
|------|----------------|------------------|--------------|--------------|
| 通信模式 | 点对点双向 | 广播 | 广播（通过事件） | 点对点/广播 |
| 端口概念 | 有 | 无 | 无 | 有 |
| Transferable 对象支持 | 是 | 否 | 否 | 是 |
| 适用场景 | 频繁双向通信 | 多页面广播 | 简单状态同步 | 复杂后台处理 |
| API 复杂度 | 中等 | 简单 | 简单 | 复杂 |
| 性能 | 高 | 中 | 低 | 高 |