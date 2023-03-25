<template>
	<!-- <VirtualList /> -->
	<!-- <Demo /> -->
	<!-- <Dom /> -->
	<div>{{ rest }}</div>
	<button @click="click">点击</button>
</template>

<script setup>
import Dom from './components/Dom.vue'
import VirtualList from './components/VirtualList.vue'
import Demo from './components/Demo.vue'
import axios from 'axios'
import { ref } from 'vue'

const rest = ref('')

const click = () => {
	axios
		.get('http://localhost:3000/getList', {
			// headers: { 'X-Requested-With': 'XMLHttpRequest' },
			// withCredentials: true
		})
		.then(res => {
			console.log('打印***res', res)
			rest.value = res.data
		})
}
</script>

<style scoped></style>
