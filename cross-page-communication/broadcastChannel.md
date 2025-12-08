# BroadcastChannel 跨页面通讯

## 1. 什么是 BroadcastChannel

BroadcastChannel 是 HTML5 引入的 API，允许同源下的不同浏览器上下文（如不同标签页、iframe、Worker）之间进行简单的广播通信。它提供了一种在同源环境下实现多页面实时通信的机制。

## 2. 基本语法

```javascript
// 创建或获取广播频道
const channel = new BroadcastChannel(channelName);

// 发送消息
channel.postMessage(message);

// 接收消息
channel.onmessage = (event) => {
  // 处理消息
};

// 监听错误
channel.onerror = (error) => {
  // 处理错误
};

// 关闭频道
channel.close();
```

### 参数说明

- **channelName**: 字符串，标识广播频道的名称。相同名称的频道会被自动关联起来
- **message**: 要发送的数据，可以是任何能够通过结构化克隆算法序列化的值

## 3. 事件对象属性

当通过 `onmessage` 事件接收消息时，事件对象包含以下属性：

- **data**: 从其他上下文传递过来的数据
- **origin**: 发送消息的上下文的源（协议+域名+端口）
- **lastEventId**: 事件的唯一标识符

## 4. 核心特性

1. **自动关联**: 相同名称的 BroadcastChannel 实例会自动关联，无需手动建立连接
2. **广播机制**: 消息会发送给所有订阅了该频道的上下文
3. **同源限制**: 只能在同源页面之间通信
4. **简单易用**: API 设计简洁，易于理解和使用
5. **异步通信**: 消息传递是异步的，不会阻塞主线程

## 5. 应用场景

- 多标签页状态同步
- 实时通知系统
- 协作编辑应用
- 跨标签页数据共享
- 会话管理

## 6. 浏览器兼容性

| 浏览器 | 版本 |
|--------|------|
| Chrome | 54+ |
| Firefox | 38+ |
| Safari | 15.4+ |
| Edge | 79+ |
| IE | 不支持 |

## 7. 实践案例说明

本案例演示了 BroadcastChannel 在三种通讯场景下的应用：

### 7.1 父子通讯（主页面 → iframe）

- **主页面** (`broadcastChannel.html`):
  - 提供输入框和发送按钮
  - 可以发送广播消息
  - 所有子页面（iframe）都能收到广播
  - 明确标识为父子通讯

- **iframe 页面** (`broadcastChannel.html?child=1` 和 `broadcastChannel.html?child=2`):
  - 接收并显示来自主页面的广播消息
  - 区分显示父子通讯的消息

### 7.2 子父通讯（iframe → 主页面）

- **iframe 页面** (`broadcastChannel.html?child=1` 和 `broadcastChannel.html?child=2`):
  - 提供输入框和发送按钮
  - 可以发送广播消息
  - 明确标识为子父通讯

- **主页面** (`broadcastChannel.html`):
  - 接收并显示来自 iframe 的广播消息
  - 区分显示不同 iframe 发送的消息

### 7.3 兄弟通讯（iframe → iframe）

- **iframe 页面** (`broadcastChannel.html?child=1` 和 `broadcastChannel.html?child=2`):
  - 可以向其他兄弟 iframe 发送广播消息
  - 明确标识为兄弟通讯

- **效果**：
  - 当 iframe 1 发送广播时，iframe 2 能收到消息
  - 当 iframe 2 发送广播时，iframe 1 能收到消息
  - 所有 iframe 都能收到兄弟发送的广播

## 8. 运行方式

1. 在浏览器中打开 `broadcastChannel.html`
2. **父子通讯测试**：
   - 在主页面输入框中输入消息
   - 点击"发送广播"，所有 iframe 中都可以看到接收到的消息

3. **子父通讯测试**：
   - 在任意 iframe 输入框中输入消息
   - 点击"发送广播"，在主页面可以看到接收到的消息

4. **兄弟通讯测试**：
   - 在 iframe 1 中输入消息
   - 点击"发送广播"，在 iframe 2 中可以看到接收到的消息
   - 同样可以从 iframe 2 向 iframe 1 发送消息

5. **观察通讯类型标识**：
   - 每种通讯类型（父子、子父、兄弟）都有不同的颜色标识
   - 可以清晰地看到消息的发送者、接收者和通讯类型

6. **多标签页测试**：
   - 在新的浏览器标签页中打开 `broadcastChannel.html`
   - 在一个标签页中发送广播，所有标签页都能收到消息
   - 可以观察到跨标签页的广播效果

7. **关闭频道测试**：
   - 点击"关闭频道"可以关闭当前页面的广播频道
   - 关闭后无法再发送或接收消息

## 9. 代码示例

### 创建和使用 BroadcastChannel

```javascript
// 创建广播频道
const channel = new BroadcastChannel('my_channel');

// 发送消息
channel.postMessage({
  type: 'update',
  data: { username: '张三', timestamp: Date.now() }
});

// 接收消息
channel.onmessage = (event) => {
  console.log('收到消息:', event.data);
  // 处理消息逻辑
};

// 关闭频道（页面卸载时）
window.addEventListener('beforeunload', () => {
  channel.close();
});
```

## 10. 优缺点

### 优点
- API 简单易用，学习成本低
- 自动管理连接，无需手动维护
- 支持广播到所有同源上下文
- 异步通信，性能良好
- 支持复杂数据结构

### 缺点
- 仅支持同源通信
- 浏览器兼容性有限（特别是 Safari 15.4+ 才支持）
- 无法发送 Transferable 对象
- 缺乏消息确认机制
- 无法指定特定接收者

## 11. 与其他通信方式的比较

| 特性 | BroadcastChannel | postMessage | localStorage | SharedWorker |
|------|------------------|-------------|--------------|--------------|
| 同源限制 | 是 | 否 | 是 | 是 |
| 多页面广播 | 是 | 否（需手动实现） | 是（通过 storage 事件） | 是 |
| API 复杂度 | 简单 | 中等 | 简单 | 复杂 |
| 浏览器兼容性 | 较好 | 优秀 | 优秀 | 中等 |
| 消息大小限制 | 无明确限制 | 无明确限制 | 约 5MB | 无明确限制 |
| 支持 Transferable 对象 | 否 | 是 | 否 | 是 |

## 12. 最佳实践

1. **使用唯一频道名称**: 为不同的应用或功能使用不同的频道名称，避免消息冲突
2. **添加消息类型**: 在消息中包含类型字段，便于区分不同类型的消息
3. **处理页面卸载**: 在页面卸载前关闭频道，释放资源
4. **添加错误处理**: 监听 `onerror` 事件，处理可能出现的错误
5. **验证消息格式**: 接收消息时验证数据格式，确保安全性
6. **考虑兼容性**: 对于需要支持旧浏览器的应用，可以考虑使用其他通信方式作为 fallback

## 13. 注意事项

1. **消息不会发送给自己**: 调用 `postMessage` 的上下文不会收到自己发送的消息
2. **频道是轻量级的**: 创建多个相同名称的频道实例不会产生额外开销
3. **关闭频道后无法重用**: 关闭频道后，需要重新创建实例才能继续使用
4. **不支持跨浏览器通信**: 只能在同一个浏览器的不同上下文之间通信
5. **隐私模式限制**: 在某些浏览器的隐私模式下，BroadcastChannel 可能无法正常工作