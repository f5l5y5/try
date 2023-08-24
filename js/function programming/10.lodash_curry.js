const _ = require("lodash");

// 需要柯里化的函数
function sum(a, b, c) {
  return a + b + c;
}

// 柯里化后的函数

const curried = _.curry(sum);

console.log(curried(1)(2)(3));
console.log(curried(1, 2)(3));
console.log(curried(1)(2, 3));
console.log(curried(1, 2, 3));

function curry(fn) {
  return function curriedFn(...args) {
    // 判断实参和形参的个数
		if (args.length < fn.length) 
			// 参数不一致需要返回一个新的函数
			return function () {
				// 新的函数下次调用传入的参数，需要递归调用返回
        return curriedFn(
          ...args.concat(Array.from(arguments))
        );
      };
    }
    return fn(...args);
  };
}

const curriedSelf = curry(sum);

console.log(curriedSelf(1)(2)(3));
console.log(curriedSelf(1, 2)(3));
console.log(curriedSelf(1)(2, 3));
console.log(curriedSelf(1, 2, 3));
