<template>
  <el-input class="ipt"></el-input>
  <Mod v-model:visible="visible">
    <div class="hello">你好</div>
  </Mod>
	<el-button type="primary" @click="visible = true">点击</el-button>
	<!-- <div id="modals"></div> -->
</template>


<script setup lang="ts">
import {ref} from 'vue'
import Mod from "./Mod.vue";


const visible = ref(false)
</script>


<style scoped lang="scss">
.ipt {
  // input{
  // 	background-color: red;
  // }
  :deep(input) {
    background-color: red;
  }
}
.hello{
	color: red;
}
</style>