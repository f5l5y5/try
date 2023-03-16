<template>
	<ul id="container"></ul>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
	let now = Date.now()
	const total = 100000
	let ul = document.getElementById('container')
	for (let i = 0; i < total; i++) {
		let li = document.createElement('li')
		li.innerText = i
		ul.appendChild(li)
	}
	console.log('js运行时间', Date.now() - now)

	setTimeout(() => {
		console.log('总运行时间', Date.now() - now)
	})
})
</script>

<style scoped>
.read-the-docs {
	color: #888;
}
</style>
