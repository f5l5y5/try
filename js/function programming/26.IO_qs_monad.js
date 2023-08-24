const fp = require("lodash/fp");
const fs = require("fs");

class IO {
  static of(value) {
    return new IO(function () {
      return value;
    });
  }

  constructor(fn) {
    this._value = fn;
  }

  map(fn) {
    return new IO(fp.flowRight(fn, this._value));
  }
  // 解决嵌套调用
  join() {
    return this._value();
  }
  // 就是将map和join进行结合，将上一次返回的IO函数自己调用
  flatMap(fn) {
    return this.map(fn).join();
  }
}

// 读取文件的函数 然后打印 cat
const readFile = function (filename) {
  return new IO(function () {
    return fs.readFileSync(filename, "utf-8");
  });
};

const print = function (s) {
  return new IO(function () {
    console.log('s',s);
    return s;
  });
};

const cat = fp.flowRight(print, readFile)
// 嵌套的IO    printIO(readFileIO(s)) 外层是print返回的函子 内层是readFile的函子
let r = cat('package.json')
// console.log(r._value()._value());
// 函子有嵌套 调用非常不方便

// 当返回的是函子使用flatMap 否则使用map
/**
	执行过程：
	readFile返回IO函子
	使用flatMap：此时this._value是readFile生成的函子，fn是将print生成的IO函子 返回两个组合后的
	new IO(fp.flowRight(fn, this._value))._value
 */
const res = readFile("package.json")
  // .map((x) => x.toUpperCase())
  // .map(fp.toUpper)
  .flatMap(print)
  .join();
// 结果处理
console.log(res);
