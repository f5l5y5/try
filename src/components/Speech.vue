<template>
    <div ref="content">
        Web Speech API 是一组用于实现语音输入和语音输出的 API。它包含两个主要的部分，即 SpeechRecognition 和 SpeechSynthesis。
    </div>
    <a-slider v-model:value="percent" :min="0" :max="100" />percent: {{ percent }}%
    <a-button @click="startSpeech" type="primary"> 朗读 </a-button>

    <a-button @click="cancel"> 取消朗读 </a-button>
    <a-button @click="pauseSpeech"> 暂停 </a-button>
    <a-button @click="resumeSpeech"> 继续 </a-button>
    <a-button @click="recordSpeech"> 录制 </a-button>
    <a-button @click="stopSpeech"> 停止录制 </a-button>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const percent = ref(0)
const content = ref()
const startSpeech = () => {
    const msg = new SpeechSynthesisUtterance()
    msg.text = content.value.innerText
    msg.volume = 1; // 声音的音量，区间范围是0到1，默认是1。
    msg.rate = 1;// 设置播放语速，范围：0.1 - 10之间    正常为1倍播放
    msg.pitch = 1; // 表示说话的音高，数值，范围从0（最小）到2（最大）。默认值为1。
    msg.lang = 'zh-CN'; // 使用的语言，字符串， 例如："zh-cn"
    window.speechSynthesis.speak(msg)
    // 控制进度
    msg.onboundary = (event) => {
        percent.value = event.charIndex / msg.text.length * 100
    }
}

const cancel = () => {
    window.speechSynthesis.cancel()
}

const pauseSpeech = () => {
    window.speechSynthesis.pause()
}

const resumeSpeech = () => {
    window.speechSynthesis.resume()
}



const recordSpeech = () => {
    // const SpeechRecognition =
    //     window.SpeechRecognition ?? window.webkitSpeechRecognition;

    // const recognition = new SpeechRecognition();
    // recognition.start();
    // recognition.onresult = (event) => {
    //     const speechToText = event.results[0][0].transcript;
    //     console.log(speechToText);
    // };


    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        console.log('打印***1',1)
        // 创建 SpeechRecognition 对象
        const recognition = new webkitSpeechRecognition();

        // 设置语音识别参数
        recognition.continuous = true;
        recognition.interimResults = true;

        // 语音输入开始
        recognition.onstart = (e) => {
            console.log('语音输入开始',e);
        };

        // 监听到语音输入后获取结果
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log(transcript);
        };

        recognition.soundstart = (event) =>{
            console.log('打印***event',event)
        }

        // 语音输入结束
        recognition.onend = () => {
            console.log('语音输入结束');
        };

        // 开始语音输入
        recognition.start();

        setTimeout(()=>{
            recognition.stop()
        },5000)
    } else {
        console.log('浏览器不支持 Web Speech API');
    }
}


</script>

<style scoped lang="scss"></style>