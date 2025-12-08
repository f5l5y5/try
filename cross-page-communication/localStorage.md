# localStorage 跨页面通讯

## 1. 什么是 localStorage

localStorage 是 HTML5 引入的 Web Storage API 的一部分，用于在浏览器中存储键值对数据，数据会永久保存在浏览器中，除非手动删除。它提供了一种简单的机制来实现跨页面通讯。

## 2. 跨页面通讯原理

localStorage 本身不直接支持消息传递，但可以通过监听 `storage` 事件来实现跨页面通讯：

1. 当一个页面修改 localStorage 时，浏览器会触发所有其他同源页面的 `storage` 事件
2. 事件对象包含了修改的键、旧值、新值等信息
3. 页面可以通过监听这个事件来接收其他页面发送的消息

## 3. 基本语法

```javascript
// 设置数据
localStorage.setItem(key, value);

// 获取数据
localStorage.getItem(key);

// 删除数据
localStorage.removeItem(key);

// 清空所有数据
localStorage.clear();

// 监听 storage 事件
window.addEventListener('storage', (event) => {
  // 处理事件
});
```

## 4. storage 事件对象属性

| 属性 | 描述 |
|------|------|
| `key` | 被修改的键名，如果是 `clear()` 则为 null |
| `oldValue` | 修改前的值，如果是新增则为 null |
| `newValue` | 修改后的值，如果是删除则为 null |
| `url` | 触发事件的页面 URL |
| `storageArea` | 被修改的 storage 对象（localStorage 或 sessionStorage） |

## 5. 核心特性

1. **同源限制**: 只能在同源页面之间通信
2. **持久存储**: 数据永久保存在浏览器中
3. **简单易用**: API 设计简洁，易于理解和使用
4. **事件驱动**: 通过 storage 事件实现跨页面通知
5. **同步操作**: localStorage 操作是同步的

## 6. 应用场景

- 多标签页状态同步
- 用户偏好设置同步
- 购物车数据共享
- 登录状态同步
- 简单的跨页面消息传递

## 7. 浏览器兼容性

| 浏览器 | 版本 |
|--------|------|
| Chrome | 4+ |
| Firefox | 3.5+ |
| Safari | 4+ |
| Edge | 12+ |
| IE | 8+ |

## 8. 实践案例说明

本案例演示了 localStorage 在三种通讯场景下的应用：

### 8.1 父子通讯（主页面 → iframe）

- **主页面** (`localStorage.html`):
  - 提供输入框和发送按钮
  - 可以向一个或多个 iframe 发送消息
  - 支持选择目标 iframe
  - 明确标识为父子通讯

- **iframe 页面** (`localStorage.html?child=1` 和 `localStorage.html?child=2`):
  - 接收并显示来自主页面的消息
  - 区分显示父子通讯的消息
  - 通过 `storage` 事件监听 localStorage 变化

### 8.2 子父通讯（iframe → 主页面）

- **iframe 页面** (`localStorage.html?child=1` 和 `localStorage.html?child=2`):
  - 提供输入框和发送按钮
  - 可以向主页面发送消息
  - 明确标识为子父通讯

- **主页面** (`localStorage.html`):
  - 接收并显示来自 iframe 的消息
  - 区分显示不同 iframe 发送的消息
  - 通过 `storage` 事件监听 localStorage 变化

### 8.3 兄弟通讯（iframe → iframe）

- **iframe 页面** (`localStorage.html?child=1` 和 `localStorage.html?child=2`):
  - 提供输入框和发送按钮
  - 可以向兄弟 iframe 发送消息
  - 明确标识为兄弟通讯

- **效果**:
  - 当 iframe 1 发送消息时，iframe 2 能收到消息
  - 当 iframe 2 发送消息时，iframe 1 能收到消息
  - 所有 iframe 都能通过 `storage` 事件收到兄弟发送的消息

## 9. 运行方式

1. 在浏览器中打开 `localStorage.html`

2. **父子通讯测试**：
   - 在主页面输入框中输入消息
   - 选择目标 iframe（或选择"发送到所有 iframe"）
   - 点击"发送消息"，在相应的 iframe 中可以看到接收到的消息

3. **子父通讯测试**：
   - 在任意 iframe 输入框中输入消息
   - 点击"发送消息"，在主页面可以看到接收到的消息

4. **兄弟通讯测试**：
   - 在 iframe 1 中输入消息
   - 点击"发送消息"
   - 在 iframe 2 中可以看到接收到的消息
   - 同样可以从 iframe 2 向 iframe 1 发送消息

5. **观察通讯类型标识**：
   - 每种通讯类型（父子、子父、兄弟）都有不同的颜色标识
   - 可以清晰地看到消息的发送者、接收者和通讯类型

6. **多标签页测试**：
   - 在新的浏览器标签页中打开 `localStorage.html`
   - 在一个标签页中发送消息，所有其他标签页都能收到消息

7. **清空数据测试**：
   - 点击"清空存储"可以清空所有 localStorage 数据
   - 所有页面都会同步清空数据

8. **注意事项**：
   - 发送消息的页面不会收到自己发送的消息
   - 只有同源页面才能收到 `storage` 事件
   - 消息通过 localStorage 存储，会永久保存直到手动删除

## 10. 代码示例

### 发送消息

```javascript
const MESSAGE_KEY = 'cross_page_message';
const tabId = 'tab_' + Math.random().toString(36).substr(2, 9);

function sendMessage(message) {
    const messageData = {
        message: message,
        tabId: tabId,
        timestamp: Date.now()
    };
    localStorage.setItem(MESSAGE_KEY, JSON.stringify(messageData));
}
```

### 接收消息

```javascript
window.addEventListener('storage', (event) => {
    if (event.key === MESSAGE_KEY) {
        try {
            const messageData = JSON.parse(event.newValue);
            if (messageData && messageData.tabId !== tabId) {
                console.log('收到消息:', messageData.message);
            }
        } catch (error) {
            console.error('解析消息失败:', error);
        }
    }
});
```

## 11. 优缺点

### 优点
- API 简单易用，学习成本低
- 浏览器兼容性好，支持 IE8+
- 无需额外的服务器或复杂的设置
- 数据持久存储，页面刷新后依然存在

### 缺点
- 只能在同源页面之间通信
- 存储容量有限（通常为 5MB）
- 同步操作，可能阻塞主线程
- 只能通过字符串格式存储数据
- `storage` 事件不会在触发修改的页面上触发
- 不支持复杂的数据结构，需要手动序列化和反序列化

## 12. 最佳实践

1. **使用唯一键名**: 为不同的应用或功能使用不同的键名，避免冲突
2. **JSON 序列化**: 使用 JSON 格式存储复杂数据，便于解析和处理
3. **添加发送者标识**: 生成唯一 ID 标识发送者，避免接收自己发送的消息
4. **添加时间戳**: 用于处理消息顺序和过期
5. **错误处理**: 添加 try-catch 块，处理 JSON 解析可能出现的错误
6. **限制消息大小**: 避免存储过大的数据，影响性能
7. **定期清理**: 及时清理不再需要的数据，释放存储空间

## 13. 注意事项

1. **同源限制**: 只能在同源页面之间通信
2. **同步操作**: localStorage 操作是同步的，大量操作可能影响性能
3. **存储类型限制**: 只能存储字符串，需要手动序列化和反序列化
4. **事件触发限制**: `storage` 事件不会在触发修改的页面上触发
5. **隐私模式**: 在某些浏览器的隐私模式下，localStorage 可能无法正常工作
6. **浏览器兼容性**: 虽然兼容性好，但在某些旧浏览器中可能存在差异

## 14. 与其他存储方式的比较

| 特性 | localStorage | sessionStorage | cookie |
|------|--------------|----------------|--------|
| 存储大小 | 约 5MB | 约 5MB | 约 4KB |
| 过期时间 | 永久 | 会话结束 | 可设置 |
| 同源限制 | 是 | 是 | 是（可配置） |
| 跨页面共享 | 是 | 否 | 是 |
| 发送到服务器 | 否 | 否 | 是 |
| 存储位置 | 浏览器本地 | 浏览器本地 | 浏览器和服务器 |

## 15. 性能优化建议

1. **减少操作频率**: 避免频繁修改 localStorage，合并多个操作
2. **使用防抖**: 对频繁触发的操作使用防抖处理
3. **合理设计数据结构**: 优化数据结构，减少序列化和反序列化的开销
4. **避免存储大量数据**: 只存储必要的数据，避免存储过大的文件
5. **使用 Web Workers**: 对于大量数据的处理，考虑使用 Web Workers 避免阻塞主线程

## 16. 安全考虑

1. **不要存储敏感数据**: localStorage 中的数据可以被用户轻易访问和修改，不要存储密码、令牌等敏感信息
2. **数据验证**: 接收消息时验证数据格式和来源，避免恶意数据
3. **使用 HTTPS**: 在 HTTPS 环境下使用 localStorage，避免数据被窃取
4. **定期清理**: 及时清理不再需要的数据，减少安全风险

localStorage 是一种简单易用的跨页面通讯方式，适合简单的应用场景。对于复杂的通讯需求，可能需要考虑使用其他方式，如 BroadcastChannel、SharedWorker 等。