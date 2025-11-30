<template>
  <div class="home">
    <h1>首页 (Home - Iframe 1)</h1>
    <p>欢迎来到首页{{ sessionData }}</p>
    <router-link to="/about">前往关于页面</router-link>

    <div class="message-box">
      <h3>发送消息</h3>
      <input v-model="messageInput" type="text" placeholder="输入消息..." @keyup.enter="sendToAbout">
      <button @click="sendToAbout">发送到 About 页面</button>
      <button @click="sendStorageAbout">发送到 About 页面(storage)</button>
      <button @click="sendMessageByBroadChannel">发送到 About 页面(BroadChannel)</button>
      <button @click="sendToParent">发送到父页面</button>
    </div>

    <div class="log-box">
      <h3>接收日志</h3>
      <div class="log-content" ref="logContent">
        <div v-for="(log, index) in receivedLogs" :key="index" class="log-item">
          <small>{{ log.time }}</small><br>
          <strong>来自:</strong> {{ log.from }}<br>
          <strong>消息:</strong> {{ log.message }}
        </div>
        <div v-if="receivedLogs.length === 0" class="empty-log">
          暂无消息
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const messageInput = ref('')
const receivedLogs = ref([])
const logContent = ref(null)

// 添加日志
const addLog = (from, message) => {
  receivedLogs.value.push({
    time: new Date().toLocaleTimeString(),
    from: from,
    message: message
  })

  // 滚动到底部
  nextTick(() => {
    if (logContent.value) {
      logContent.value.scrollTop = logContent.value.scrollHeight
    }
  })
}

// 监听消息
const handleMessage = (event) => {
  console.log('Home 页面收到消息:', event)

  // 处理普通消息
  if (event.data && event.data.message) {
    addLog(event.data.from || '未知', event.data.message)
  }

  // 处理 sessionStorage 更新通知
  if (event.data && event.data.type === 'SESSION_STORAGE_UPDATE') {
    console.log('收到 sessionStorage 更新通知:', event.data)
    sessionData.value = event.data.value
    addLog(event.data.from || '未知', `sessionStorage 已更新: ${event.data.key} = ${event.data.value}`)
  }
}

// 发送消息到 About 页面（通过父窗口转发）
const sendToAbout = () => {
  if (!messageInput.value.trim()) {
    alert('请输入消息')
    return
  }

  window.parent.postMessage({
    target: 'iframe2',
    from: 'Home (iframe1)',
    message: messageInput.value
  }, '*')

  messageInput.value = ''
}

// 发送消息到父页面
const sendToParent = () => {
  if (!messageInput.value.trim()) {
    alert('请输入消息')
    return
  }

  window.parent.postMessage({
    target: 'parent',
    from: 'Home (iframe1)',
    message: messageInput.value
  }, '*')

  messageInput.value = ''
}

const sessionData = ref(sessionStorage.getItem('key'))

const sendStorageAbout = () => {
  if (!messageInput.value.trim()) {
    alert('请输入消息')
    return
  }

  // 更新本地的 sessionStorage
  sessionStorage.setItem("key", messageInput.value);
  sessionData.value = messageInput.value;

  // 通知其他 iframe 数据已更新
  window.parent.postMessage({
    type: 'SESSION_STORAGE_UPDATE',
    key: 'key',
    value: messageInput.value,
    from: 'Home (iframe1)'
  }, '*');

  messageInput.value = '';
  alert('已更新 sessionStorage 并通知其他页面');
}

const receiveMsg = () => {
  const parentChannel = new BroadcastChannel('parent-child-channel');
  parentChannel.onmessage = (e) => {

    console.log('打印***e home', e)
  }
}
receiveMsg()

function sendMessageByBroadChannel() {
  // 1. 创建频道
  const parentChannel = new BroadcastChannel('parent-child-channel');

  // 2. 点击按钮向子窗口发送消息
  parentChannel.postMessage({
    type: 'refresh-data',
    message: '父页面指令：请刷新数据'
  });


  // 3. 页面卸载时关闭频道
  window.addEventListener('beforeunload', () => {
    parentChannel.close();
  });
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
  console.log('Home 页面已挂载，开始监听消息和 sessionStorage 更新')
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.home {
  padding: 20px;
  background-color: #e3f2fd;
  min-height: 100vh;
}

h1 {
  color: #1976d2;
}

h3 {
  color: #1565c0;
  margin-top: 20px;
  margin-bottom: 10px;
}

a {
  color: #42b983;
  text-decoration: none;
  margin-top: 10px;
  display: inline-block;
  padding: 8px 16px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #42b983;
}

a:hover {
  background-color: #42b983;
  color: white;
}

.message-box {
  margin-top: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-box input {
  padding: 8px 12px;
  width: 300px;
  border: 1px solid #1976d2;
  border-radius: 4px;
  font-size: 14px;
}

.message-box button {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
  font-size: 14px;
}

.message-box button:hover {
  background-color: #1565c0;
}

.log-box {
  margin-top: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.log-content {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  background-color: #fafafa;
}

.log-item {
  padding: 10px;
  margin-bottom: 8px;
  background-color: white;
  border-left: 3px solid #1976d2;
  border-radius: 4px;
}

.log-item:last-child {
  margin-bottom: 0;
}

.log-item small {
  color: #666;
}

.empty-log {
  color: #999;
  text-align: center;
  padding: 20px;
}
</style>
