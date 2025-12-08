<template>
  <div class="about">
    <h1>关于页面 (About - Iframe 2)</h1>
    <p>这是关于页面的内容 {{ sessionData }}</p>
    <router-link to="/home">返回首页</router-link>
    {{ name }}

    <div class="message-box">
      <h3>PostMessage 通信</h3>
      <input v-model="messageInput" type="text" placeholder="输入消息..." @keyup.enter="sendToHome">
      <button @click="sendToHome">发送到 Home 页面</button>
      <button @click="sendStorageAbout">发送到 Home 页面(storage)</button>
      <button @click="sendMessageByBroadChannel">发送到 Home 页面(BroadChannel)</button>
      <button @click="sendToParent">发送到父页面</button>
    </div>

    <div class="message-box channel-box">
      <h3>MessageChannel 通信</h3>
      <div>
        <input v-model="channelInput" type="text" placeholder="输入Channel消息..." @keyup.enter="sendToParentViaChannel">
        <button class="channel-button" @click="sendToParentViaChannel">Channel发送到父页面</button>
        <button class="channel-button" @click="sendChannelToHome">Channel转发到Home</button>
      </div>
    </div>

    <div class="message-box brother-box">
      <h3>兄弟通信</h3>
      <div>
        <input v-model="brotherInput" type="text" placeholder="输入兄弟通信消息..." @keyup.enter="sendToHomeBrother">
        <button class="brother-button" @click="sendToHomeBrother">发送给 Home</button>
      </div>
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
const channelInput = ref('')
const brotherInput = ref('')
const receivedLogs = ref([])
const logContent = ref(null)

// MessageChannel 相关变量
let messageChannelPort = null
const messageChannelConnected = ref(false)

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

// 初始化MessageChannel
const initMessageChannel = () => {
  // 通知父页面About页面已准备好
  window.parent.postMessage({
    type: 'MESSAGE_CHANNEL_READY',
    from: 'About',
    action: 'init'
  }, '*')

  console.log('About页面请求初始化MessageChannel')
}

// 监听消息
const handleMessage = (event) => {
  console.log('About 页面收到消息:', event)

  // 处理MessageChannel初始化
  if (event.data && event.data.type === 'MESSAGE_CHANNEL_READY' && event.data.action === 'ready') {
    if (event.ports && event.ports.length > 0) {
      messageChannelPort = event.ports[0]

      messageChannelPort.onmessage = (channelEvent) => {
        console.log('About页面通过MessageChannel收到消息:', channelEvent.data)
        addLog('父页面 (MessageChannel)', channelEvent.data.message || JSON.stringify(channelEvent.data))
      }

      messageChannelPort.start()
      messageChannelConnected.value = true
      console.log('About页面MessageChannel已建立')
      addLog('初始化', 'MessageChannel连接已建立')
    }
    return
  }

  // 处理兄弟通信
  if (event.data && event.data.type === 'BROTHER_COMMUNICATION') {
    addLog(event.data.from, event.data.message)
    return
  }

  // 处理普通消息
  if (event.data && event.data.message) {
    addLog(event.data.from || '未知', event.data.message)
  }

  // 处理 localStorage 更新通知
  if (event.data && event.data.type === 'SESSION_STORAGE_UPDATE') {
    console.log('收到 localStorage 更新通知:', event.data)
    sessionData.value = event.data.value
    addLog(event.data.from || '未知', `localStorage 已更新: ${event.data.key} = ${event.data.value}`)
  }
}

// 发送消息到 Home 页面（通过父窗口转发）
const sendToHome = () => {
    window.location.reload()

  if (!messageInput.value.trim()) {
    alert('请输入消息')
    return
  }

  window.parent.postMessage({
    target: 'iframe1',
    from: 'About (iframe2)',
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
    from: 'About (iframe2)',
    message: messageInput.value
  }, '*')

  messageInput.value = ''
}

const sendStorageAbout = () => {
  if (!messageInput.value.trim()) {
    alert('请输入消息')
    return
  }

  // 更新本地的 localStorage
  localStorage.setItem("key", messageInput.value);
  sessionData.value = messageInput.value;

  // 通知其他 iframe 数据已更新
  window.parent.postMessage({
    type: 'SESSION_STORAGE_UPDATE',
    key: 'key',
    value: messageInput.value,
    from: 'About (iframe2)'
  }, '*');

  messageInput.value = '';
  alert('已更新 localStorage 并通知其他页面');
}

const sessionData = ref(localStorage.getItem('key'))

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

const receiveMsg = () => {
  const parentChannel = new BroadcastChannel('parent-child-channel');
  parentChannel.onmessage = (e) => {

    console.log('打印***e about', e)
  }
}
receiveMsg()

// 通过MessageChannel发送消息到父页面
const sendToParentViaChannel = () => {
  if (!channelInput.value.trim()) {
    alert('请输入消息')
    return
  }

  if (messageChannelPort) {
    messageChannelPort.postMessage({
      from: 'About',
      message: channelInput.value,
      via: 'MessageChannel'
    })
    addLog('About', '(发送) ' + channelInput.value)
  } else {
    alert('MessageChannel未建立')
  }

  channelInput.value = ''
}

// 通过MessageChannel转发消息到Home
const sendChannelToHome = () => {
  if (!channelInput.value.trim()) {
    alert('请输入消息')
    return
  }

  if (messageChannelPort) {
    messageChannelPort.postMessage({
      from: 'About',
      message: channelInput.value,
      forwardToHome: true,
      via: 'MessageChannel'
    })
    addLog('About', '(请求转发到Home) ' + channelInput.value)
  } else {
    alert('MessageChannel未建立')
  }

  channelInput.value = ''
}

// 兄弟通信 - 发送给Home
const sendToHomeBrother = () => {
  if (!brotherInput.value.trim()) {
    alert('请输入消息')
    return
  }

  // 通过父页面转发给Home
  window.parent.postMessage({
    target: 'iframe1',
    from: 'About (兄弟通信)',
    message: brotherInput.value,
    type: 'BROTHER_COMMUNICATION'
  }, '*')

  addLog('About', '(发送给Home) ' + brotherInput.value)
  brotherInput.value = ''
}
const name = ref(window.parent.name)

onMounted(() => {
  // window.addEventListener('message', handleMessage)
  window.addEventListener('storage', handleMessage)
  setTimeout(initMessageChannel, 500) // 延迟初始化MessageChannel
  console.log('About 页面已挂载，开始监听消息和 localStorage 更新')
  console.log('打印***window.name',window.name)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
  if (messageChannelPort) {
    messageChannelPort.close()
  }
})
</script>

<style scoped>
.about {
  padding: 20px;
  background-color: #f3e5f5;
  min-height: 100vh;
}

h1 {
  color: #7b1fa2;
}

h3 {
  color: #6a1b9a;
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
  border: 1px solid #7b1fa2;
  border-radius: 4px;
  font-size: 14px;
}

.message-box button {
  padding: 8px 16px;
  background-color: #7b1fa2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
  font-size: 14px;
}

.message-box button:hover {
  background-color: #6a1b9a;
}

.channel-box {
  border-color: #e91e63;
}

.channel-box h3 {
  color: #e91e63;
}

.channel-button {
  background-color: #e91e63;
}

.channel-button:hover {
  background-color: #c2185b;
}

.brother-box {
  border-color: #9c27b0;
}

.brother-box h3 {
  color: #9c27b0;
}

.brother-button {
  background-color: #9c27b0;
}

.brother-button:hover {
  background-color: #7b1fa2;
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
  border-left: 3px solid #7b1fa2;
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
