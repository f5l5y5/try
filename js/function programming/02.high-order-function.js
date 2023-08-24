function makeFn() {
	let msg = 'Hello function'
	return function () {
		console.log(msg);
	}
}
makeFn()()


const fn = makeFn()
fn()




// once函数 只会执行一次 带参数
function once(fn) {
	let done = false
	return function () {
		if (!done) {
			done = true
			fn.apply(this,arguments)
		}
	}
}


const pay = once(function (money) {
	console.log(`支付：${money} RMB`);
})


pay(10)
pay(10)
pay(10)

// 高阶函数的意义
// 面向过程的方式
const array = [1, 2, 3, 4]
for (let i = 0; i < array.length; i++) {
	console.log(array[i]);	
}

// 面向对象的方式
class ArrayProcessor {
  constructor(array) {
    this.array = array;
  }

  forEach() {
    this.array.forEach((item) => console.log(item));
  }
}

const processor = new ArrayProcessor(array);
processor.forEach();



// 面向函数的方式
function forEach(array, fn) {
  for (let i = 0; i < array.length; i++) {
    fn(array[i], i, array);
  }
}

forEach(array, item => {
	console.log(item);
})


