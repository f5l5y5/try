# Cookie 和 Clipboard 轮询跨页面通讯

## 1. 什么是轮询

轮询是一种通过定期检查资源变化来实现通信的机制。在前端跨页面通信中，可以通过定期检查某些共享资源的变化来实现页面间的消息传递。

## 2. Cookie 轮询

### 基本原理

1. 一个页面将消息存储到 Cookie 中
2. 其他页面定期检查 Cookie 的变化
3. 当发现 Cookie 内容变化时，读取并处理消息
4. 实现跨页面通信

### 基本语法

```javascript
// 设置 Cookie
function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
}

// 获取 Cookie
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// 轮询 Cookie
setInterval(() => {
  const value = getCookie('message');
  if (value && value !== lastValue) {
    // 处理消息
    lastValue = value;
  }
}, 1000);
```

## 3. Clipboard 轮询

### 基本原理

1. 一个页面将消息写入剪贴板
2. 其他页面定期检查剪贴板的变化
3. 当发现剪贴板内容变化时，读取并处理消息
4. 实现跨页面通信

### 基本语法

```javascript
// 写入剪贴板
async function writeToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

// 读取剪贴板
async function readFromClipboard() {
  return await navigator.clipboard.readText();
}

// 轮询剪贴板
setInterval(async () => {
  const text = await readFromClipboard();
  if (text && text !== lastText) {
    // 处理消息
    lastText = text;
  }
}, 1000);
```

## 4. 核心特性

### Cookie 轮询

1. **简单易用**: API 简单，易于理解和使用
2. **浏览器兼容性好**: 支持所有现代浏览器
3. **持久存储**: 可以设置过期时间
4. **同源限制**: 只能在同源页面之间共享
5. **容量限制**: 单个 Cookie 大小限制为 4KB
6. **同步操作**: 读取和写入是同步的

### Clipboard 轮询

1. **大容量**: 可以存储大量数据
2. **异步操作**: 读取和写入是异步的
3. **需要权限**: 需要用户授权才能访问剪贴板
4. **跨源限制**: 某些浏览器对跨源剪贴板访问有限制
5. **用户可见**: 消息会显示在剪贴板中，用户可以看到
6. **实时性**: 可以实现近实时通信

## 5. 应用场景

### Cookie 轮询

- 简单的跨页面消息传递
- 页面状态同步
- 低频率通信
- 兼容性要求高的场景

### Clipboard 轮询

- 需要传递大量数据
- 实时性要求较高的场景
- 用户交互频繁的应用
- 临时数据共享

## 6. 浏览器兼容性

### Cookie 轮询

| 浏览器 | 版本 |
|--------|------|
| Chrome | 1+ |
| Firefox | 1+ |
| Safari | 1+ |
| Edge | 12+ |
| IE | 4+ |

### Clipboard 轮询

| 浏览器 | 版本 |
|--------|------|
| Chrome | 66+ |
| Firefox | 63+ |
| Safari | 12.1+ |
| Edge | 79+ |
| IE | 不支持 |

## 7. 实践案例说明

本案例演示了两种轮询方式在父子、子父、兄弟通讯场景下的应用：

1. **Cookie 轮询**:
   - 设置和读取 Cookie
   - 定期检查 Cookie 变化
   - 处理跨页面消息
   - 支持父子、子父、兄弟通讯
   - 根据通讯类型显示不同颜色标识

2. **Clipboard 轮询**:
   - 检查剪贴板权限
   - 写入和读取剪贴板
   - 定期检查剪贴板变化
   - 处理跨页面消息
   - 支持父子、子父、兄弟通讯
   - 根据通讯类型显示不同颜色标识

3. **页面结构**:
   - 主页面包含两个 iframe 用于演示父子、子父、兄弟通讯
   - 支持在主页面和 iframe 子页面之间切换通讯方式
   - 实时显示通讯状态和消息列表

## 8. 三种通讯场景说明

### 8.1 父子通讯

**定义**：主页面向 iframe 子页面发送消息。

**实现方式**：
- 主页面和 iframe 子页面使用相同的轮询方式（Cookie 轮询或 Clipboard 轮询）
- 主页面将消息写入 Cookie 或剪贴板，包含 sender 标识为 'parent'
- 子页面定期轮询 Cookie 或剪贴板
- 子页面发现新消息后，根据 sender 标识识别出这是父子通讯
- 消息显示为蓝色标识

**演示方法**：
1. 在主页面选择通讯方式（Cookie 轮询或 Clipboard 轮询）
2. 在主页面的"消息发送"区域输入消息
3. 点击"发送消息"
4. 观察所有 iframe 子页面的消息列表更新，显示蓝色标识的"父子通讯"消息

### 8.2 子父通讯

**定义**：iframe 子页面向主页面发送消息。

**实现方式**：
- iframe 子页面和主页面使用相同的轮询方式（Cookie 轮询或 Clipboard 轮询）
- 子页面将消息写入 Cookie 或剪贴板，包含 sender 标识为 'child_1' 或 'child_2'
- 主页面定期轮询 Cookie 或剪贴板
- 主页面发现新消息后，根据 sender 标识识别出这是子父通讯
- 消息显示为橙色标识

**演示方法**：
1. 在任意 iframe 子页面选择通讯方式（Cookie 轮询或 Clipboard 轮询）
2. 在子页面的"消息发送"区域输入消息
3. 点击"发送消息"
4. 观察主页面的消息列表更新，显示橙色标识的"子父通讯"消息

### 8.3 兄弟通讯

**定义**：一个 iframe 子页面向另一个 iframe 子页面发送消息。

**实现方式**：
- 多个 iframe 子页面使用相同的轮询方式（Cookie 轮询或 Clipboard 轮询）
- 一个子页面将消息写入 Cookie 或剪贴板，包含 sender 标识为 'child_1' 或 'child_2'
- 其他子页面定期轮询 Cookie 或剪贴板
- 其他子页面发现新消息后，根据 sender 标识识别出这是兄弟通讯
- 消息显示为紫色标识

**演示方法**：
1. 在 iframe 子页面 1 选择通讯方式（Cookie 轮询或 Clipboard 轮询）
2. 在子页面 1 的"消息发送"区域输入消息
3. 点击"发送消息"
4. 观察 iframe 子页面 2 的消息列表更新，显示紫色标识的"兄弟通讯"消息

## 9. 运行方式

1. 在浏览器中打开 `cookieClipboard.html`
2. 选择通讯方式（Cookie 轮询或 Clipboard 轮询）
3. 观察剪贴板权限状态（仅 Clipboard 轮询方式需要）
4. **父子通讯演示**：
   - 在主页面的"消息发送"区域输入消息
   - 点击"发送消息"
   - 观察所有 iframe 子页面的消息列表更新，显示蓝色标识的"父子通讯"消息

5. **子父通讯演示**：
   - 在任意 iframe 子页面的"消息发送"区域输入消息
   - 点击"发送消息"
   - 观察主页面的消息列表更新，显示橙色标识的"子父通讯"消息

6. **兄弟通讯演示**：
   - 在 iframe 子页面 1 的"消息发送"区域输入消息
   - 点击"发送消息"
   - 观察 iframe 子页面 2 的消息列表更新，显示紫色标识的"兄弟通讯"消息

7. **多标签页演示**：
   - 在新的标签页中打开同一个页面
   - 观察新标签页中显示了之前发送的所有消息
   - 在任意一个页面中发送新消息，观察所有页面的消息列表都会更新

8. **切换通讯方式**：
   - 在任意页面中切换通讯方式
   - 观察轮询方式切换成功的日志
   - 继续发送消息，观察不同轮询方式的效果

9. **清空消息演示**：
   - 点击"清空消息"按钮
   - 观察所有页面的消息列表都会清空

## 10. 颜色标识说明

| 通讯类型 | 颜色标识 | 含义 |
|---------|---------|------|
| 父子通讯 | 蓝色 (#2196F3) | 主页面向子页面发送消息 |
| 子父通讯 | 橙色 (#FF9800) | 子页面向主页面发送消息 |
| 兄弟通讯 | 紫色 (#9C27B0) | 子页面之间发送消息 |
| 普通通讯 | 绿色 (#4CAF50) | 同类型页面之间发送消息 |

## 11. 代码示例

### Cookie 轮询实现

```javascript
// 发送消息
function sendMessageByCookie(content) {
  const message = {
    id: Date.now(),
    content: content,
    sender: clientId,
    timestamp: Date.now()
  };
  setCookie('message', JSON.stringify(message));
}

// 轮询 Cookie
setInterval(() => {
  const cookieValue = getCookie('message');
  if (cookieValue && cookieValue !== lastCookieValue) {
    const message = JSON.parse(cookieValue);
    if (message.sender !== clientId) {
      // 处理消息
    }
    lastCookieValue = cookieValue;
  }
}, 1000);
```

### Clipboard 轮询实现

```javascript
// 发送消息
async function sendMessageByClipboard(content) {
  const message = {
    id: Date.now(),
    content: content,
    sender: clientId,
    timestamp: Date.now()
  };
  await navigator.clipboard.writeText(JSON.stringify(message));
}

// 轮询 Clipboard
setInterval(async () => {
  const clipboardValue = await navigator.clipboard.readText();
  if (clipboardValue && clipboardValue !== lastClipboardValue) {
    const message = JSON.parse(clipboardValue);
    if (message.sender !== clientId) {
      // 处理消息
    }
    lastClipboardValue = clipboardValue;
  }
}, 1000);
```

## 12. 优缺点

### Cookie 轮询

#### 优点
- 简单易用
- 浏览器兼容性好
- 无需用户授权
- 可以设置过期时间

#### 缺点
- 容量限制（4KB）
- 同步操作，可能阻塞主线程
- 频繁写入会产生性能问题
- 数据会被发送到服务器

### Clipboard 轮询

#### 优点
- 大容量存储
- 异步操作，不阻塞主线程
- 近实时通信
- 可以传递复杂数据

#### 缺点
- 需要用户授权
- 浏览器兼容性有限
- 用户可以看到剪贴板内容
- 频繁读取会产生性能问题

## 13. 最佳实践

1. **合理设置轮询间隔**: 根据通信需求设置合适的轮询间隔，避免过于频繁
2. **使用唯一标识符**: 为每个消息添加唯一标识符，避免重复处理
3. **验证消息来源**: 验证消息的发送者，避免处理无效消息
4. **处理异常情况**: 添加适当的错误处理，提高应用健壮性
5. **清理过期消息**: 及时清理不再需要的消息，释放资源
6. **考虑用户体验**: 对于 Clipboard 轮询，要考虑用户体验，避免频繁干扰用户
7. **使用安全的通信方式**: 对于敏感数据，要使用加密等安全措施

## 14. 注意事项

1. **Cookie 限制**: 注意 Cookie 的大小限制和数量限制
2. **剪贴板权限**: 注意处理剪贴板权限问题，提供友好的提示
3. **性能问题**: 频繁的轮询会产生性能问题，要合理设置轮询间隔
4. **用户隐私**: 要尊重用户隐私，不要滥用剪贴板
5. **数据格式**: 要使用合适的数据格式，便于解析和处理
6. **错误处理**: 要妥善处理各种错误情况，提高应用的健壮性

## 15. 安全性考虑

1. **不要存储敏感数据**: 避免在 Cookie 或剪贴板中存储敏感数据
2. **数据加密**: 对于敏感数据，要进行加密处理
3. **验证消息来源**: 验证消息的来源和完整性
4. **使用 HTTPS**: 在 HTTPS 环境下使用，避免数据被窃取
5. **权限管理**: 合理管理剪贴板权限
6. **数据清理**: 及时清理不再需要的数据

## 16. 与其他通信方式的比较

| 特性 | Cookie 轮询 | Clipboard 轮询 | BroadcastChannel | postMessage |
|------|------------|---------------|------------------|-------------|
| 实现复杂度 | 简单 | 中等 | 简单 | 中等 |
| 浏览器兼容性 | 优秀 | 较好 | 较好 | 优秀 |
| 实时性 | 低 | 中 | 高 | 高 |
| 容量限制 | 4KB | 大 | 大 | 大 |
| 需要权限 | 否 | 是 | 否 | 否 |
| 跨域支持 | 否 | 部分 | 否 | 是 |
| 性能影响 | 低 | 中 | 低 | 低 |

## 17. 总结

Cookie 轮询和 Clipboard 轮询都是实现跨页面通信的有效方式，各有优缺点：

- **Cookie 轮询**适合简单、低频率的通信，具有良好的浏览器兼容性
- **Clipboard 轮询**适合大容量、近实时的通信，但需要用户授权

在实际应用中，应根据具体需求选择合适的通信方式，或者结合多种方式使用。对于大多数场景，推荐使用更现代的通信方式，如 BroadcastChannel 或 postMessage，它们具有更好的性能和更丰富的功能。