<template>
    <div>
        <!-- 默认插槽 -->
        <slot name="default" title="默认插槽"></slot>
        <!-- 具名插槽 -->
        <slot name="header"></slot>
        <!-- 作用域插槽 -->
        <slot name="content" v-bind="{ a: 1, b: 2 }" />
        <!-- 动态插槽 -->
        <slot :name="dynamicName" v-bind="{ a: 1, b: 2 }"></slot>
    </div>
</template>
<script>
import { createElementVNode } from 'vue';
export default {
    props: {
        dynamicName: String
    },
    setup(props, { slots }) {
        console.log('打印***props', props)
        console.log('打印***other', slots)
        const _default = slots.default({ title: '默认插槽' })
        console.log('打印***_default', _default)
        // const _default = slots.default({title: '默认插槽'})
        // const _header = slots.header()
        // const _content = slots.content({a: 1, b: 2})
        // const _dynamic = slots[props.dynamicName]({ a: 1, b: 2 })
        // return () => {
        //     return createElementVNode('div', {}, [_default])
        // }
    }
}
</script>
