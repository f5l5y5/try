

const map = (array, fn) => {
	let result = []
	for (const value of array) {
		result.push(fn(value))
	}
	return result
}


let arr = [1, 2, 3, 4]
arr = map(arr, (v) => v * v)
console.log('打印***arr',arr)


const every = (array, fn) => {
	let result = true
	for (let i = 0; i < array.length; i++) {
		result = fn(array[i])
		if (!result) {
			break;
		}		
	}
	return result
}

const flag = every(arr, v => v > 0)

console.log('打印***flag', flag)


const some = (array, fn) => {
	let result = false
	for (let value of array) {
		result = fn(value)
		if (result) {
			break
		}
	}
	return result
}

const hasEven = some(arr, v => v % 2 === 0)
console.log('打印***hasEven',hasEven)