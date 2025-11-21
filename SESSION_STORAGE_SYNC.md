# SessionStorage 跨 Iframe 同步解决方案

## 问题背景

在微前端架构中，当多个 iframe 页面需要共享 sessionStorage 数据时，会遇到以下问题：

### 核心问题

**Q: 当一个 iframe 修改了 sessionStorage 的数据后，另一个 iframe 刷新页面，数据会同步吗？**

**A: 不会自动同步。** 原因如下：

## 关键知识点

### 1. sessionStorage 的作用域

```
每个 iframe 都有独立的 browsing context
├── 同源的 iframe 共享同一个 sessionStorage 空间
├── 但是一个 iframe 修改数据后
└── 不会自动通知其他 iframe
```

### 2. storage 事件的局限性

```javascript
// ❌ 错误做法：监听 storage 事件
window.addEventListener('storage', (e) => {
    // 这个事件只对 localStorage 有效
    // sessionStorage 的变化不会触发此事件
})
```

**重要：** `storage` 事件**只对 `localStorage` 有效**，不会监听到 `sessionStorage` 的变化！

### 3. 刷新行为

| 操作 | sessionStorage 行为 | 数据同步 |
|------|-------------------|---------|
| 刷新整个页面（F5） | 保留 | ❌ 不同步到其他 iframe |
| iframe 内路由跳转 | 保留 | ❌ 不同步到其他 iframe |
| 手动读取 sessionStorage | 可以获取最新值 | ✅ 需要主动读取 |

## 解决方案：postMessage + sessionStorage

### 方案原理

```
┌─────────────┐
│  Iframe 1   │ 修改 sessionStorage
└──────┬──────┘
       │ 1. postMessage 通知父页面
       ▼
┌─────────────┐
│  父页面     │ 接收并转发消息
└──────┬──────┘
       │ 2. 广播给所有 iframe
       ▼
┌─────────────┐
│  Iframe 2   │ 接收通知，更新显示
└─────────────┘
```

### 实现步骤

#### 步骤 1: 修改 sessionStorage 时发送通知

```javascript
// 在发送方 iframe（例如 Home.vue）
const sendStorageAbout = () => {
  // 1. 更新本地的 sessionStorage
  sessionStorage.setItem("key", messageInput.value);
  sessionData.value = messageInput.value;

  // 2. 通知其他 iframe 数据已更新
  window.parent.postMessage({
    type: 'SESSION_STORAGE_UPDATE',  // 消息类型标识
    key: 'key',                       // sessionStorage 的键
    value: messageInput.value,        // 新的值
    from: 'Home (iframe1)'           // 发送者标识
  }, '*');

  alert('已更新 sessionStorage 并通知其他页面');
}
```

#### 步骤 2: 父页面转发通知

```javascript
// 在父页面 (iframe.html)
window.addEventListener('message', function(event) {
    // 识别 sessionStorage 更新通知
    if (event.data.type === 'SESSION_STORAGE_UPDATE') {
        console.log('父页面转发 sessionStorage 更新通知');

        // 广播给所有 iframe
        iframe1.contentWindow.postMessage(event.data, '*');
        iframe2.contentWindow.postMessage(event.data, '*');
        return;
    }

    // ... 处理其他类型的消息
});
```

#### 步骤 3: 接收方处理通知

```javascript
// 在接收方 iframe（例如 About.vue）
const handleMessage = (event) => {
  // 处理 sessionStorage 更新通知
  if (event.data && event.data.type === 'SESSION_STORAGE_UPDATE') {
    console.log('收到 sessionStorage 更新通知:', event.data)

    // 更新本地的响应式数据
    sessionData.value = event.data.value

    // 可选：也可以更新本地 sessionStorage（如果需要持久化）
    // sessionStorage.setItem(event.data.key, event.data.value)

    // 添加日志提示
    addLog(event.data.from, `sessionStorage 已更新: ${event.data.key} = ${event.data.value}`)
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})
```

## 完整代码示例

### Home.vue (发送方)

```vue
<template>
  <div class="home">
    <h1>首页 (Home - Iframe 1)</h1>
    <p>欢迎来到首页 {{ sessionData }}</p>

    <div class="message-box">
      <h3>发送消息</h3>
      <input v-model="messageInput" type="text" placeholder="输入消息...">
      <button @click="sendStorageAbout">更新 sessionStorage</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const messageInput = ref('')
const sessionData = ref(sessionStorage.getItem('key'))

// 监听消息
const handleMessage = (event) => {
  // 处理 sessionStorage 更新通知
  if (event.data && event.data.type === 'SESSION_STORAGE_UPDATE') {
    console.log('收到 sessionStorage 更新通知:', event.data)
    sessionData.value = event.data.value
  }
}

// 更新 sessionStorage 并通知其他页面
const sendStorageAbout = () => {
  if (!messageInput.value.trim()) {
    alert('请输入消息')
    return
  }

  // 更新本地
  sessionStorage.setItem("key", messageInput.value);
  sessionData.value = messageInput.value;

  // 通知其他 iframe
  window.parent.postMessage({
    type: 'SESSION_STORAGE_UPDATE',
    key: 'key',
    value: messageInput.value,
    from: 'Home (iframe1)'
  }, '*');

  messageInput.value = '';
  alert('已更新 sessionStorage 并通知其他页面');
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>
```

### About.vue (接收方)

```vue
<template>
  <div class="about">
    <h1>关于页面 (About - Iframe 2)</h1>
    <p>这是关于页面的内容 {{ sessionData }}</p>

    <div class="message-box">
      <h3>发送消息</h3>
      <input v-model="messageInput" type="text" placeholder="输入消息...">
      <button @click="sendStorageAbout">更新 sessionStorage</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const messageInput = ref('')
const sessionData = ref(sessionStorage.getItem('key'))

// 监听消息（代码与 Home.vue 相同）
const handleMessage = (event) => {
  if (event.data && event.data.type === 'SESSION_STORAGE_UPDATE') {
    console.log('收到 sessionStorage 更新通知:', event.data)
    sessionData.value = event.data.value
  }
}

// 更新并通知（代码与 Home.vue 相同）
const sendStorageAbout = () => {
  if (!messageInput.value.trim()) {
    alert('请输入消息')
    return
  }

  sessionStorage.setItem("key", messageInput.value);
  sessionData.value = messageInput.value;

  window.parent.postMessage({
    type: 'SESSION_STORAGE_UPDATE',
    key: 'key',
    value: messageInput.value,
    from: 'About (iframe2)'
  }, '*');

  messageInput.value = '';
  alert('已更新 sessionStorage 并通知其他页面');
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>
```

## 测试步骤

### 1. 启动项目

```bash
npm run dev
```

### 2. 打开测试页面

在浏览器中打开 `html/iframe.html`

### 3. 测试同步功能

1. **在 Home 页面输入内容**
   - 输入框中输入 "测试数据"
   - 点击 "发送到 About 页面(storage)" 按钮

2. **观察 About 页面**
   - About 页面的 `sessionData` 会立即更新
   - 接收日志中会显示更新通知

3. **反向测试**
   - 在 About 页面输入内容并发送
   - 观察 Home 页面的更新

### 4. 验证持久性

1. 刷新整个页面（F5）
2. sessionStorage 数据会保留
3. 两个 iframe 都能读取到最新的值

## 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **postMessage + sessionStorage** | ✅ 实时同步<br>✅ 精确控制<br>✅ 可扩展 | ⚠️ 需要编码实现 | 微前端、iframe 通讯 |
| **localStorage + storage 事件** | ✅ 原生支持<br>✅ 自动触发 | ❌ 持久化存储<br>❌ 跨标签页 | 需要持久化的场景 |
| **BroadcastChannel API** | ✅ 专为广播设计<br>✅ 同源通讯 | ❌ 兼容性问题<br>❌ 不支持旧浏览器 | 现代浏览器项目 |
| **SharedWorker** | ✅ 独立线程<br>✅ 性能好 | ❌ 复杂度高<br>❌ 调试困难 | 大型应用 |

## 其他替代方案

### 方案 1: 使用 localStorage（触发 storage 事件）

```javascript
// 修改数据
localStorage.setItem('key', value)

// 监听变化（其他 iframe 会收到事件）
window.addEventListener('storage', (e) => {
    if (e.key === 'key') {
        console.log('新值:', e.newValue)
    }
})
```

**缺点：** localStorage 是持久化存储，关闭标签页后数据不会清除

### 方案 2: 使用 BroadcastChannel API

```javascript
// 创建频道
const channel = new BroadcastChannel('session-sync')

// 发送消息
channel.postMessage({
    key: 'key',
    value: 'newValue'
})

// 接收消息
channel.onmessage = (e) => {
    console.log('收到消息:', e.data)
}
```

**缺点：** 兼容性不如 postMessage（IE 不支持）

### 方案 3: 父页面统一管理 sessionStorage

```javascript
// 所有 iframe 的读写都通过父页面
// iframe 请求读取
window.parent.postMessage({
    action: 'GET_SESSION',
    key: 'key'
}, '*')

// 父页面返回数据
iframe.contentWindow.postMessage({
    action: 'SESSION_DATA',
    key: 'key',
    value: sessionStorage.getItem('key')
}, '*')
```

**优点：** 中心化管理，数据一致性好

**缺点：** 增加通讯复杂度

## 常见问题

### Q1: 为什么不能用 storage 事件？

**A:** `storage` 事件**只对 `localStorage` 有效**，不监听 `sessionStorage` 的变化。这是浏览器的设计规范。

### Q2: 刷新页面后数据会丢失吗？

**A:** 不会。sessionStorage 在同一个标签页的会话期间一直有效，只有关闭标签页才会清除。

### Q3: 同源是指什么？

**A:** 同源指的是：
- 相同的协议（http/https）
- 相同的域名
- 相同的端口

例如：
- ✅ 同源：`http://localhost:5173/home` 和 `http://localhost:5173/about`
- ❌ 不同源：`http://localhost:5173` 和 `http://localhost:8080`

### Q4: 可以跨域同步 sessionStorage 吗？

**A:** 不可以。sessionStorage 受同源策略限制，不同源的页面无法访问彼此的 sessionStorage。

但可以通过 postMessage 传递数据（不是直接访问 sessionStorage）。

### Q5: 多个键需要同步怎么办？

**A:** 可以扩展消息格式支持多个键：

```javascript
// 发送多个键值对
window.parent.postMessage({
    type: 'SESSION_STORAGE_UPDATE',
    updates: {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3'
    },
    from: 'Home (iframe1)'
}, '*');

// 接收端批量更新
if (event.data.type === 'SESSION_STORAGE_UPDATE') {
    Object.entries(event.data.updates).forEach(([key, value]) => {
        sessionStorage.setItem(key, value)
    })
}
```

## 最佳实践

### 1. 封装工具函数

```javascript
// sessionStorageSync.js
export class SessionStorageSync {
    constructor() {
        this.listeners = new Map()
        this.init()
    }

    init() {
        window.addEventListener('message', (event) => {
            if (event.data.type === 'SESSION_STORAGE_UPDATE') {
                this.notifyListeners(event.data.key, event.data.value)
            }
        })
    }

    // 设置值并通知
    setItem(key, value) {
        sessionStorage.setItem(key, value)

        window.parent.postMessage({
            type: 'SESSION_STORAGE_UPDATE',
            key: key,
            value: value,
            from: window.location.pathname
        }, '*')
    }

    // 获取值
    getItem(key) {
        return sessionStorage.getItem(key)
    }

    // 监听特定键的变化
    watch(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, [])
        }
        this.listeners.get(key).push(callback)
    }

    // 通知监听器
    notifyListeners(key, value) {
        const callbacks = this.listeners.get(key) || []
        callbacks.forEach(cb => cb(value))
    }
}

// 使用
import { SessionStorageSync } from './sessionStorageSync'

const storage = new SessionStorageSync()

// 监听变化
storage.watch('key', (newValue) => {
    console.log('key 变化:', newValue)
})

// 设置值（自动通知）
storage.setItem('key', 'newValue')
```

### 2. Vue 组合式函数

```javascript
// useSessionSync.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useSessionSync(key, defaultValue = null) {
    const value = ref(sessionStorage.getItem(key) || defaultValue)

    const handleMessage = (event) => {
        if (event.data.type === 'SESSION_STORAGE_UPDATE' &&
            event.data.key === key) {
            value.value = event.data.value
        }
    }

    const updateValue = (newValue) => {
        value.value = newValue
        sessionStorage.setItem(key, newValue)

        window.parent.postMessage({
            type: 'SESSION_STORAGE_UPDATE',
            key: key,
            value: newValue,
            from: 'Vue Component'
        }, '*')
    }

    onMounted(() => {
        window.addEventListener('message', handleMessage)
    })

    onUnmounted(() => {
        window.removeEventListener('message', handleMessage)
    })

    return {
        value,
        updateValue
    }
}

// 使用
const { value: userData, updateValue: updateUserData } = useSessionSync('user')

// 更新（自动同步）
updateUserData({ name: 'John', age: 30 })
```

## 总结

在微前端 iframe 架构中：

1. ❌ **sessionStorage 不会自动同步**到其他 iframe
2. ❌ **storage 事件不监听** sessionStorage 的变化
3. ✅ **推荐使用 postMessage** 实现跨 iframe 的 sessionStorage 同步
4. ✅ **刷新页面后** sessionStorage 数据保留，但需要手动读取

通过本方案，可以实现：
- 实时同步 sessionStorage 数据
- 精确控制同步时机
- 良好的可维护性和扩展性
