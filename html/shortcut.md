# 快捷键管理器使用文档

## 简介
快捷键管理器（ShortcutManager）是一个用于管理和处理键盘快捷键的工具类。它提供了注册、批量注册、取消和批量取消快捷键等功能。

## 特性
- 支持单个和批量注册快捷键
- 支持组合键（如 Ctrl+S, Ctrl+Shift+S 等）
- 支持 Mac 和 Windows 按键映射
- 支持事件阻止（preventDefault）和事件冒泡阻止（stopPropagation）
- 支持通配符删除所有快捷键

## 使用方法

### 1. 初始化
```javascript
const shortcutManager = new ShortcutManager();
```

### 2. 注册快捷键

#### 2.1 单个注册
```javascript
// 方式一：使用对象形式
shortcutManager.register({
    key: "ctrl+s",
    command: (e) => {
        console.log('保存操作');
    }
});

// 方式二：使用参数形式
shortcutManager.register(
    "ctrl+s", 
    (e) => {
        console.log('保存操作');
    },
    { prevent: true, stop: true }  // 可选参数
);
```

#### 2.2 批量注册
```javascript
shortcutManager.batchRegister([
    {
        key: "ctrl+shift+s",
        command: (e) => {
            console.log('另存为操作');
        }
    },
    {
        key: "esc",
        command: (e) => {
            console.log('退出操作');
        }
    }
]);
```

### 3. 取消快捷键

#### 3.1 取消单个快捷键
```javascript
// 取消特定快捷键
shortcutManager.cancel('ctrl+s');

// 取消所有快捷键
shortcutManager.cancel('*');
```

#### 3.2 批量取消快捷键
```javascript
shortcutManager.batchCancel([
    { key: 'ctrl+s' },
    { key: 'esc' }
]);
```

### 4. 获取当前注册的所有快捷键
```javascript
const shortcuts = shortcutManager.getShortcuts();
```

## 支持的按键

### 修饰键
- `ctrl`：Control 键
- `shift`：Shift 键
- `alt`：Alt 键
- `command`：Mac Command 键（在 Windows 上映射为 Ctrl）

### 特殊键
- `esc`：Escape 键
- `del`：Delete 键
- `enter`：Enter 键
- `backspace`：Backspace 键
- `空格`：Space 键（使用 " " 表示）

## 配置选项

### register 方法参数
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| key | string | - | 快捷键组合，如 "ctrl+s" |
| command | function | - | 快捷键触发时执行的函数 |
| prevent | boolean | true | 是否阻止默认行为 |
| stop | boolean | true | 是否阻止事件冒泡 |

## 注意事项

1. 快捷键字符串不区分大小写，如 "ctrl+s" 和 "CTRL+S" 等效
2. 组合键使用 "+" 连接，如 "ctrl+shift+s"
3. 注册快捷键时，建议使用箭头函数来避免立即执行：
```javascript
// 正确方式
shortcutManager.register('ctrl+s', () => saveFunction('param'));

// 错误方式（会立即执行）
shortcutManager.register('ctrl+s', saveFunction('param'));
```

## 示例代码

```javascript
// 初始化
const shortcutManager = new ShortcutManager();

// 注册保存快捷键
shortcutManager.register({
    key: "ctrl+s",
    command: (e) => {
        console.log('保存文件');
    }
});

// 注册带参数的快捷键
shortcutManager.register('ctrl+shift+s', () => {
    return () => saveAs('新文件');
});

// 注册不阻止默认行为的快捷键
shortcutManager.register({
    key: "ctrl+c",
    command: (e) => {
        console.log('复制');
    },
    prevent: false
});

// 批量注册多个快捷键
shortcutManager.batchRegister([
    {
        key: "esc",
        command: (e) => {
            console.log('退出');
        }
    },
    {
        key: "ctrl+z",
        command: (e) => {
            console.log('撤销');
        }
    }
]);
```

## 版本历史

### v1.0.0
- 初始版本
- 支持基本的快捷键注册和取消功能
- 支持批量操作
- 支持 Mac 键位映射


## 源码实现说明

### 核心类结构
```javascript
class ShortcutManager {
    constructor()      // 初始化管理器
    initialize()       // 注册全局事件监听
    register()         // 注册快捷键
    cancel()          // 取消快捷键
    // ... 其他方法
}
```

### 实现流程

1. **初始化流程**
   - 创建快捷键存储数组
   - 定义修饰键列表
   - 初始化键盘映射表
   - 注册全局键盘事件监听器

2. **快捷键注册流程**
   ```mermaid
   graph TD
   A[注册快捷键] --> B[解析快捷键字符串]
   B --> C[转换为标准格式]
   C --> D[存入快捷键数组]
   ```

3. **快捷键触发流程**
   ```mermaid
   graph TD
   A[键盘事件触发] --> B[查找匹配的快捷键]
   B --> C{是否找到匹配?}
   C -->|是| D[执行回调函数]
   C -->|否| E[结束]
   D --> F[事件处理]
   ```

### 关键实现细节

1. **快捷键解析**
```javascript
function parseKey(keyString) {
    const keys = keyString.toLowerCase().split("+");
    return {
        key: keys[keys.length - 1],
        ctrlKey: keys.includes("ctrl"),
        metaKey: keys.includes("command"),
        shiftKey: keys.includes("shift"),
        altKey: keys.includes("alt"),
    };
}
```
- 将快捷键字符串分解为修饰键和主键
- 转换为标准格式对象

2. **快捷键匹配**
```javascript
function findMatchingShortcut(event) {
    return shortcuts.filter(shortcut => {
        const preciseMatching = modifierKeys.every(key => 
            shortcut[key] === event[key]
        ) && shortcut.key === convertMacKey(event.key).toLowerCase();

        const anyMatching = shortcut.key === '*';

        return preciseMatching || anyMatching;
    });
}
```
- 检查修饰键是否完全匹配
- 检查主键是否匹配
- 支持通配符匹配

3. **键位映射转换**
```javascript
function convertMacKey(key) {
    return {
        "Control": "Ctrl",
        "Meta": "Command",
        "Delete": "Del",
        "Escape": "Esc",
    }[key] || key;
}
```
- 统一不同平台的按键名称
- 处理按键别名

### 数据结构

1. **快捷键对象结构**
```javascript
{
    key: string,          // 主键
    ctrlKey: boolean,     // 是否按下 Ctrl
    metaKey: boolean,     // 是否按下 Command
    shiftKey: boolean,    // 是否按下 Shift
    altKey: boolean,      // 是否按下 Alt
    command: Function,    // 回调函数
    prevent: boolean,     // 是否阻止默认行为
    stop: boolean        // 是否阻止事件冒泡
}
```

2. **事件监听处理**
- 使用事件委托，在 window 级别统一处理键盘事件
- 支持事件阻止和冒泡控制
- 异步执行回调函数

### 性能优化

1. **事件防抖**
- 避免快捷键重复触发
- 控制事件触发频率

2. **快捷键查找优化**
- 使用 filter 方法快速匹配
- 支持通配符快速匹配

3. **内存管理**
- 支持快捷键注销
- 清理无用的事件监听

### 扩展性设计

1. **支持自定义配置**
- 可配置事件阻止行为
- 可配置事件冒泡行为

2. **接口设计**
- 提供批量操作接口
- 支持链式调用

3. **错误处理**
- 参数验证
- 异常捕获

### 注意事项

1. **内存泄漏防范**
- 注册快捷键时注意清理旧的事件监听
- 组件卸载时注意清理相关快捷键

2. **兼容性处理**
- 处理不同平台的按键差异
- 处理特殊按键的兼容性

3. **安全性考虑**
- 避免快捷键冲突
- 防止重复注册

// ... 之前文档的其余部分 ...
```

这部分源码说明主要从实现原理、流程、关键细节等方面详细说明了快捷键管理器的实现。使用了流程图和代码示例来更直观地展示实现细节，同时也包含了性能优化和注意事项等重要信息。
```


