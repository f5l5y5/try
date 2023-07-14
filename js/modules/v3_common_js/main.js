var add = require('./add.js')

var sum = add(1, 2)

console.log(sum);

// 服务端使用，因为都是本地文件，浏览器需要网络加载就非常差


// 同时引入以module.exports为准


// var { data } = require("./add.js");
// console.log(data);
