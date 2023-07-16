// 立即执行函数IIFE invoke执行

/** 
 * score不想导出，立即执行函数可选择性导出，即使score导出，外部也无法修改 
 * 问题：依赖引入问题，必须要先顺序导入---》commonjs
 * */

var MyApp = (function ($) {
	var score = 100;
	$("body").css("background-color",'red');
  return {
    add: function (x, y) {
      return x + y + score;
    },
  };
})($);

var sum = MyApp.add(1, 2);
console.log(sum);
