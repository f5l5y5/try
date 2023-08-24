// ''.match(/\s+/g) // 提取所有空白字符
// ''.match(/\d+/g) // 提取所有数字
const _ = require("lodash");

// 希望写一个函数，根据规则匹配
function match(reg,str) {
	return str.match(reg)
}

// 柯里化处理
const match = _.curry(function (reg, str) {
  return str.match(reg);
});

const haveSpace = match(/\s+/g);
console.log(haveSpace("hello world!"));

const haveNumber = match(/\d+/g);
console.log(haveNumber("asdf 23423"));

// 实现一个过滤函数
const filter = _.curry(function (fn, array) {
  return array.filter(fn);
});

const arr = ["kate", " jack", "haha haha"];
console.log(filter(haveSpace, arr));
// 使用柯里化的方式
const findSpace = filter(haveSpace);
console.log(findSpace(arr));
