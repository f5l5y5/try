<template>
	<div>
		<el-table border :data="tableData" style="width: 100%; margin-top: 30px">
			<el-table-column prop="id" label="id" />
			<el-table-column prop="name" label="名字" />
			<el-table-column prop="time" label="时间" />
			<el-table-column prop="date" label="日期" />
		</el-table>

		<el-button @click="getList">点击获取数据</el-button>
	</div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useWebWorkerFn,useWebWorker } from '@vueuse/core'


const {data,post,terminate,worker} = useWebWorker('worker.js')


watch(() => data.value, (newData) => {
	console.log(newData, 'newData');
	terminate()
	
})

/** 大型数组（500 万个数字）的排序 */
function heavyTask() {
  const randomNumber = () => Math.trunc(Math.random() * 5_000_00)
	const numbers: number[] = Array(5_000_000).fill(undefined).map(randomNumber)
	console.log('打印***numbers',numbers)
  numbers.sort()
  return numbers.slice(0, 5)
}

/** 
 * workerTerminate(status) 'PENDING' | 'SUCCESS' | 'RUNNING' | 'ERROR' | 'TIMEOUT_EXPIRED'
 * workerStatus 状态
 * 
 */
const {  workerFn, workerStatus, workerTerminate } = useWebWorkerFn(heavyTask)

const tableData =ref<any[]>([])
const getList = async () => {
	// console.time('接口 api')
	// console.time('dom')
	const res = await fetch('http://localhost:5173/main/getList').then(res => res.json())
	console.timeEnd('接口 api')
	
	console.log('打印***res', res)
	// post(res.data)
	// handleWorker(res.data)
	console.time('接口 数据处理')
	const a = res.data.map(item => {
		if (item.id !== 7) {
			return item
		}
		item.sex = 'man'
		item.pid = item.id
		item.key = item.id
		return item
	})
	console.timeEnd('接口 数据处理')
	return a

}


const handleWorker = (data) => {
	if (window.Worker) {
		console.log('存在worker');
		let worker = new Worker('worker.js')
		worker.postMessage(data)
		worker.onmessage = function (e) {
			console.log('打印***接受worker的信息', e.data)
			// tableData.value = e.data
		}
		worker.onmessageerror = function (err) {
			console.log('error',err);
			
		}

		
	} else {
		console.log('没有worker');
		
	}
}

onMounted(async ()=>{
	console.timeEnd('dom')
	getList()
	const tableData = await workerFn()
console.log('打印***tableData',tableData)
})
</script>

<style scoped lang="scss">
</style>