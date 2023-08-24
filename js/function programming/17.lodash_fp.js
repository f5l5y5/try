const _ = require("lodash/fp");

// 数据优先
const arr = ["a", "b", "c"];
console.log(_.map(["a", "b", "c"], _.toUpper));

const str = "hello world";
console.log(_.split(str, " "));

// 数据最后
const fp = require("lodash/fp");
console.log(fp.map(_.toUpper, arr));
console.log(fp.map(arr, _.toUpper));
console.log(fp.split(" ")(str));
console.log(fp.split(" ", str));



const _ = require("lodash/fp");
// 因为使用组合函数,数据是最后进行传入，所以需要柯里化进行数据位置变化   进行改造
const split = _.curry((sep, str) => _.split(str, sep));
const join = _.curry((sep, arr) => _.join(arr, sep));
const map = _.curry((fn, array) => _.map(array, fn));
const f = _.flowRight(
  join("-"),
  trace("map 之后"),
  map(_.toLower),
  trace("split 之后"),
  split(" ")
);


const trace = _.curry((tag, v) => {
  console.log(tag, v);
  return v;
});

const ffp = _.flowRight(
  fp.join("-"),
  trace("map 之后"),
  fp.map(fp.toLower),
  trace("split 之后"),
  fp.split(" ")
);
console.log(ffp("NEVER SAY DIE"));
