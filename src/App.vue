<template>
	<!-- <Scope /> -->
<!-- <VirtualList /> -->
<Speech />
<img :src="base" alt="" srcset="">

</template>

<!-- <VirtualList /> -->
<!-- <Demo /> -->
<!-- <Dom /> -->
<!-- <HelloWorld /> -->
<!-- <div>{{ rest }}</div> -->
<!-- <button @click="click">点击</button> -->
<!-- <button @click="download">点击下载图片</button> -->
<!-- <Login /> -->
<!-- <Curd /> -->
<!-- <Webwork /> -->
<script setup>
import Speech from './components/Speech.vue';
import base from './img.data?raw';

console.log('打印***base',base)

// import { ref } from 'vue'
// const base = ref(base)
// import Dom from './components/Dom.vue'
// import VirtualList from './components/VirtualList.vue'
// import Demo from './components/Demo.vue'
// import HelloWorld from './components/HelloWorld.vue'
// import axios from 'axios'
// import { ref } from 'vue'
// import Login from './components/Login.vue'
// import Curd from './components/Curd.vue'
// import Webwork from './components/Webwork.vue'
// import Scope from './components/Scope.vue';
// import './utils/ast'

	









// const download = async () => {
// 	// window.open('http://localhost:3000/upload/download')
// 	// location.href = 'http://localhost:3000/upload/download'
// 	const res = await fetch('http://localhost:3000/upload/stream').then(res => res.arrayBuffer())

// 	const a = document.createElement('a')
//   a.href = URL.createObjectURL(new Blob([res],{
//     // type:"image/png"
//   }))
//   a.download
//   a.click()

// 	console.log('打印***res download', res)

// }

// const rest = ref('')

// let lastModified
// let etag
// const click = async () => {
// 	function http(method, url, data, successCallback, errorCallback) {
// 		// 创建一个XMLHttpRequest对象
// 		const xhr = new XMLHttpRequest()

// 		// 设置请求的参数和回调函数
// 		xhr.open(method, url)
// 		// xhr.setRequestHeader('Content-Type', 'application/json')
// 		xhr.onreadystatechange = function () {
// 			// 在回调函数中，我们检查readyState属性是否为XMLHttpRequest.DONE，表示请求已完成。
// 			if (xhr.readyState === XMLHttpRequest.DONE) {
// 				//如果status属性为200，表示请求成功，我们调用成功回调函数并将响应内容作为参数传递。
// 				if (xhr.status === 200) {
// 					successCallback(xhr.responseText)
// 				} else {
// 					errorCallback(xhr.status)
// 				}
// 			}
// 		}

// 		// 发送请求
// 		xhr.send(JSON.stringify(data))
// 	}

// 	// http(
// 	// 	'get',
// 	// 	'http://localhost:3000/cache',
// 	// 	{},
// 	// 	function (response) {
// 	// 		console.log('response',response)
// 	// 	},
// 	// 	function (status) {
// 	// 		console.error('请求失败：' + status)
// 	// 	}
// 	// )

// 	axios
// 		.get('http://localhost:3000/cache', {
// 			headers: {
// 				'If-Modified-Since': lastModified,
// 				'If-None-Match': etag,
// 				// Pragma: 'no-cache'
// 				'Cache-Control': 'public'
// 			}
// 		})
// 		.then(response => {
// 			// 服务器返回的是新的资源，更新本地的 ETag 和 Last-Modified 字段
// 			if (response.status === 200) {
// 				console.log('打印***response', response)
// 				lastModified = response.headers['last-modified']
// 				etag = response.headers.etag
// 				console.log('打印***etag', etag)
// 				// 处理返回的数据
// 				// ...
// 			} else if (response.status === 304) {
// 				// 服务器返回的是缓存的资源，不需要更新本地的 ETag 和 Last-Modified 字段
// 				// 处理返回的数据
// 				// ...
// 			}
// 		})
// 		.catch(error => {
// 			// 处理请求错误
// 			// ...
// 		})

// 	// axios
// 	// 	.get('http://localhost:3000/cache', {
// 	// 		headers: {
// 	// 			'Cache-Control': 'max-age=50'
// 	// 			// Expires: 'Fri, 01 Jan 2025 00:00:00 GMT' // 缓存过期时间为0
// 	// 			// Pragma: 'no-cache'
// 	// 		}
// 	// 		// withCredentials: true
// 	// 	})
// 	// 	.then(res => {
// 	// 		console.log('打印***res', res)
// 	// 		rest.value = res.data
// 	// 	})

// 	// fetch('http://localhost:3000/getList', {
// 	// 	headers: {
// 	// 		'Cache-Control': 'max-age=6000' // 不使用缓存
// 	// 		// Expires: '0' // 缓存过期时间为0
// 	// 	}
// 	// })
// 	// 	.then(res => res.json())
// 	// 	.then(data => {
// 	// 		console.log(data)
// 	// 	})
// }
</script>

<style scoped></style>
