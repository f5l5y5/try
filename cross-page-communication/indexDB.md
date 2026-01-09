# IndexedDB 跨页面通讯

## 1. 什么是 IndexedDB

IndexedDB 是浏览器提供的一种本地 NoSQL 数据库，用于存储大量结构化数据。它支持事务、索引和查询，可以存储复杂的数据结构（对象、数组、二进制数据等），是 Web Storage API 的重要补充。

## 2. 核心特性

| 特性 | 说明 |
|------|------|
| **大容量存储** | 可存储数百 MB 甚至更多数据 |
| **结构化数据** | 支持对象、数组、Blob 等复杂数据类型 |
| **异步操作** | 所有操作异步执行，不阻塞主线程 |
| **事务支持** | 支持事务操作，保证数据一致性 |
| **索引查询** | 支持创建索引，高效查询数据 |
| **同源限制** | 仅在同源页面间共享数据 |
| **持久存储** | 数据永久保存，除非手动删除 |

## 3. 工作原理

```
┌─────────────┐                              ┌─────────────┐
│  页面 A     │                              │  页面 B     │
│  发送消息   │                              │  接收消息   │
└──────┬──────┘                              └──────▲──────┘
       │                                            │
       │ 1. 写入 IndexedDB                           │
       ▼                                            │
┌─────────────┐                              ┌──────┴──────┐
│  IndexedDB  │                              │   监听      │
│  存储消息   │                              │ storage 事件│
└──────┬──────┘                              └──────▲──────┘
       │                                            │
       │ 2. 触发 localStorage 事件                   │ 4. 读取数据
       ▼                                            │
┌─────────────┐         3. 通知所有同源页面         ┌──────┴──────┐
│ localStorage│ ───────────────────────────────▶ │  更新 UI    │
│  setItem   │                              └─────────────┘
└─────────────┘
```

**核心机制**：IndexedDB 存储数据 + localStorage 事件通知

1. 页面 A 将数据写入 IndexedDB
2. 页面 A 修改 localStorage 触发 storage 事件
3. 同源下的其他页面（B）监听到 storage 事件
4. 页面 B 从 IndexedDB 读取最新数据并更新 UI

## 4. 浏览器兼容性

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 23+ |
| Firefox | 10+ |
| Safari | 7.1+ |
| Edge | 12+ |
| IE | 10+ |

## 5. 核心代码实现

### 5.1 初始化数据库

```javascript
const DB_NAME = 'crossPageDB';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

let db;

function initIndexDB() {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  // 数据库升级或首次创建
  request.onupgradeneeded = (event) => {
    db = event.target.result;

    // 创建对象存储空间
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true
      });

      // 创建索引
      store.createIndex('timestamp', 'timestamp', { unique: false });
      store.createIndex('sender', 'sender', { unique: false });
    }
  };

  // 数据库打开成功
  request.onsuccess = (event) => {
    db = event.target.result;
    loadMessages();
    setupDBListener();
  };

  // 数据库打开失败
  request.onerror = (event) => {
    console.error('IndexedDB 打开失败:', event.target.error);
  };
}
```

### 5.2 发送消息

```javascript
function sendMessage(content, sender) {
  const message = {
    content: content,
    sender: sender,      // 'parent', 'child_1', 'child_2'
    timestamp: Date.now()
  };

  // 写入 IndexedDB
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.add(message);

  request.onsuccess = () => {
    // 触发 storage 事件通知其他页面
    localStorage.setItem('indexDBUpdate', Date.now().toString());
    // 立即更新当前页面
    loadMessages();
  };

  request.onerror = (event) => {
    console.error('发送消息失败:', event.target.error);
  };
}
```

### 5.3 监听数据变更

```javascript
function setupDBListener() {
  window.addEventListener('storage', (event) => {
    // 监听特定的 localStorage key
    if (event.key === 'indexDBUpdate') {
      loadMessages();
    }
  });
}

function loadMessages() {
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  request.onsuccess = (event) => {
    const messages = event.target.result;
    displayMessages(messages);
  };
}
```

### 5.4 清空数据

```javascript
function clearMessages() {
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.clear();

  request.onsuccess = () => {
    localStorage.setItem('indexDBUpdate', Date.now().toString());
    displayMessages([]);
  };
}
```

## 6. 三种通讯场景

### 6.1 父子通讯（Parent → Child）

**场景**：主页面向 iframe 子页面发送消息

```javascript
// ========== 父页面 ==========
function sendToChild(content) {
  sendMessage(content, 'parent');  // sender 标识为 'parent'
}

// ========== 子页面 ==========
window.addEventListener('storage', (event) => {
  if (event.key === 'indexDBUpdate') {
    loadMessages().then(messages => {
      // 筛选出父页面发送的消息
      const parentMessages = messages.filter(m => m.sender === 'parent');
      displayMessages(parentMessages, '父子通讯');
    });
  }
});
```

### 6.2 子父通讯（Child → Parent）

**场景**：iframe 子页面向主页面发送消息

```javascript
// ========== 子页面 ==========
function sendToParent(content) {
  sendMessage(content, 'child_1');  // sender 标识为 'child_1'
}

// ========== 父页面 ==========
window.addEventListener('storage', (event) => {
  if (event.key === 'indexDBUpdate') {
    loadMessages().then(messages => {
      // 筛选出所有子页面发送的消息
      const childMessages = messages.filter(m => m.sender.startsWith('child_'));
      displayMessages(childMessages, '子父通讯');
    });
  }
});
```

### 6.3 兄弟通讯（Child ↔ Child）

**场景**：一个 iframe 子页面向另一个 iframe 子页面发送消息

```javascript
// ========== 子页面1（发送者） ==========
function sendToSibling(content) {
  sendMessage(content, 'child_1');
}

// ========== 子页面2（接收者） ==========
const currentChildId = 'child_2';  // 当前页面标识

window.addEventListener('storage', (event) => {
  if (event.key === 'indexDBUpdate') {
    loadMessages().then(messages => {
      // 筛选出其他子页面发送的消息
      const siblingMessages = messages.filter(m =>
        m.sender.startsWith('child_') && m.sender !== currentChildId
      );
      displayMessages(siblingMessages, '兄弟通讯');
    });
  }
});
```

## 7. 演示案例

### 7.1 案例说明

本案例演示了 IndexedDB 在三种通讯场景下的应用：

| 功能 | 说明 |
|------|------|
| 消息发送 | 支持父子、子父、兄弟三种方向的消息传递 |
| 消息列表 | 实时显示所有接收到的消息 |
| 颜色标识 | 不同通讯类型使用不同颜色区分 |
| 数据清空 | 支持清空所有页面的消息 |
| 多标签页 | 支持跨标签页的数据同步 |

### 7.2 颜色标识

| 通讯类型 | 颜色 | 代码 |
|---------|------|------|
| 父子通讯 | 🔵 蓝色 | `#2196F3` |
| 子父通讯 | 🟠 橙色 | `#FF9800` |
| 兄弟通讯 | 🟣 紫色 | `#9C27B0` |

### 7.3 运行方式

1. 在浏览器中打开 [indexDB.html](indexDB.html)
2. **父子通讯**：在主页面输入消息发送，观察子页面接收
3. **子父通讯**：在子页面输入消息发送，观察主页面接收
4. **兄弟通讯**：在一个子页面发送，观察另一个子页面接收
5. **多标签页**：打开新标签页，观察数据自动同步

## 8. 应用场景

| 场景 | 说明 |
|------|------|
| 离线应用 | 存储离线数据，支持断网访问 |
| 数据缓存 | 缓存接口数据，减少网络请求 |
| 跨标签页同步 | 多标签页间同步状态和数据 |
| 聊天记录 | 存储历史聊天消息 |
| 大文件存储 | 存储 Blob、File 等大文件数据 |

## 9. 与其他方案对比

| 方案 | 存储容量 | 数据类型 | API类型 | 持久化 | 适用场景 |
|------|---------|---------|---------|--------|----------|
| **IndexedDB** | >500MB | 结构化 | 异步 | ✅ | 大数据量、复杂查询 |
| **localStorage** | ~5MB | 字符串 | 同步 | ✅ | 简单配置、少量数据 |
| **BroadcastChannel** | 实时消息 | 任意 | 异步 | ❌ | 实时通讯、无需持久化 |
| **SharedWorker** | - | 任意 | 异步 | ❌ | 复杂业务逻辑、共享状态 |

## 10. 优缺点

### 优点

- ✅ 大容量存储，适合存储大量数据
- ✅ 支持复杂的数据结构和查询
- ✅ 异步操作，不阻塞主线程
- ✅ 事务支持，保证数据一致性
- ✅ 浏览器兼容性好

### 缺点

- ❌ API 复杂，学习成本较高
- ❌ 回调风格，容易产生回调地狱（可用 Promise 封装）
- ❌ 不支持实时推送，需要配合 localStorage 等机制
- ❌ 同源限制，无法跨域访问

## 11. 最佳实践

1. **使用 Promise 封装**：将 IndexedDB 的回调 API 封装为 Promise，提高代码可读性
2. **合理设计索引**：根据查询需求创建索引，提高查询效率
3. **错误处理**：妥善处理 onerror 事件，避免静默失败
4. **数据迁移**：数据库版本升级时，在 onupgradeneeded 中处理数据迁移
5. **及时清理**：定期清理过期数据，释放存储空间
6. **加密敏感数据**：对敏感数据进行加密后存储

## 12. 调试技巧

### Chrome/Edge DevTools

1. 打开开发者工具（F12）
2. 切换到 **Application** 面板
3. 左侧菜单找到 **IndexedDB**
4. 展开数据库查看存储的数据

### Firefox DevTools

1. 打开开发者工具（F12）
2. 切换到 **Storage** 面板
3. 左侧菜单找到 **IndexedDB**
4. 展开数据库查看存储的数据

### 代码调试

```javascript
// 监听事务状态
transaction.oncomplete = () => console.log('事务完成');
transaction.onerror = (event) => console.error('事务错误:', event.target.error);

// 监控请求状态
request.onsuccess = () => console.log('操作成功');
request.onerror = (event) => console.error('操作失败:', event.target.error);
```

## 13. 安全性考虑

| 风险 | 防护措施 |
|------|----------|
| XSS 攻击 | 不存储敏感数据，或进行加密存储 |
| 数据泄露 | 遵循同源策略，不跨域访问 |
| 存储溢出 | 定期清理过期数据 |
| 数据篡改 | 验证数据完整性 |

## 14. 参考资源

- [MDN - IndexedDB API](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)
- [IndexedDB 使用指南](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API/Using_IndexedDB)
