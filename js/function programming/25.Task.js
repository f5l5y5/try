// Task处理异步任务

// 读取package.json中的version
const { task } = require("folktale/concurrency/task");
const fs = require("fs");
const { split, find } = require("lodash/fp");

// 读取文件
function readFile(filename) {
  return task((resolver) => {
    fs.readFile(filename, "utf-8", (err, data) => {
      if (err) resolver.reject(err);
      resolver.resolve(data);
    });
  });
}

// 通过run进行调用，listen监听，onResolved接受返回的数据，此处只接受数据，task函子提供map方法进行处理数据
let r = readFile("package.json")
	.map(split('\n'))
	.map(find(v=>v.includes('version')))
  .run()
  .listen({
    onRejected: (err) => {
      console.log("打印***err", err);
    },
		onResolved: (value) => {
			// 如果这里处理数据，就失去了函数式编程的意义
      console.log("打印***value", value);
    },
  });

console.log("打印***r", r);
