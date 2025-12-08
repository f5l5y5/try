# indexDB 跨页面通讯

## 1. 什么是 indexDB

indexDB 是浏览器提供的一种本地数据库，用于存储大量结构化数据。它是一个 NoSQL 数据库，支持事务、索引和查询，可以用于在浏览器中存储复杂数据结构。

## 2. 基本语法

### 打开数据库

```javascript
const request = indexedDB.open('database_name', version);

request.onsuccess = (event) => {
  const db = event.target.result;
  console.log('数据库打开成功');
};

request.onerror = (event) => {
  console.error('数据库打开失败:', event.target.error);
};

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  // 创建对象存储空间
};
```

### 创建对象存储空间

```javascript
const store = db.createObjectStore('store_name', {
  keyPath: 'id',
  autoIncrement: true
});

// 创建索引
store.createIndex('index_name', 'property', { unique: false });
```

### 数据操作

```javascript
// 事务
const transaction = db.transaction(['store_name'], 'readwrite');
const store = transaction.objectStore('store_name');

// 添加数据
const request = store.add({ name: 'test', value: 123 });

// 获取数据
const request = store.get(1);

// 更新数据
const request = store.put({ id: 1, name: 'updated', value: 456 });

// 删除数据
const request = store.delete(1);

// 清空数据
const request = store.clear();
```

## 3. 核心特性

1. **大容量存储**: 可以存储大量数据（通常几百 MB）
2. **结构化数据**: 支持存储复杂的结构化数据
3. **事务支持**: 支持事务操作，保证数据一致性
4. **索引支持**: 支持创建索引，提高查询效率
5. **异步操作**: 所有操作都是异步的，不阻塞主线程
6. **同源限制**: 只能在同源页面之间共享数据
7. **持久存储**: 数据永久保存在浏览器中，除非手动删除

## 4. 工作原理

1. 页面打开或创建 indexDB 数据库
2. 创建对象存储空间和索引
3. 通过事务进行数据操作（添加、读取、更新、删除）
4. 当一个页面修改数据时，通过 localStorage 的 storage 事件通知其他页面
5. 其他页面收到通知后，重新加载数据
6. 实现跨页面数据同步

## 5. 应用场景

- 离线数据存储
- 大量结构化数据存储
- 复杂查询需求
- 跨页面数据共享
- 实时数据同步
- 本地缓存
- 数据备份

## 6. 浏览器兼容性

| 浏览器 | 版本 |
|--------|------|
| Chrome | 23+ |
| Firefox | 10+ |
| Safari | 7.1+ |
| Edge | 12+ |
| IE | 10+ |

## 7. 实践案例说明

本案例演示了 indexDB 在父子、子父、兄弟通讯场景下的应用：

1. **主页面** (`indexDB.html`):
   - 初始化 indexDB 数据库
   - 创建对象存储空间和索引
   - 提供消息发送功能
   - 显示消息列表
   - 支持清空消息
   - 监听数据库变化
   - 包含两个 iframe 用于演示父子、子父、兄弟通讯
   - 根据通讯类型显示不同颜色标识

## 8. 三种通讯场景说明

### 8.1 父子通讯

**定义**：主页面向 iframe 子页面发送消息。

**实现方式**：
- 主页面和 iframe 子页面共享同一个 indexDB 数据库
- 主页面向 indexDB 添加消息，包含 sender 标识为 'parent'
- 主页面通过 localStorage 的 storage 事件通知其他页面
- 子页面监听 storage 事件，收到通知后重新加载消息列表
- 子页面根据 sender 标识识别出这是父子通讯
- 消息显示为蓝色标识

**演示方法**：
1. 在主页面的"消息发送"区域输入消息
2. 点击"发送消息"
3. 观察所有 iframe 子页面的消息列表更新，显示蓝色标识的"父子通讯"消息

### 8.2 子父通讯

**定义**：iframe 子页面向主页面发送消息。

**实现方式**：
- iframe 子页面和主页面共享同一个 indexDB 数据库
- 子页面向 indexDB 添加消息，包含 sender 标识为 'child_1' 或 'child_2'
- 子页面通过 localStorage 的 storage 事件通知其他页面
- 主页面监听 storage 事件，收到通知后重新加载消息列表
- 主页面根据 sender 标识识别出这是子父通讯
- 消息显示为橙色标识

**演示方法**：
1. 在任意 iframe 子页面的"消息发送"区域输入消息
2. 点击"发送消息"
3. 观察主页面的消息列表更新，显示橙色标识的"子父通讯"消息

### 8.3 兄弟通讯

**定义**：一个 iframe 子页面向另一个 iframe 子页面发送消息。

**实现方式**：
- 多个 iframe 子页面共享同一个 indexDB 数据库
- 一个子页面向 indexDB 添加消息，包含 sender 标识为 'child_1' 或 'child_2'
- 该子页面通过 localStorage 的 storage 事件通知其他页面
- 其他子页面监听 storage 事件，收到通知后重新加载消息列表
- 其他子页面根据 sender 标识识别出这是兄弟通讯
- 消息显示为紫色标识

**演示方法**：
1. 在 iframe 子页面 1 的"消息发送"区域输入消息
2. 点击"发送消息"
3. 观察 iframe 子页面 2 的消息列表更新，显示紫色标识的"兄弟通讯"消息

## 9. 运行方式

1. 在浏览器中打开 `indexDB.html`
2. 观察 indexDB 初始化状态变为"indexDB 已连接"
3. **父子通讯演示**：
   - 在主页面的"消息发送"区域输入消息
   - 点击"发送消息"
   - 观察所有 iframe 子页面的消息列表更新，显示蓝色标识的"父子通讯"消息

4. **子父通讯演示**：
   - 在任意 iframe 子页面的"消息发送"区域输入消息
   - 点击"发送消息"
   - 观察主页面的消息列表更新，显示橙色标识的"子父通讯"消息

5. **兄弟通讯演示**：
   - 在 iframe 子页面 1 的"消息发送"区域输入消息
   - 点击"发送消息"
   - 观察 iframe 子页面 2 的消息列表更新，显示紫色标识的"兄弟通讯"消息

6. **多标签页演示**：
   - 在新的标签页中打开同一个页面
   - 观察新标签页中显示了之前发送的所有消息
   - 在任意一个页面中发送新消息，观察所有页面的消息列表都会更新

7. **清空消息演示**：
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

### 初始化 indexDB

```javascript
const DB_NAME = 'crossPageDB';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

let db;

function initIndexDB() {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  
  request.onupgradeneeded = (event) => {
    db = event.target.result;
    
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true
      });
      
      store.createIndex('timestamp', 'timestamp', { unique: false });
      store.createIndex('sender', 'sender', { unique: false });
    }
  };
  
  request.onsuccess = (event) => {
    db = event.target.result;
    // 加载消息列表
    loadMessages();
    // 监听数据库变化
    setupDBListener();
  };
}
```

### 发送消息

```javascript
function sendMessage(content) {
  const message = {
    content: content,
    sender: clientId,
    timestamp: Date.now()
  };
  
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.add(message);
  
  request.onsuccess = (event) => {
    // 通知其他页面
    localStorage.setItem('indexDBUpdate', Date.now().toString());
    // 立即更新消息列表
    loadMessages();
  };
}
```

### 监听数据库变化

```javascript
function setupDBListener() {
  window.addEventListener('storage', (event) => {
    if (event.key === 'indexDBUpdate') {
      loadMessages();
    }
  });
}
```

## 12. 优缺点

### 优点
- 支持大量数据存储
- 支持复杂查询
- 事务支持，保证数据一致性
- 异步操作，不阻塞主线程
- 浏览器兼容性好
- 支持跨页面数据共享

### 缺点
- API 复杂，学习成本高
- 操作异步，需要处理回调
- 调试困难
- 同源限制
- 不支持实时推送，需要轮询或其他机制通知

## 13. 最佳实践

1. **合理设计数据结构**: 设计清晰的数据结构，便于查询和维护
2. **创建合适的索引**: 根据查询需求创建索引，提高查询效率
3. **使用事务**: 合理使用事务，保证数据一致性
4. **处理异步操作**: 妥善处理异步操作，避免回调地狱
5. **监听数据库变化**: 使用合适的机制通知其他页面
6. **及时清理数据**: 及时清理不再需要的数据，释放存储空间
7. **错误处理**: 添加适当的错误处理，提高应用健壮性

## 14. 注意事项

1. **异步操作**: 所有 indexDB 操作都是异步的，需要处理回调或 Promise
2. **同源限制**: 只能在同源页面之间共享数据
3. **存储空间限制**: 虽然容量大，但仍然有限制，需要合理使用
4. **浏览器差异**: 不同浏览器的实现可能存在差异
5. **数据迁移**: 数据库版本升级时需要处理数据迁移
6. **性能考虑**: 大量数据操作可能影响性能，需要优化

## 15. 与其他存储方式的比较

| 特性 | indexDB | localStorage | sessionStorage | Cookie |
|------|---------|--------------|----------------|--------|
| 存储大小 | 大（几百 MB） | 中（约 5 MB） | 中（约 5 MB） | 小（约 4 KB） |
| 数据类型 | 结构化数据 | 字符串 | 字符串 | 字符串 |
| 异步操作 | 是 | 否 | 否 | 否 |
| 事务支持 | 是 | 否 | 否 | 否 |
| 索引支持 | 是 | 否 | 否 | 否 |
| 跨页面共享 | 是 | 是 | 否 | 是 |
| 持久存储 | 是 | 是 | 否 | 可设置 |

## 16. 安全性考虑

1. **同源限制**: 只能在同源页面之间访问数据
2. **不要存储敏感数据**: 数据存储在本地，容易被访问
3. **数据加密**: 对于敏感数据，可以进行加密后存储
4. **访问控制**: 控制对数据库的访问权限
5. **定期清理**: 及时清理不再需要的数据

## 17. 调试技巧

1. **Chrome/Edge**: 在开发者工具的 "Application" > "IndexedDB" 面板中调试
2. **Firefox**: 在开发者工具的 "Storage" > "IndexedDB" 面板中调试
3. **Safari**: 在开发者工具的 "Storage" > "Indexed Database" 面板中调试
4. **使用 console.log**: 在回调函数中使用 console.log 输出调试信息
5. **监控事务状态**: 监听事务的 complete 和 error 事件
6. **使用 Promise 封装**: 将回调 API 封装为 Promise，便于调试和使用

indexDB 是一种强大的本地数据库，可以用于存储大量结构化数据，并实现跨页面数据共享。虽然 API 复杂，但对于需要处理大量数据的应用来说，是一个很好的选择。