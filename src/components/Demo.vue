<template>
	<a-table
		class="infinite-list-container"
		border
		:pagination="false"
		:scroll="{ y: 550 }"
		:data-source="sliceTable"
		:columns="columns"
	>
	</a-table>
</template>

<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'

// 表格所有数据
const tableData = ref([])
for (let i = 0; i < 100000; i++) {
	tableData.value.push({
		key: i,
		id: i,
		name: i,
		age: 20 + i,
		address: 'taoism',
		address1: 'taoism',
		address2: 'taoism',
		address3: 'taoism',
		address4: 'taoism',
		address5: 'taoism',
		address6: 'taoism',
		address7: 'taoism',
		address8: 'taoism',
		address9: 'taoism',
		address10: 'taoism'
	})
}
// 区域高度 每行内容定高
const screenHeight = 550
const itemSize = 55

// 开始索引
const startIndex = ref(0)
// 结束索引
const endIndex = ref(0)
// 每页展示多少 screenHeight / itemSize 假设为10
let visibleCount = 10

// 空元素，用于撑开table的高度
let vEle

let tableRef = null

const sliceTable = computed(() => tableData.value.slice(startIndex.value, endIndex.value))

const columns = [
	{
		title: '姓名',
		dataIndex: 'name',
		width: 30
	},
	{
		title: '年龄',
		dataIndex: 'age',
		width: 30
	},
	{
		title: '住址',
		dataIndex: 'address',
		width: 30
	},
	{
		title: '住址',
		dataIndex: 'address1',
		width: 30
	},
	{
		title: '住址',
		dataIndex: 'address2',
		width: 30
	},
	{
		title: '住址',
		dataIndex: 'address3',
		width: 30
	},
	{
		title: '住址',
		dataIndex: 'address4',
		width: 30
	},
	{
		title: '住址',
		dataIndex: 'address5',
		width: 30
	},
	{
		title: '住址',
		dataIndex: 'address6',
		width: 30
	},
	{
		title: '住址',
		dataIndex: 'address7',
		width: 30
	},
	{
		title: '住址',
		dataIndex: 'address8',
		width: 30
	},
	{
		title: '住址',
		dataIndex: 'address9',
		width: 30
	},
	{
		title: '住址',
		dataIndex: 'address10',
		width: 30
	}
]

/**
 * @description: table 滚动事件
 * @param {*}
 * @return {*}
 */
function tableScroll() {
	// 滚动的高度
	let scrollTop = tableRef.scrollTop
	// 下一次开始的索引
	startIndex.value = Math.floor(scrollTop / itemSize)

	endIndex.value = startIndex.value + visibleCount
	// 滚动操作
	let startOffset = scrollTop - (scrollTop % itemSize)
	console.log('打印***startOffset', startOffset)
	tbody.style.transform = `translateY(${startOffset}px)`
	// 滚动到底，加载新数据
	// if (tableRef.scrollHeight <= scrollTop + tableRef.clientHeight) {
	// 	if (tableData.length == 100) {
	// 		return
	// 	}
	// 	loadData()
	// }
}

let tbody
onMounted(() => {
	visibleCount = screenHeight / itemSize
	endIndex.value = startIndex.value + visibleCount
	tableRef = document.querySelector('.ant-table-body')
	console.log('打印***sliceTable.value', sliceTable.value)
	// 创建一个空元素，这个空元素用来撑开 table 的高度，模拟所有数据的高度
	vEle = document.createElement('div')
	vEle.className = 'infinite-list-phantom'
	vEle.style.height = tableData.value.length * itemSize + 'px'
	// 把这个节点加到表格中去，用它来撑开表格的高度
	tableRef.appendChild(vEle)
	const table = document.querySelector('table')
	console.log('打印***table', table)
	table.className = '111'
	tbody = document.querySelector('.ant-table-tbody')
	tableRef.addEventListener('scroll', tableScroll, {
		passive: true
	})
})
</script>

<style scoped>
.infinite-list-container {
	position: relative;
}

.infinite-list-phantom {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	z-index: -1;
}
</style>
