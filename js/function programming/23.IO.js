const fp = require('lodash/fp')

class IO {
  // 传入value值使用纯函数进行包裹 返回IO函子
  static of(value) {
    return new IO(function () {
      return value;
    });
  }

  constructor(fn) {
    this._value = fn;
  }

  // map作用是将每次map传入的fn，与之前的函子中保存的_value进行组合，形成一个新的IO函子 类似fp.flowRight(fp.flowRight(fn,this._value),this._value)
  map(fn) {
    return new IO(fp.flowRight(fn, this._value));
  }
}


// 始终是纯函数操作
let r = IO.of(process).map(p=>p.execPath)
// 不纯的操作延迟到调用时执行
console.log(r._value());

