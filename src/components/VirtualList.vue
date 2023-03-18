<template>
	<!-- 可视区域的容器 -->
	<div ref="list" class="infinite-list-container" @scroll="scrollEvent($event)">
		<!-- 容器内的占位 -->
		<div class="infinite-list-phantom" :style="{ height: listHeight + 'px' }"></div>
		<!-- 列表项的渲染区域 -->
		<div class="infinite-list" :style="{ transform: getTransform }">
			<div
				ref="items"
				class="infinite-list-item"
				v-for="item in visibleData"
				:key="item"
				:style="{ height: itemSize + 'px', lineHeight: itemSize + 'px' }"
			>
				{{ item }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'

const screenHeight = ref(500)
const startOffset = ref(0)
const start = ref(0)
const end = ref(0)
// dom节点
const list = ref()
const items = ref()

// 列表总数据
const listData = ref([])
for (let i = 0; i < 100000; i++) {
	listData.value.push(i)
}
// 每项高度
const itemSize = 50
// 列表总高度 , 应该减去显示的高度
const listHeight = computed(() => listData.value.length * itemSize)
// 可显示的列表数
const visibleCount = computed(() => Math.ceil(screenHeight.value / itemSize))
// 偏移量对应的style
const getTransform = computed(() => `translateY(${startOffset.value}px)`)
// 获取真实显示列表数据
const visibleData = computed(() => listData.value.slice(start.value, Math.min(end.value, listData.value.length)))

onMounted(() => {
	end.value = start.value + visibleCount.value
	console.log('打印***visibleCount.value', visibleCount.value)
})

const scrollEvent = e => {
	// 当前滚动位置
	let scrollTop = list.value.scrollTop
	console.log('打印***e', scrollTop, visibleData.value)
	// 开始索引
	start.value = Math.floor(scrollTop / itemSize)
	// 结束索引
	end.value = start.value + visibleCount.value
	// 偏移量
	startOffset.value = scrollTop - (scrollTop % itemSize)
	console.log('打印***startOffset.value', startOffset.value)
}
</script>

<style scoped>
.infinite-list-container {
	width: 500px;
	height: 500px;
	overflow: auto;
	position: relative;
	border: 1px solid;
	margin-top: 20px;
	-webkit-overflow-scrolling: touch;
}

.infinite-list-phantom {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	z-index: -1;
}

.infinite-list {
	left: 0;
	right: 0;
	top: 0;
	position: absolute;
	text-align: center;
}

.infinite-list-item {
	border: 1px solid pink;
	color: #555;
	box-sizing: border-box;
	border-bottom: 1px solid #999;
}
</style>
