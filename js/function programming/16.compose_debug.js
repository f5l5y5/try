//  案例：将字符转换 NEVER SAY DIE -> never-say-die
// 先空格split切割成数组，调用toLower变成小写，然后进行join分隔

const _ = require('lodash')
// 因为使用组合函数,数据是最后进行传入，所以需要柯里化进行数据位置变化
const split = _.curry((sep,str)=>_.split(str,sep))
const join = _.curry((sep,arr)=>_.join(arr,sep))
const compose = _.flowRight( join('-'),_.toLower,split(' '))
console.log(compose("NEVER SAY DIE"));//n-e-v-e-r-,-s-a-y-,-d-i-e
const log = (v) => {
  console.log(v);
  return v;
};
const composeLog = _.flowRight(join("-"),log,_.toLower,log,split(" "));
console.log(composeLog("NEVER SAY DIE"));//n-e-v-e-r-,-s-a-y-,-d-i-e

const map = _.curry((fn, array) => _.map(array, fn))

// const f = _.flowRight(
//   join("-"),
//   log,
//   map(_.toLower),
//   log,
//   split(" ")
// );
// console.log(f("NEVER SAY DIE"));//n-e-v-e-r-,-s-a-y-,-d-i-e

// 打印结果不清晰

const trace = _.curry((tag, v) => {
	console.log(tag, v);
	return v
})

const f = _.flowRight(
  join("-"),
  trace('map 之后'),
  map(_.toLower),
  trace('split 之后'),
  split(" ")
);
console.log(f("NEVER SAY DIE"));//n-e-v-e-r-,-s-a-y-,-d-i-e