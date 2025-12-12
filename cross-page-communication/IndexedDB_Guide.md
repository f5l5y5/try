# IndexedDB 使用指南

## 目录

1. [简介](#简介)
2. [基本概念](#基本概念)
3. [核心API](#核心api)
4. [数据库操作](#数据库操作)
5. [事务处理](#事务处理)
6. [数据存储](#数据存储)
7. [查询操作](#查询操作)
8. [索引使用](#索引使用)
9. [最佳实践](#最佳实践)
10. [常见问题](#常见问题)
11. [完整示例](#完整示例)

---

## 简介

IndexedDB 是浏览器提供的 NoSQL 数据库，用于在客户端存储大量结构化数据。它支持事务、索引查询和异步操作，适合离线应用、数据缓存等场景。

## 基本概念

### 数据库层级结构
```
Database (数据库)
├── Object Store (对象存储空间)
│   ├── Index (索引)
│   └── Data Records (数据记录)
└── Object Store (对象存储空间)
```

### 关键特性
- **异步操作**：所有操作都是异步的，使用事件或Promise
- **事务支持**：原子性操作，要么全部成功要么全部回滚
- **索引查询**：支持基于索引的高效查询
- **存储限制**：通常限制为几百MB（取决于浏览器）
- **持久化存储**：数据在浏览器关闭后仍然保留

## 核心API

### 1. 打开数据库
```javascript
const request = indexedDB.open('dbName', version);
```

### 2. 创建/升级数据库
```javascript
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  // 创建或升级存储空间
};
```

### 3. 事务操作
```javascript
const transaction = db.transaction(storeNames, mode);
const store = transaction.objectStore(storeName);
```

### 4. 常用操作方法
```javascript
// 添加数据
store.add(data);

// 更新数据
store.put(data);

// 删除数据
store.delete(key);

// 获取数据
store.get(key);

// 获取所有数据
store.getAll();

// 使用索引查询
store.index('indexName').get(value);
```

## 数据库操作

### 1. 打开数据库
```javascript
const openDB = (dbName, version) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // 数据库升级逻辑
    };
  });
};
```

### 2. 关闭数据库
```javascript
db.close();
```

### 3. 删除数据库
```javascript
const deleteDB = (dbName) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve('数据库删除成功');
  });
};
```

## 事务处理

### 1. 创建事务
```javascript
const transaction = db.transaction(['store1', 'store2'], 'readwrite');
```

### 2. 事务模式
- `'readonly'`：只读事务
- `'readwrite'`：读写事务
- `'versionchange'`：版本变更事务

### 3. 事务错误处理
```javascript
transaction.onerror = (event) => {
  console.error('事务错误:', event.target.error);
};

transaction.onabort = () => {
  console.log('事务已回滚');
};

transaction.oncomplete = () => {
  console.log('事务完成');
};
```

### 4. 手动回滚事务
```javascript
transaction.abort();
```

## 数据存储

### 1. 创建对象存储空间
```javascript
const store = db.createObjectStore('users', {
  keyPath: 'id', // 使用数据中的id字段作为主键
  autoIncrement: true // 自动生成主键
});
```

### 2. 添加数据
```javascript
const addData = (store, data) => {
  return new Promise((resolve, reject) => {
    const request = store.add(data);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
```

### 3. 更新数据
```javascript
const updateData = (store, data) => {
  return new Promise((resolve, reject) => {
    const request = store.put(data);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
```

### 4. 删除数据
```javascript
const deleteData = (store, key) => {
  return new Promise((resolve, reject) => {
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
```

## 查询操作

### 1. 获取单个数据
```javascript
const getData = (store, key) => {
  return new Promise((resolve, reject) => {
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
```

### 2. 获取所有数据
```javascript
const getAllData = (store) => {
  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
```

### 3. 范围查询
```javascript
const rangeQuery = (store, range) => {
  return new Promise((resolve, reject) => {
    const request = store.openCursor(range);

    const results = [];
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject(request.error);
  });
};
```

## 索引使用

### 1. 创建索引
```javascript
store.createIndex('nameIndex', 'name', { unique: false });
store.createIndex('emailIndex', 'email', { unique: true });
```

### 2. 使用索引查询
```javascript
const queryByIndex = (store, indexName, value) => {
  return new Promise((resolve, reject) => {
    const index = store.index(indexName);
    const request = index.get(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
```

### 3. 范围索引查询
```javascript
const rangeQueryByIndex = (store, indexName, range) => {
  return new Promise((resolve, reject) => {
    const index = store.index(indexName);
    const request = index.openCursor(range);

    const results = [];
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject(request.error);
  });
};
```

## 最佳实践

### 1. 错误处理
```javascript
try {
  // IndexedDB 操作
} catch (error) {
  if (error instanceof DOMException) {
    console.error('IndexedDB 错误:', error.name, error.message);
  } else {
    console.error('其他错误:', error);
  }
}
```

### 2. 异步操作处理
```javascript
// 使用 async/await
async function performDBOperations() {
  try {
    const db = await openDB('myDB', 1);
    // 执行数据库操作
  } catch (error) {
    console.error('数据库操作失败:', error);
  }
}
```

### 3. 事务管理
```javascript
// 确保事务及时完成
transaction.oncomplete = () => {
  console.log('事务完成');
};

// 设置超时
setTimeout(() => {
  if (transaction.readyState !== 'done') {
    transaction.abort();
    console.error('事务超时');
  }
}, 5000);
```

### 4. 数据清理
```javascript
// 定期清理过期数据
function cleanOldData(store, maxAge) {
  const now = Date.now();
  const range = IDBKeyRange.upperBound(now - maxAge);

  return new Promise((resolve, reject) => {
    const request = store.openCursor(range, 'prev');

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
}
```

### 5. 性能优化
```javascript
// 批量操作
async function batchOperations(store, operations) {
  const transaction = store.transaction;

  for (const op of operations) {
    await new Promise((resolve, reject) => {
      const request = op.type === 'add' ? store.add(op.data) :
                     op.type === 'put' ? store.put(op.data) :
                     store.delete(op.key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
```

## 常见问题

### 1. 数据库版本升级
```javascript
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const oldVersion = event.oldVersion;
  const newVersion = event.newVersion;

  if (oldVersion < 1) {
    // 创建初始存储空间
  }

  if (oldVersion < 2) {
    // 添加新索引
  }
};
```

### 2. 处理大容量数据
```javascript
// 分批处理大数据
async function processLargeData(store, batchSize = 100) {
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const range = IDBKeyRange.lowerBound(offset);
    const data = await getAllDataInRange(store, range, batchSize);

    if (data.length === 0) {
      hasMore = false;
    } else {
      // 处理数据
      offset += data.length;
    }
  }
}
```

### 3. 跨浏览器兼容性
```javascript
// 检查 IndexedDB 支持
if (!('indexedDB' in window)) {
  console.error('浏览器不支持 IndexedDB');
}

// 使用前缀
const indexedDB = window.indexedDB || window.mozIndexedDB ||
                window.webkitIndexedDB || window.msIndexedDB;
```

## 完整示例

### 用户管理系统

```javascript
// 用户管理系统
class UserManager {
  constructor(dbName = 'UserDB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  async init() {
    this.db = await this.openDB();
    return this;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('users')) {
          const store = db.createObjectStore('users', { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('email', 'email', { unique: true });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async addUser(user) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');

      user.createdAt = new Date().toISOString();

      const request = store.add(user);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('email');
      const request = index.get(email);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(id, updates) {
    const user = await this.getUserById(id);
    if (!user) throw new Error('用户不存在');

    const updatedUser = { ...user, ...updates };
    return this.putUser(updatedUser);
  }

  async putUser(user) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(user);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteUser(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllUsers() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async searchUsers(query) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('name');

      const range = IDBKeyRange.bound(query, query + '\uffff');
      const request = index.openCursor(range);

      const results = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// 使用示例
async function demo() {
  const userManager = new UserManager();
  await userManager.init();

  // 添加用户
  await userManager.addUser({
    id: 'user1',
    name: '张三',
    email: 'zhangsan@example.com',
    age: 25
  });

  // 获取用户
  const user = await userManager.getUserById('user1');
  console.log('获取用户:', user);

  // 更新用户
  await userManager.updateUser('user1', { age: 26 });

  // 搜索用户
  const users = await userManager.searchUsers('张');
  console.log('搜索结果:', users);

  // 删除用户
  await userManager.deleteUser('user1');
}
```

---

## 参考资料

1. [MDN IndexedDB 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)
2. [IndexedDB 规范](https://www.w3.org/TR/IndexedDB/)
3. [IndexedDB 最佳实践](https://developers.google.com/web/ilt/pwa/working-with-indexeddb)

这个指南涵盖了 IndexedDB 的核心概念、API 使用方法和最佳实践，可以帮助你快速掌握 IndexedDB 的使用。