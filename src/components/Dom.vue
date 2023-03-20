<template>
	<a-table
		border
		:pagination="false"
		:scroll="{ x: 'max-content', y: 550 }"
		:data-source="tableData"
		:columns="columns"
	>
		<!-- <template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'address'">
				<span>{{ text === 'taoism0' ? 'address' : '' }}</span>
			</template>
			<template v-if="column.dataIndex === 'address1'">
				<span>{{ text === 'taoism1' ? 'address1' : '' }}</span>
			</template>
			<template v-if="column.dataIndex === 'address2'">
				<span>{{ text === 'taoism2' ? 'address2' : '' }}</span>
			</template>
			<template v-if="column.dataIndex === 'address3'">
				<span>{{ text === 'taoism3' ? 'address3' : '' }}</span>
			</template>
			<template v-if="column.dataIndex === 'address4'">
				<span>{{ text === 'taoism4' ? 'address4' : '' }}</span>
			</template>
			<template v-if="column.dataIndex === 'address5'">
				<span>{{ text === 'taoism5' ? 'address5' : '' }}</span>
			</template>
		</template> -->
	</a-table>
</template>
<script setup>
import { onMounted, ref } from 'vue'
// 表格所有数据
const tableData = ref([])
for (let i = 0; i < 2000; i++) {
	tableData.value.push({
		key: i,
		id: i,
		name: i,
		age: 20 + i,
		address: 'taoism0',
		address1: 'taoism1',
		address2: 'taoism2',
		address3: 'taoism3',
		address4: 'taoism4',
		address5: 'taoism5',
		address6: 'taoism6',
		address7: 'taoism7',
		address8: 'taoism8',
		address9: 'taoism9',
		address10: 'taoism10'
	})
}
console.time('time')

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
onMounted(() => {
	tableData.value.map(item => {
		item.address = item.address === 'taoism0' ? 'address' : ''
		item.address1 = item.address1 === 'taoism1' ? 'address1' : ''
		item.address2 = item.address2 === 'taoism2' ? 'address2' : ''
		item.address3 = item.address3 === 'taoism3' ? 'address3' : ''
		item.address4 = item.address4 === 'taoism4' ? 'address4' : ''
		item.address5 = item.address5 === 'taoism5' ? 'address5' : ''
		return item
	})
	setTimeout(() => {
		console.timeEnd('time')
	}, 0)
})
</script>
