/*
 * ========================================================================
 * Service Worker 跨页面通信设计思路与流程图
 * ========================================================================
 *
 * 一、整体架构
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                     Service Worker 通信架构                        │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                   │
 * │  页面 A (page-123)              页面 B (page-456)                 │
 * │       │                                │                          │
 * │       │ register()                     │ register()               │
 * │       ▼                                ▼                          │
 * │  ┌──────────────┐              ┌──────────────┐                  │
 * │  │ navigator.   │              │ navigator.   │                  │
 * │  │ serviceWorker│              │ serviceWorker│                  │
 * │  │ .controller  │              │ .controller  │                  │
 * │  └──────┬───────┘              └──────┬───────┘                  │
 * │         │                             │                          │
 * │         │ postMessage                 │ postMessage              │
 * │         │                             │                          │
 * │         └────────────┬────────────────┘                          │
 * │                      │                                            │
 * │                      ▼                                            │
 * │          ┌──────────────────────────┐                            │
 * │          │  Service Worker 实例      │                            │
 * │          │  (service-worker.js)     │                            │
 * │          │  【持久化运行】           │                            │
 * │          │                           │                            │
 * │          │  connections Map:         │                            │
 * │          │  ├─ 'page-123' → client  │                            │
 * │          │  └─ 'page-456' → client  │                            │
 * │          │                           │                            │
 * │          │  clients API:             │                            │
 * │          │  self.clients.matchAll() │                            │
 * │          └──────────────────────────┘                            │
 * │                                                                   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 二、Service Worker 生命周期
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                     完整生命周期流程                               │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                   │
 * │  页面端                          Service Worker 端                │
 * │  ═════                          ═══════════════                  │
 * │                                                                   │
 * │  1. 注册                                                          │
 * │  ┌──────────────────┐                                            │
 * │  │ navigator.       │                                            │
 * │  │  serviceWorker   │                                            │
 * │  │  .register()     │──────────┐                                 │
 * │  └──────────────────┘          │                                 │
 * │                                 ▼                                 │
 * │                         触发 'install' 事件                       │
 * │                         ┌──────────────────┐                     │
 * │                         │ self.skipWaiting │                     │
 * │                         │ () 跳过等待      │                     │
 * │                         └────────┬─────────┘                     │
 * │                                  │                                │
 * │                                  ▼                                │
 * │                         触发 'activate' 事件                      │
 * │                         ┌──────────────────┐                     │
 * │                         │ self.clients.    │                     │
 * │                         │  claim() 控制页面│                     │
 * │                         └────────┬─────────┘                     │
 * │                                  │                                │
 * │  2. 等待就绪                     ▼                                │
 * │  ┌──────────────────┐    ┌─────────────┐                        │
 * │  │ navigator.       │◀───│ Service     │                        │
 * │  │  serviceWorker   │    │  Worker     │                        │
 * │  │  .ready          │    │  已激活     │                        │
 * │  └────────┬─────────┘    └─────────────┘                        │
 * │           │                                                       │
 * │           ▼                                                       │
 * │  3. 发送消息                                                      │
 * │  ┌──────────────────┐           触发 'message' 事件              │
 * │  │ controller.      │──────────▶┌─────────────┐                 │
 * │  │  postMessage()   │           │ event.data  │                 │
 * │  └──────────────────┘           └─────────────┘                 │
 * │                                         │                         │
 * │  4. 接收消息                            ▼                         │
 * │  ┌──────────────────┐           处理消息并响应                    │
 * │  │ addEventListener │◀──────────┌─────────────┐                 │
 * │  │  ('message')     │           │ client.     │                 │
 * │  └──────────────────┘           │ postMessage │                 │
 * │                                 └─────────────┘                 │
 * │                                                                   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 三、页面连接流程
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                     页面注册到 Service Worker                      │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                   │
 * │  页面端                          Service Worker 端                │
 * │  ═════                          ═══════════════                  │
 * │                                                                   │
 * │  1. 注册 Service Worker                                          │
 * │  ┌────────────────────────┐                                      │
 * │  │ const registration =   │                                      │
 * │  │  await navigator.      │                                      │
 * │  │  serviceWorker.        │                                      │
 * │  │  register('./sw.js')   │                                      │
 * │  └───────────┬────────────┘                                      │
 * │              │                                                    │
 * │              ▼                                                    │
 * │  2. 等待激活                                                      │
 * │  ┌────────────────────────┐                                      │
 * │  │ await navigator.       │                                      │
 * │  │  serviceWorker.ready   │                                      │
 * │  └───────────┬────────────┘                                      │
 * │              │                                                    │
 * │              ▼                                                    │
 * │  3. 注册消息监听                                                  │
 * │  ┌────────────────────────┐                                      │
 * │  │ navigator.serviceWorker│                                      │
 * │  │  .addEventListener     │                                      │
 * │  │  ('message', handler)  │                                      │
 * │  └───────────┬────────────┘                                      │
 * │              │                                                    │
 * │              ▼                                                    │
 * │  4. 发送注册消息                                                  │
 * │  ┌────────────────────────┐                                      │
 * │  │ controller.postMessage │                                      │
 * │  │  ({                    │──────────┐                           │
 * │  │   type: 'register',    │          │                           │
 * │  │   pageId: 'page-123'   │          │                           │
 * │  │  })                    │          │                           │
 * │  └────────────────────────┘          ▼                           │
 * │                              收到注册消息                          │
 * │                              ┌────────────────┐                  │
 * │                              │ connections.   │                  │
 * │                              │  set(pageId,   │                  │
 * │                              │   { client })  │                  │
 * │                              └───────┬────────┘                  │
 * │                                      │                            │
 * │                                      ▼                            │
 * │  5. 收到确认                  发送确认消息                         │
 * │  ┌────────────────────────┐  ┌────────────────┐                 │
 * │  │ event.data.type ===    │◀─│ client.        │                 │
 * │  │  'registered'          │  │  postMessage({ │                 │
 * │  └────────────────────────┘  │  type:         │                 │
 * │                              │   'registered' │                 │
 * │                              │ })             │                 │
 * │                              └────────────────┘                 │
 * │                                                                   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 四、消息处理流程
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                        消息类型路由                                │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                   │
 * │  收到消息 (message 事件)                                          │
 * │     │                                                             │
 * │     ▼                                                             │
 * │  解析消息                                                          │
 * │  { type, pageId, target, data }                                 │
 * │     │                                                             │
 * │     ├─────────┬─────────┬──────────┬──────────┬─────────┐       │
 * │     ▼         ▼         ▼          ▼          ▼         ▼       │
 * │  register  broadcast  private  get-online heartbeat disconnect  │
 * │     │         │         │          │          │         │       │
 * │     ▼         ▼         ▼          ▼          ▼         ▼       │
 * │  ┌──────┐ ┌────────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌──────┐    │
 * │  │注册  │ │广播    │ │点对点│ │在线    │ │心跳  │ │断开  │    │
 * │  │页面  │ │所有页面│ │消息  │ │列表    │ │更新  │ │连接  │    │
 * │  └──────┘ └────────┘ └──────┘ └────────┘ └──────┘ └──────┘    │
 * │                                                                   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 五、广播消息流程详解
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  页面 A 发送广播                                                   │
 * │  ┌────────────────────┐                                          │
 * │  │ controller.        │                                          │
 * │  │  postMessage({     │                                          │
 * │  │   type:'broadcast',│                                          │
 * │  │   data:'Hello'     │                                          │
 * │  │  })                │                                          │
 * │  └──────────┬─────────┘                                          │
 * │             │                                                     │
 * │             ▼                                                     │
 * │      Service Worker 收到消息                                      │
 * │      ┌──────────────────────┐                                    │
 * │      │ type === 'broadcast' │                                    │
 * │      └──────────┬───────────┘                                    │
 * │                 │                                                 │
 * │                 ▼                                                 │
 * │      获取所有客户端                                               │
 * │      ┌──────────────────────┐                                    │
 * │      │ const allClients =   │                                    │
 * │      │  await self.clients  │                                    │
 * │      │  .matchAll({         │                                    │
 * │      │   type: 'window',    │                                    │
 * │      │   includeUncontrolled│                                    │
 * │      │  })                  │                                    │
 * │      └──────────┬───────────┘                                    │
 * │                 │                                                 │
 * │                 ▼                                                 │
 * │      遍历所有客户端                                               │
 * │      ┌──────────────────────┐                                    │
 * │      │ allClients.forEach   │                                    │
 * │      │  (client =>          │                                    │
 * │      │   client.postMessage)│                                    │
 * │      └──────┬───────────────┘                                    │
 * │             │                                                     │
 * │    ┌────────┼────────┬────────┐                                 │
 * │    ▼        ▼        ▼        ▼                                 │
 * │  页面A    页面B    页面C    页面D                                 │
 * │  收到     收到     收到     收到                                  │
 * │                                                                   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 六、点对点消息流程详解
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  页面 A 发送私信给页面 B                                           │
 * │  ┌────────────────────┐                                          │
 * │  │ controller.        │                                          │
 * │  │  postMessage({     │                                          │
 * │  │   type:'private',  │                                          │
 * │  │   target:'page-B', │                                          │
 * │  │   data:'Hi B'      │                                          │
 * │  │  })                │                                          │
 * │  └──────────┬─────────┘                                          │
 * │             │                                                     │
 * │             ▼                                                     │
 * │      Service Worker 收到消息                                      │
 * │      ┌──────────────────────┐                                    │
 * │      │ type === 'private'   │                                    │
 * │      └──────────┬───────────┘                                    │
 * │                 │                                                 │
 * │                 ▼                                                 │
 * │      检查目标是否在线                                             │
 * │      ┌──────────────────────┐                                    │
 * │      │ connections.         │                                    │
 * │      │  has(target)?        │                                    │
 * │      └──────┬───────┬───────┘                                    │
 * │             │ Yes   │ No                                         │
 * │             ▼       ▼                                            │
 * │      ┌──────────┐ ┌─────────┐                                   │
 * │      │获取目标ID│ │输出警告 │                                   │
 * │      │targetConn│ │未找到   │                                   │
 * │      └─────┬────┘ └─────────┘                                   │
 * │            │                                                      │
 * │            ▼                                                      │
 * │      查找目标客户端                                               │
 * │      ┌──────────────────────┐                                    │
 * │      │ const allClients =   │                                    │
 * │      │  await self.clients  │                                    │
 * │      │  .matchAll()         │                                    │
 * │      │                      │                                    │
 * │      │ const targetClient = │                                    │
 * │      │  allClients.find(    │                                    │
 * │      │   c => c.id ===      │                                    │
 * │      │   targetConn.id)     │                                    │
 * │      └─────┬────────────────┘                                    │
 * │            │                                                      │
 * │            ▼                                                      │
 * │      发送消息                                                     │
 * │      ┌──────────────────────┐                                    │
 * │      │ targetClient.        │                                    │
 * │      │  postMessage({       │                                    │
 * │      │   type: 'private',   │                                    │
 * │      │   data: ...          │                                    │
 * │      │  })                  │                                    │
 * │      └─────┬────────────────┘                                    │
 * │            │                                                      │
 * │            ▼                                                      │
 * │      ┌─────────┐                                                 │
 * │      │ 页面 B  │                                                 │
 * │      │ 收到消息│                                                 │
 * │      └─────────┘                                                 │
 * │                                                                   │
 * │      页面 A、C、D 不会收到此消息                                  │
 * │                                                                   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 七、自动清理机制
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                     定期清理断开的连接                             │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                   │
 * │  定时器 (每 30 秒)                                                │
 * │       │                                                           │
 * │       ▼                                                           │
 * │  ┌──────────────────┐                                            │
 * │  │ setInterval(() =>│                                            │
 * │  │  {...}, 30000)   │                                            │
 * │  └────────┬─────────┘                                            │
 * │           │                                                       │
 * │           ▼                                                       │
 * │  1. 获取所有活跃客户端                                            │
 * │  ┌──────────────────────────┐                                    │
 * │  │ const allClients =       │                                    │
 * │  │  await self.clients      │                                    │
 * │  │  .matchAll()             │                                    │
 * │  └────────┬─────────────────┘                                    │
 * │           │                                                       │
 * │           ▼                                                       │
 * │  2. 提取所有活跃客户端 ID                                         │
 * │  ┌──────────────────────────┐                                    │
 * │  │ const activeClientIds =  │                                    │
 * │  │  new Set(                │                                    │
 * │  │   allClients.map(c=>c.id)│                                    │
 * │  │  )                       │                                    │
 * │  └────────┬─────────────────┘                                    │
 * │           │                                                       │
 * │           ▼                                                       │
 * │  3. 遍历 connections Map                                         │
 * │  ┌──────────────────────────┐                                    │
 * │  │ for (const [pageId,      │                                    │
 * │  │      conn] of            │                                    │
 * │  │      connections) {      │                                    │
 * │  └────────┬─────────────────┘                                    │
 * │           │                                                       │
 * │           ▼                                                       │
 * │  4. 检查是否还活跃                                                │
 * │  ┌──────────────────────────┐                                    │
 * │  │ if (!activeClientIds     │                                    │
 * │  │     .has(conn.id)) {     │                                    │
 * │  │   // 客户端已断开        │                                    │
 * │  └────────┬─────────────────┘                                    │
 * │           │                                                       │
 * │           ▼                                                       │
 * │  5. 清理断开的连接                                                │
 * │  ┌──────────────────────────┐                                    │
 * │  │ connections.delete(      │                                    │
 * │  │   pageId                 │                                    │
 * │  │ )                        │                                    │
 * │  └──────────────────────────┘                                    │
 * │                                                                   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 八、数据结构设计
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  connections: Map<string, ClientInfo>                           │
 * │  ──────────────────────────────────────                         │
 * │                                                                   │
 * │  结构示例：                                                       │
 * │  ┌───────────┬──────────────────────────────┐                   │
 * │  │    Key    │           Value              │                   │
 * │  ├───────────┼──────────────────────────────┤                   │
 * │  │ 'page-123'│ {                            │                   │
 * │  │           │   client: Client对象,        │                   │
 * │  │           │   id: 'client-abc123',       │                   │
 * │  │           │   pageId: 'page-123',        │                   │
 * │  │           │   lastActive: 1699999999999  │                   │
 * │  │           │ }                            │                   │
 * │  ├───────────┼──────────────────────────────┤                   │
 * │  │ 'page-456'│ {                            │                   │
 * │  │           │   client: Client对象,        │                   │
 * │  │           │   id: 'client-xyz789',       │                   │
 * │  │           │   pageId: 'page-456',        │                   │
 * │  │           │   lastActive: 1699999999999  │                   │
 * │  │           │ }                            │                   │
 * │  └───────────┴──────────────────────────────┘                   │
 * │                                                                   │
 * │  为什么保存 client.id？                                           │
 * │  ════════════════════                                            │
 * │  Service Worker 需要通过 clients.matchAll() 获取客户端列表       │
 * │  保存 client.id 可以快速匹配到目标客户端                          │
 * │                                                                   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 九、Service Worker vs SharedWorker 对比
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                          关键区别                                 │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                   │
 * │  特性              Service Worker        SharedWorker            │
 * │  ════              ═══════════════        ════════════           │
 * │                                                                   │
 * │  生命周期          持久化运行             页面关闭即终止          │
 * │                   （页面关闭后继续）                               │
 * │                                                                   │
 * │  通信方式          单向 postMessage       双向 MessagePort        │
 * │                   需要 clients API                                │
 * │                                                                   │
 * │  HTTPS 要求        必须（开发可用         不强制                  │
 * │                   localhost）                                     │
 * │                                                                   │
 * │  首次使用          需要刷新页面           立即可用                │
 * │                                                                   │
 * │  主要用途          离线缓存、推送通知、   简单页面通信            │
 * │                   跨页面通信                                      │
 * │                                                                   │
 * │  调试难度          较高                   中等                    │
 * │                                                                   │
 * │  浏览器支持        广泛支持               Safari 需开启实验性     │
 * │                                          功能                     │
 * │                                                                   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 十、使用示例
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  // 页面端代码                                                    │
 * │                                                                   │
 * │  // 1. 注册 Service Worker                                       │
 * │  const registration = await navigator.serviceWorker.register(   │
 * │      './service-worker.js'                                       │
 * │  );                                                              │
 * │                                                                   │
 * │  // 2. 等待激活                                                  │
 * │  await navigator.serviceWorker.ready;                           │
 * │                                                                   │
 * │  // 3. 监听消息                                                  │
 * │  navigator.serviceWorker.addEventListener('message', (event) =>  │
 * │      console.log('收到:', event.data);                           │
 * │  });                                                             │
 * │                                                                   │
 * │  // 4. 发送注册消息                                              │
 * │  navigator.serviceWorker.controller.postMessage({               │
 * │      type: 'register',                                           │
 * │      pageId: 'page-123'                                          │
 * │  });                                                             │
 * │                                                                   │
 * │  // 5. 发送广播                                                  │
 * │  navigator.serviceWorker.controller.postMessage({               │
 * │      type: 'broadcast',                                          │
 * │      pageId: 'page-123',                                         │
 * │      data: 'Hello everyone!'                                     │
 * │  });                                                             │
 * │                                                                   │
 * │  // 6. 发送私信                                                  │
 * │  navigator.serviceWorker.controller.postMessage({               │
 * │      type: 'private',                                            │
 * │      pageId: 'page-123',                                         │
 * │      target: 'page-456',                                         │
 * │      data: 'Hi page-456!'                                        │
 * │  });                                                             │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 十一、核心要点
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  1. 必须使用 HTTPS（开发环境可用 localhost 或 127.0.0.1）         │
 * │  2. 首次注册后需要刷新页面才能生效                                 │
 * │  3. skipWaiting() 可跳过等待立即激活                              │
 * │  4. clients.claim() 可立即控制所有页面                            │
 * │  5. 使用 clients.matchAll() 获取所有客户端                        │
 * │  6. pageId 必须唯一且稳定                                         │
 * │  7. Service Worker 持久化运行，需要定期清理失效连接               │
 * │  8. 修改 Service Worker 文件后会自动更新（需要刷新页面）          │
 * │  9. 调试时可勾选 "Update on reload" 加快开发                     │
 * │ 10. 访问 chrome://serviceworker-internals/ 可管理所有 SW          │
 * └─────────────────────────────────────────────────────────────────┘
 */

// Service Worker 跨页面通信脚本

// 存储所有连接的页面客户端（使用 Map，key 是 pageId，value 是 client）
const connections = new Map();

console.log('Service Worker 已加载');

// 安装事件
self.addEventListener('install', (event) => {
    console.log('Service Worker 安装中...');
    // 跳过等待，立即激活
    self.skipWaiting();
});

// 激活事件
self.addEventListener('activate', (event) => {
    console.log('Service Worker 已激活');
    // 立即控制所有页面
    event.waitUntil(self.clients.claim());
});

// 监听来自页面的消息
self.addEventListener('message', async (event) => {
    console.log('Service Worker 收到消息:', event.data);

    const { type, pageId, target, data } = event.data;
    const client = event.source;

    // 0. 处理注册消息
    if (type === 'register') {
        // 保存客户端连接
        connections.set(pageId, {
            client: client,
            id: client.id,
            pageId: pageId
        });

        console.log(`页面 ${pageId} 已注册，当前在线：[${Array.from(connections.keys()).join(', ')}]`);

        // 发送注册成功消息
        client.postMessage({
            type: 'registered',
            from: 'ServiceWorker',
            data: `注册成功，当前在线 ${connections.size} 个页面`
        });
        return;
    }

    // 1. 处理广播消息
    if (type === 'broadcast') {
        console.log(`广播消息给 ${connections.size} 个连接`);

        // 获取所有客户端（包括未注册的）
        const allClients = await self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        });

        // 遍历所有客户端发送消息
        allClients.forEach((client) => {
            try {
                client.postMessage({
                    type: 'broadcast',
                    from: 'ServiceWorker',
                    sender: pageId,
                    data: `广播消息：${data}`
                });
            } catch (e) {
                console.error('发送失败:', e);
            }
        });
    }

    // 2. 处理点对点消息
    if (type === 'private') {
        console.log(`私发消息给 ${target}，当前连接：[${Array.from(connections.keys()).join(', ')}]`);

        if (connections.has(target)) {
            const targetConn = connections.get(target);

            try {
                // 通过 client ID 查找目标客户端
                const allClients = await self.clients.matchAll({
                    type: 'window',
                    includeUncontrolled: true
                });

                const targetClient = allClients.find(c => c.id === targetConn.id);

                if (targetClient) {
                    targetClient.postMessage({
                        type: 'private',
                        from: 'ServiceWorker',
                        sender: pageId,
                        data: `私发消息：${data}`
                    });
                } else {
                    console.log(`警告：客户端 ${target} 已断开`);
                    connections.delete(target);
                }
            } catch (e) {
                console.error('发送失败:', e);
                connections.delete(target);
            }
        } else {
            console.log(`警告：未找到目标页面 ${target}`);
        }
    }

    // 3. 处理心跳检测（用于清理断开的连接）
    if (type === 'heartbeat') {
        // 更新最后活跃时间
        if (connections.has(pageId)) {
            const conn = connections.get(pageId);
            conn.lastActive = Date.now();
            connections.set(pageId, conn);
        }
    }

    // 4. 处理断开连接
    if (type === 'disconnect') {
        connections.delete(pageId);
        console.log(`页面 ${pageId} 断开连接，当前在线：[${Array.from(connections.keys()).join(', ')}]`);
    }

    // 5. 获取在线列表
    if (type === 'get-online') {
        client.postMessage({
            type: 'online-list',
            from: 'ServiceWorker',
            data: Array.from(connections.keys())
        });
    }
});

// 定期清理断开的连接（每30秒检查一次）
setInterval(async () => {
    const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    });

    const activeClientIds = new Set(allClients.map(c => c.id));

    // 清理已断开的连接
    for (const [pageId, conn] of connections.entries()) {
        if (!activeClientIds.has(conn.id)) {
            console.log(`清理断开的连接: ${pageId}`);
            connections.delete(pageId);
        }
    }
}, 30000);
