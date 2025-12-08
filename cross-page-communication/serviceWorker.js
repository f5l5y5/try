// ServiceWorker 跨页面通讯实现

// 客户端列表
const clientsList = new Set();

// 日志函数
function log(message) {
    console.log(`[ServiceWorker] ${message}`);
}

// 发送消息给所有客户端
async function broadcastMessage(message) {
    const allClients = await self.clients.matchAll();
    allClients.forEach(client => {
        client.postMessage(message);
    });
}

// 发送消息给指定客户端
async function sendToClient(clientId, message) {
    const client = await self.clients.get(clientId);
    if (client) {
        client.postMessage(message);
    }
}

// 监听安装事件
self.addEventListener('install', (event) => {
    log('ServiceWorker 安装成功');
    // 立即激活
    self.skipWaiting();
});

// 监听激活事件
self.addEventListener('activate', (event) => {
    log('ServiceWorker 激活成功');
    // 立即获取控制权
    event.waitUntil(self.clients.claim());
});

// 监听消息事件
self.addEventListener('message', (event) => {
    const data = event.data;
    const clientId = event.source.id;
    
    log(`收到来自客户端 ${clientId} 的消息: ${JSON.stringify(data)}`);
    
    switch (data.type) {
        case 'message':
            // 回复客户端消息
            event.source.postMessage(`${data.sender} 发送的消息: ${data.content}`);
            break;
            
        case 'broadcast':
            // 广播消息给所有客户端，包含通讯类型
            broadcastMessage(`${data.sender} 广播的消息: ${data.content}`);
            break;
            
        case 'register':
            // 注册客户端
            clientsList.add(clientId);
            log(`客户端 ${clientId} 已注册`);
            // 广播新客户端连接
            broadcastMessage(`客户端 ${clientId} 已连接`);
            break;
            
        case 'unregister':
            // 注销客户端
            clientsList.delete(clientId);
            log(`客户端 ${clientId} 已注销`);
            // 广播客户端断开连接
            broadcastMessage(`客户端 ${clientId} 已断开连接`);
            break;
            
        default:
            // 未知消息类型
            event.source.postMessage(`未知消息类型: ${data.type}`);
    }
});

// 监听客户端连接事件
self.addEventListener('connect', (event) => {
    const port = event.ports[0];
    log('客户端连接事件触发');
    
    port.onmessage = (event) => {
        log(`收到来自端口的消息: ${event.data}`);
        port.postMessage(`ServiceWorker 已收到端口消息: ${event.data}`);
    };
    
    port.start();
});

// 监听 fetch 事件（可选，用于演示）
self.addEventListener('fetch', (event) => {
    // 简单的 fetch 事件处理
    log(`处理 fetch 请求: ${event.request.url}`);
});

// 监听 push 事件（可选，用于演示）
self.addEventListener('push', (event) => {
    log('收到推送通知');
    if (event.data) {
        const data = event.data.json();
        log(`推送数据: ${JSON.stringify(data)}`);
        
        // 显示推送通知
        const options = {
            body: data.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// 监听通知点击事件
self.addEventListener('notificationclick', (event) => {
    log('通知被点击');
    event.notification.close();
    
    // 打开应用页面
    event.waitUntil(
        self.clients.openWindow('/cross-page-communication/serviceWorker.html')
    );
});

log('ServiceWorker 脚本已加载');
