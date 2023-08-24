// // 有副作用的
// let mini = 10
// function checkAge(age) {
// 	return age>=min
// }


// // 纯函数（存在硬编码，可用柯里化解决）
// function checkAge1(age) {
// 	let mini = 18
// 	return age>=mini
// }


// 硬编码问题
function checkAge(age) {
	let mini = 18
	return age>=mini
}
// mini 提取到参数的位置 变成纯函数
function checkAge(min, age) {
	return age>=min
}
// 如果需要判断是否大于18岁，每次需要进行添加18
console.log(checkAge(18,20));
console.log(checkAge(18,21));
// console.log(checkAge(20,18));

// 固定基准值 函数柯里化
function checkAge(min) {
	return function(age){
		return age>=min
	}
}

let checkAge = (min => age => age >= min)


let checkAge18 = checkAge(18)
let checkAge20 = checkAge(20)


console.log(checkAge18(21));
console.log(checkAge20(18));
// 如果