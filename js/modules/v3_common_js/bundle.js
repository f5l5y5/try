(function () {
  var modules = {
    "./add.js": function (module, require) {
      function add(x, y) {
        return x + y;
      }
      module.exports = add;
    },
    "./main.js": function (module, require) {
      var add = require("./add.js");
      var sum = add(1, 2);

      console.log(sum);
    },
  };

	var cache = {};
	
  function require(moduleId) {
    if (cache[moduleId]) {
      return cache[moduleId];
    }

    var module = { exports: {} };
    modules[moduleId](module, require);
    cache[moduleId] = module.exports;
    return module.exports;
  }

  require("./main.js");
})();
