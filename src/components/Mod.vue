<template>
	<div id="modals">
		<a-modal
			:visible="props.visible"
			:width="650"
			:getContainer="getContainer('modals')"
			wrapClassName="modal__container"
			@cancel="handleCloseModal"
		>

			<template #title>
				<span class="text-20px heading-color">拆单</span>
			</template>
	
			<div class="temp">
				6666
			</div>
		</a-modal>
	<!-- <a-modal :visible="true"></a-modal> -->
	</div>
</template>

<script setup lang="ts">

type TProps = {
  visible: boolean
}
const props = withDefaults(defineProps<TProps>(), {
  visible: false,
})


const emits = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()


const getContainer = (idSelector: string) =>
  document.getElementById(idSelector)!

const handleCloseModal = () => {
  emits('update:visible', false)
}
</script>

<style scoped lang="scss">
#modals{
	:deep(.ant-modal-content){
		padding: 50px;
	}
}
.temp{
	font-size: 30px;
}
.heading-color{
	color: red;
}
</style>