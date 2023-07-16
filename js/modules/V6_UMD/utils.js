require(['./utils', 'a', 'b'], function (utils) {
	console.log(1);
	// 没有用到a b uitls 但是amd全部初始化所有的模块
})


define(function (require, exports, module) {
	console.log(1);
	if (false) {
		// 需要时再 require  执行就不会加载
		var utils = require('./utils')
		utils.add(1, 2)

	}
})


	; (function (root, factory) {
		if (typeof define === 'function' && define.amd) {
			// amd
			define([utils], factory)
		} else if (typeof exports === 'object' && module.exports) {
			// CommonJs 
			var utils = require('utils')
			module.exports = factory()
		} else {
			root.utils = factory()
		}
	}
	)(this, function () {
		var add = function (a, b) {
			return a + b;
		};
		return add
	})