# SharedWorker 跨页面通讯

## 1. 什么是 SharedWorker

SharedWorker 是 Web Workers API 的一部分，用于创建可以被多个同源页面共享的后台线程。与普通 Web Worker 不同，SharedWorker 可以同时被多个页面访问，实现了真正的跨页面通讯。

## 2. 基本语法

### 主线程代码

```javascript
// 创建或连接到 SharedWorker
const worker = new SharedWorker('worker.js');

// 发送消息
worker.port.postMessage(message);

// 接收消息
worker.port.onmessage = (event) => {
  // 处理消息
};

// 监听错误
worker.port.onerror = (error) => {
  // 处理错误
};

// 启动连接
worker.port.start();

// 关闭连接
worker.port.close();
```

### SharedWorker 代码

```javascript
// 处理新连接
self.onconnect = (event) => {
  const port = event.ports[0];
  
  // 接收消息
  port.onmessage = (event) => {
    // 处理消息
  };
  
  // 发送消息
  port.postMessage(message);
  
  // 启动端口
  port.start();
};
```

## 3. 核心特性

1. **多页面共享**: 可以被多个同源页面同时访问
2. **后台运行**: 在后台线程中运行，不阻塞主线程
3. **持久存在**: 只要有页面连接，就会一直运行
4. **消息传递**: 通过 MessagePort 进行双向通信
5. **同源限制**: 只能在同源页面之间通信
6. **单例模式**: 同一个 URL 的 SharedWorker 只会创建一个实例

## 4. 工作原理

1. 当第一个页面创建 SharedWorker 时，浏览器会启动一个新的后台线程
2. 当其他页面连接到同一个 SharedWorker 时，它们会共享同一个后台线程
3. 每个页面通过 MessagePort 与 SharedWorker 进行通信
4. SharedWorker 可以通过这些端口向所有连接的页面发送消息
5. 当所有页面都断开连接时，SharedWorker 会被终止

## 5. 应用场景

- 多标签页实时通讯
- 实时数据同步
- 协作编辑应用
- 实时聊天系统
- 后台数据处理
- 共享缓存管理

## 6. 浏览器兼容性

| 浏览器 | 版本 |
|--------|------|
| Chrome | 4+ |
| Firefox | 29+ |
| Safari | 16.4+ |
| Edge | 79+ |
| IE | 不支持 |

## 7. 实践案例说明

本案例演示了 SharedWorker 在父子、子父、兄弟通讯场景下的应用：

1. **SharedWorker 核心** (`sharedWorker.js`):
   - 管理客户端连接
   - 处理消息广播
   - 支持点对点消息
   - 维护客户端列表
   - 处理连接和断开事件

2. **页面客户端** (`sharedWorker.html`):
   - 连接到 SharedWorker
   - 发送广播消息
   - 发送点对点消息
   - 显示连接状态
   - 显示客户端列表
   - 记录消息日志
   - 支持父子、子父、兄弟三种通讯场景
   - 根据通讯类型显示不同颜色标识

## 8. 三种通讯场景说明

### 8.1 父子通讯

**定义**：主页面向 iframe 子页面发送消息。

**实现方式**：
- 主页面和 iframe 子页面共享同一个 SharedWorker
- 主页面通过 SharedWorker 发送广播或直接消息
- 子页面通过 SharedWorker 接收消息
- 消息日志显示为蓝色标识

**演示方法**：
1. 主页面输入消息，点击"发送广播"
2. 观察所有子页面（iframe）收到消息，日志显示为蓝色的"父子通讯"
3. 或主页面使用"发送到指定客户端"功能，输入子页面的客户端 ID
4. 观察指定子页面收到消息，日志显示为蓝色的"父子通讯"

### 8.2 子父通讯

**定义**：iframe 子页面向主页面发送消息。

**实现方式**：
- iframe 子页面和主页面共享同一个 SharedWorker
- 子页面通过 SharedWorker 发送广播或直接消息
- 主页面通过 SharedWorker 接收消息
- 消息日志显示为橙色标识

**演示方法**：
1. 在任意 iframe 子页面中输入消息，点击"发送广播"
2. 观察主页面和其他子页面收到消息，主页面日志显示为橙色的"子父通讯"
3. 或子页面使用"发送到指定客户端"功能，输入主页面的客户端 ID
4. 观察主页面收到消息，日志显示为橙色的"子父通讯"

### 8.3 兄弟通讯

**定义**：一个 iframe 子页面向另一个 iframe 子页面发送消息。

**实现方式**：
- 多个 iframe 子页面共享同一个 SharedWorker
- 一个子页面通过 SharedWorker 发送广播或直接消息
- 其他子页面通过 SharedWorker 接收消息
- 消息日志显示为紫色标识

**演示方法**：
1. 在 iframe 子页面 1 中输入消息，点击"发送广播"
2. 观察 iframe 子页面 2 收到消息，日志显示为紫色的"兄弟通讯"
3. 或子页面 1 使用"发送到指定客户端"功能，输入子页面 2 的客户端 ID
4. 观察子页面 2 收到消息，日志显示为紫色的"兄弟通讯"

## 9. 运行方式

1. 在浏览器中打开 `sharedWorker.html`
2. 观察主页面和两个 iframe 子页面的连接状态变为 "已连接到 SharedWorker"
3. 查看每个页面分配的客户端 ID
4. 在主页面输入消息，点击"发送广播"，观察所有子页面收到蓝色标识的"父子通讯"消息
5. 在任意 iframe 子页面输入消息，点击"发送广播"，观察主页面收到橙色标识的"子父通讯"消息，其他子页面收到紫色标识的"兄弟通讯"消息
6. 尝试使用"发送到指定客户端"功能，在主页面向子页面发送消息，或在子页面之间发送消息
7. 观察消息日志中不同颜色标识的通讯类型

## 10. 颜色标识说明

| 通讯类型 | 颜色标识 | 含义 |
|---------|---------|------|
| 父子通讯 | 蓝色 (#2196F3) | 主页面向子页面发送消息 |
| 子父通讯 | 橙色 (#FF9800) | 子页面向主页面发送消息 |
| 兄弟通讯 | 紫色 (#9C27B0) | 子页面之间发送消息 |
| 普通通讯 | 绿色 (#4CAF50) | 同类型页面之间发送消息 |

## 11. 代码示例

### SharedWorker 核心代码

```javascript
// 客户端连接管理
const clients = new Map();
let clientCounter = 0;

// 处理新连接
self.onconnect = (event) => {
    const port = event.ports[0];
    const clientId = `client_${++clientCounter}`;
    
    // 存储客户端连接
    clients.set(clientId, { port: port });
    
    // 发送初始化消息
    port.postMessage({ type: 'init', clientId: clientId });
    
    // 监听客户端消息
    port.onmessage = (event) => {
        const data = event.data;
        
        switch (data.type) {
            case 'broadcast':
                // 广播消息给所有客户端
                broadcast({ 
                    type: 'broadcast', 
                    message: data.message, 
                    senderId: clientId 
                }, clientId);
                break;
            
            case 'direct':
                // 发送直接消息
                sendDirectMessage(data.message, data.targetClient, clientId);
                break;
        }
    };
    
    // 监听端口关闭
    port.onclose = () => {
        clients.delete(clientId);
        broadcast({ type: 'clientDisconnected', clientId: clientId });
    };
    
    port.start();
};
```

### 页面客户端代码

```javascript
// 创建或连接到 SharedWorker
const sharedWorker = new SharedWorker('sharedWorker.js');

// 监听来自 SharedWorker 的消息
sharedWorker.port.onmessage = (event) => {
    const data = event.data;
    
    switch (data.type) {
        case 'init':
            // 处理初始化消息
            clientId = data.clientId;
            break;
        
        case 'broadcast':
            // 处理广播消息
            addLog(data.message, `广播 (来自 ${data.senderId})`);
            break;
        
        case 'direct':
            // 处理直接消息
            addLog(data.message, `私信 (来自 ${data.senderId})`);
            break;
    }
};

// 启动连接
sharedWorker.port.start();

// 发送广播消息
sharedWorker.port.postMessage({
    type: 'broadcast',
    message: 'Hello from client!'
});
```

## 12. 优缺点

### 优点
- 支持多页面实时通讯
- 后台运行，不阻塞主线程
- 可以共享资源和状态
- 高效的消息传递机制
- 支持点对点和广播消息

### 缺点
- 浏览器兼容性有限（特别是 Safari 16.4+ 才支持）
- 调试困难（需要在浏览器开发者工具的 "Application" 或 "Workers" 面板中调试）
- 同源限制
- 状态管理复杂
- 可能导致资源占用过高

## 13. 最佳实践

1. **合理设计消息格式**: 使用清晰的消息类型和结构
2. **处理连接和断开事件**: 妥善处理客户端连接和断开
3. **限制资源使用**: 避免在 SharedWorker 中进行过于繁重的计算
4. **添加错误处理**: 处理可能出现的错误情况
5. **使用唯一标识符**: 为每个客户端分配唯一 ID，便于消息路由
6. **定期清理资源**: 及时清理不再需要的数据和连接
7. **考虑安全性**: 验证消息来源和格式

## 14. 注意事项

1. **同源限制**: 只能在同源页面之间通信
2. **调试困难**: SharedWorker 的调试比普通 JavaScript 困难
3. **持久运行**: 只要有页面连接，就会一直运行
4. **资源占用**: 过多的 SharedWorker 可能导致资源占用过高
5. **浏览器差异**: 不同浏览器的实现可能存在差异
6. **MessagePort 管理**: 需要正确管理 MessagePort 的生命周期

## 15. 与其他 Worker 类型的比较

| 特性 | SharedWorker | DedicatedWorker | ServiceWorker |
|------|--------------|-----------------|---------------|
| 多页面共享 | 是 | 否 | 是 |
| 生命周期 | 与连接数相关 | 与创建页面相关 | 独立运行 |
| 主要用途 | 跨页面通讯 | 后台计算 | 离线缓存、推送通知 |
| 消息传递 | MessagePort | 直接消息 | PostMessage |
| 浏览器兼容性 | 较好 | 优秀 | 较好 |
| 调试难度 | 高 | 中 | 中 |

## 16. 调试技巧

1. **Chrome/Edge**: 在开发者工具的 "Application" > "SharedWorkers" 面板中调试
2. **Firefox**: 在开发者工具的 "Storage" > "Shared Workers" 面板中调试
3. **Safari**: 在开发者工具的 "Develop" > "Web Workers" 菜单中调试
4. **使用 console.log**: 在 SharedWorker 中使用 console.log 输出调试信息
5. **监听错误**: 监听 onmessageerror 和 onerror 事件
6. **分段测试**: 先测试简单功能，再逐步添加复杂功能

## 17. 性能优化

1. **减少消息频率**: 合并多个消息，减少通信开销
2. **优化数据结构**: 使用高效的数据结构传递消息
3. **避免同步操作**: 避免在 SharedWorker 中进行同步阻塞操作
4. **合理使用广播**: 只在必要时使用广播，避免不必要的消息传递
5. **及时清理资源**: 清理不再需要的连接和数据

SharedWorker 是一种强大的跨页面通讯机制，适合需要实时、高效、多页面共享的应用场景。虽然调试和兼容性存在一些挑战，但在现代浏览器中，它提供了一种可靠的跨页面通讯解决方案。