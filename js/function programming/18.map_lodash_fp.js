// 转换成整形

const _ = require("lodash");
const fp = require("lodash/fp");

console.log(_.map(["23", "8", "10"], parseInt)); // [ 23, NaN, 2 ]
console.log(fp.map(parseInt, ["23", "8", "10"])); // [ 23, 8, 10 ]
/**

	_.map(value, index|key, collection)三个参数

	parseInt('23',0,array) // 默认十进制
	parseInt('8',1,array) // 没有那个
	parseInt('10',2,array) // 有二进制
	parseInt(str,2-36进制)

	fp.map中parseInt只接受一个参数

 */
