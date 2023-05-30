<template>
	<div>
		<el-table border :data="tableData" style="width: 100%; margin-top: 30px">
			<el-table-column prop="id" label="id" />
			<el-table-column prop="name" label="名字" />
			<el-table-column prop="time" label="时间" />
			<el-table-column prop="date" label="日期" />
		</el-table>
	</div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const tableData =ref<any[]>([])
const getList = async () => {
	const res = await fetch('http://localhost:5173/main/getList').then(res => res.json())
	console.log('打印***res', res)
	tableData.value = res.data
}

getList()
</script>

<style scoped lang="scss">
</style>