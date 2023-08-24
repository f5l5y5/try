/* =================================== 函数式编程 ========================================== */
// 非函数式
let num1 = 1;
let num2 = 2;
let sum = num1 + num2;
console.log(sum);

// 函数式
function sum1(n1, n2) {
  return n1 + n2;
}

console.log(sum1(1, 2));

/* =================================== 一等公民 ========================================== */
// 把函数赋值给变量
let fn = function () {
	console.log('Hello First-class Function');
}

fn()

// 案例
const BlogController = {
	index(posts){ return Views.index(posts)},
	show(post){ return Views.show(post)},
	create(attrs){ return Db.create(attrs)},
	update(post,attrs){ return Db.update(post,attrs)},
	destroy(post){ return Db.destroy(post)},
}
// 优化
const BlogController = {
	index:Views.index,
	show:Views.show,
	create:Db.create,
	update:Db.update,
	destroy:Db.destroy,
}
