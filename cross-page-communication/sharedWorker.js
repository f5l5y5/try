// SharedWorker 跨页面通讯实现

// 客户端连接管理
const clients = new Map();
let clientCounter = 0;

// 发送消息给所有客户端
function broadcast(message, excludeClientId = null) {
    clients.forEach((client, clientId) => {
        if (clientId !== excludeClientId) {
            client.port.postMessage(message);
        }
    });
}

// 发送消息给指定客户端
function sendDirectMessage(message, targetClientId, senderId) {
    const targetClient = clients.get(targetClientId);
    if (targetClient) {
        targetClient.port.postMessage({
            type: 'direct',
            message: message,
            senderId: senderId
        });
    }
}

// 广播客户端列表
function broadcastClientList() {
    const clientIds = Array.from(clients.keys());
    broadcast({
        type: 'clientList',
        clients: clientIds
    });
}

// 处理新连接
self.onconnect = (event) => {
    const port = event.ports[0];
    clientCounter++;
    const clientId = `client_${clientCounter}`;
    
    // 存储客户端连接
    clients.set(clientId, { port: port });
    
    // 发送初始化消息
    port.postMessage({
        type: 'init',
        clientId: clientId
    });
    
    // 广播新客户端连接
    broadcast({
        type: 'clientConnected',
        clientId: clientId
    }, clientId);
    
    // 发送客户端列表
    port.postMessage({
        type: 'clientList',
        clients: Array.from(clients.keys())
    });
    
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
            
            case 'disconnect':
                // 处理客户端断开连接
                clients.delete(clientId);
                broadcast({
                    type: 'clientDisconnected',
                    clientId: clientId
                });
                broadcastClientList();
                break;
            
            default:
                // 未知消息类型
                port.postMessage({
                    type: 'error',
                    message: `未知消息类型: ${data.type}`
                });
        }
    };
    
    // 监听端口关闭
    port.onmessageerror = (error) => {
        console.error(`SharedWorker 消息错误: ${error}`);
    };
    
    // 监听端口关闭
    port.onclose = () => {
        // 移除客户端
        clients.delete(clientId);
        // 广播客户端断开连接
        broadcast({
            type: 'clientDisconnected',
            clientId: clientId
        });
        // 更新客户端列表
        broadcastClientList();
    };
    
    // 启动端口
    port.start();
};

// 监听错误
self.onerror = (error) => {
    console.error(`SharedWorker 错误: ${error}`);
};