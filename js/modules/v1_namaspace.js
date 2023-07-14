// 命名空间
/** 放入对象中，避免命名冲突，即使冲突，是最外层冲突，降低冲突概念
 * 违反迪米特法则，对象互相之间不应该直接修改，如果改动的地方多，后期代码无法维护
 * 问题：无法选择导出，避免修改
 */

var MyApp = {
  score: 100,
  add: function (x, y) {
    return x + y + this.score;
  },
};

var sum = MyApp.add(1, 2);
