
/* =================================== 函数作为参数 ========================================== */
function forEach(array, fn) {
	for (let i = 0; i < array.length; i++) {
		fn(array[i],i,array)		
	}
}


const arr = [1, 2, 3]
forEach(arr, (item) => {
	console.log('打印***item',item)
})



function filter(array, fn) {
	let result = []
	for (let i = 0; i < array.length; i++) {
		if (fn(array[i])) {
			result.push(array[i])
		}		
	}
	return result
}


console.log(filter(arr, (item) => item % 2 === 0));