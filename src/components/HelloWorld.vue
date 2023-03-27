<template>
	<div>
		<a-table :data-source="dataSource" :columns="columns"></a-table>
		<a-button type="primary" @click="exportExcel">导出 Excel</a-button>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'

function export_json_to_excel({ header, data, filename }) {
	const sheet_name = 'Sheet1'
	const wb = XLSX.utils.book_new()
	const ws = XLSX.utils.aoa_to_sheet([header, ...data])
	XLSX.utils.book_append_sheet(wb, ws, sheet_name)
	XLSX.writeFile(wb, `${filename}.xlsx`)
}

const dataSource = ref([
	{ name: '张三', age: 20, gender: '男', first: '1', last: 'last' },
	{ name: '李四', age: 30, gender: '女', first: '1', last: 'last' },
	{ name: '王五', age: 25, gender: '男', first: '1', last: 'last' },
	{ name: '李四', age: 30, gender: '女', first: '1', last: 'last' },
	{ name: '王五', age: 25, gender: '男', first: '1', last: 'last' },
	{ name: '李四', age: 30, gender: '女', first: '1', last: 'last' },
	{ name: '王五', age: 25, gender: '男', first: '1', last: 'last' }
])

const columns = ref([
	{
		title: '姓名',
		dataindex: 'name'
	},
	{
		title: '年龄',
		colSpan: 2,
		dataIndex: 'age'
		// customcell: (_, index) => {
		// 	if (index === 1) {
		// 		return { colSpan: 2 }
		// 	}
		// }
	},
	{
		title: '性别',
		colSpan: 0,
		dataIndex: 'gender'
	},
	{ title: '性别', dataIndex: 'first' },
	{ title: '性别', dataIndex: 'last' }
])

const exportExcel = () => {
	const tHeader = columns.value.map(col => col.title)
	const filterVal = columns.value.map(col => col.dataIndex)
	const list = dataSource.value.map(item => filterVal.map(key => item[key]))

	const data = [tHeader, ...list]
	const filename = '表格数据'

	export_json_to_excel({ header: tHeader, data, filename })
}
</script>

<style>
.ant-table-cell {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
