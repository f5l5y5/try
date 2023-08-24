// Functor 函子
// class Container {
//   constructor(value) {
//     this._value = value;
//   }

//   /** 创立新的函子 处理的结果给新的函子 */
//   map(fn) {
//     return new Container(fn(this._value));
//   }
// }

// const c = new Container(5)
//   .map((v) => v * 2)
//   .map((v) => v + 1)
//   .map((v) => v - 10);
// console.log(c);

// // 函数式编程 避免new
class Container {
	static of(value) {
		return new Container(value);
	}

  constructor(value) {
    this._value = value;
  }

  map(fn) {
    return new Container(fn(this._value));
  }
}

// const f = Container.of(3)
//   .map((v) => v * v)
//   .map((v) => v - 10)
//   .map((v) => v + 1);

// console.log(f);

// 演示null undefined的问题
const c1 = Container.of(null).map((v => v.toUpperCase()));

console.log(c1);
