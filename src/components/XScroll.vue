<template>
    <div v-size="size" class="scroll-container">
        <div class="v-scroll">
            <!-- content是横向元素
            1. 将content进行旋转90
            2. 绝对定位向右平移content高度 
            
            -->
            <!-- 2 获取父元素动态宽高
            2.1 设置v-scroll的宽高为content的撑满的宽高
            2.2 设置滚动条 
            2.3 将内容的放正展示，向下平移content高度
            -->
            <div class=" content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const size = ref({
    width: 0,
    height: 0
})



</script>

<style scoped lang="scss">
.scroll-container {
    width: 100%;
    height: 100%;
}

.v-scroll {
    --w: calc(v-bind(size.width) * 1px);
    --h: calc(v-bind(size.height) * 1px);
    width: var(--w);
    height: var(--h);
    position: relative;
    overflow: auto;
    transform-origin: left top ;
    transform: translateY(var(--h)) rotate(-90deg);
}

.v-scroll::-webkit-scrollbar {
    display: none;
}

.content {
    position: absolute;
    width: var(--w);
    height: var(--h);
    top: 0;
    left: var(--h);
    transform-origin: left top;
    transform: rotate(90deg);
}


</style>