const _ = require("lodash");

// const reverse = (arr) => arr.reverse();
// const first = (arr) => arr[0];
// const toUpper = (s) => s.toUpperCase();

// const f = _.flowRight(toUpper, first, reverse);
// 不需要自己写
const f = _.flowRight(_.toUpper, _.first, _.reverse);

const f1 = _.flowRight(_.flowRight(_.toUpper,_.first),_.reverse)
const f2 = _.flowRight(_.toUpper,_.flowRight(_.first,_.reverse))

const arr = ["one", "two", "three"];
console.log(f(arr));
console.log(f1(arr));
console.log(f2(arr));
