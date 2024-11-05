import { useResizeObserver, removeResizeObserver } from './resize'


export const vSize = {
    mounted(el, binding) {
        useResizeObserver(el, (entries) => {
            console.log('打印***entries', entries)
            const { width, height } = entries[0].contentRect
            // binding.value({ width, height })
            binding.value.width = width
            binding.value.height = height
        })
    },

    beforeUnmount(el) {
        removeResizeObserver(el)
    }
}

export default (app) => {
    app.directive('size', vSize)
}