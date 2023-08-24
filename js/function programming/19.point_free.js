const fp = require('lodash/fp')
// Hello World => hello_world
// const str = "Hello World";
// 非 Point Free 模式
// function f(word) {
// 	return word.toLowerCase().replace(/\s+/g,'_')
// }
// console.log(f(str));


// Point Free
// const fp = require('lodash/fp')
// const f1 = fp.flowRight(fp.replace(/\s+/g,'_'),fp.toLower)
// console.log(f1(str));

// 案例： 把一个字符串中的首字母提取，转换成大写，使用.作为分隔符
// hello world web => W. W. W.
const str = "hello world web";

const f2 = fp.flowRight(
  fp.join("_ "),
  fp.map(fp.toUpper),
	fp.map(fp.first),
  fp.split(" ")
);
console.time('f1')
console.log(f2(str));
console.timeEnd('f1')

// 两个map可以进行合并，只用flowRight进行封装成新的函数
console.time('f2')
const f3 = fp.flowRight(fp.join("_ "),fp.map(fp.flowRight(fp.toUpper,fp.first)),fp.split(" "))
console.timeEnd('f2')
console.log(f3(str));
