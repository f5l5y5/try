const _ = require("lodash");

const reverse = (arr) => arr.reverse();
const first = (arr) => arr[0];
const toUpper = (s) => s.toUpperCase();

const f = _.flowRight(toUpper, first, reverse);

const arr = ["one", "two", "three"];
// console.log(f(arr));


function compose(...args) {
	return function (value) {
		return args.reverse().reduce(function (acc, fn) {
			return fn(acc)
		},value)
	}
}

const fs = compose(toUpper, first, reverse);
console.log(fs(arr));