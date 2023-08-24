const _ = require("lodash");

function getArea(r) {
  console.log(r);
  return Math.PI * r * r;
}

const getAreaWithMemory = _.memoize(getArea);
console.log(getAreaWithMemory(4)); //4 50.26548245743669
console.log(getAreaWithMemory(4)); // 50.26548245743669
console.log(getAreaWithMemory(4)); // 50.26548245743669

// 模拟memoize方法实现
function memoize(fn) {
	let cache = {}
	return function () {
		let key = JSON.stringify(arguments) // key使用输入
		cache[key] = cache[key] || fn.apply(this, arguments)
		return cache[key]
	}
}


const getAreaWithMemory = memoize(getArea);
console.log(getAreaWithMemory(4)); //4 50.26548245743669
console.log(getAreaWithMemory(4)); // 50.26548245743669
console.log(getAreaWithMemory(4)); // 50.26548245743669
