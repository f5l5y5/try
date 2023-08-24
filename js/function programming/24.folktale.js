const { compose, curry } = require("folktale/core/lambda");
const {first,toUpper} = require('lodash/fp')

// 柯里化几个参数
const f = curry(2, (x, y) => x + y);
console.log(f(1, 2), f(1)(2));


const c = compose(toUpper,first)

console.log(c(['one','two']));
