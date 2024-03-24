const obj = {
  valueOf() {
    console.log("调用valueOf");
    return {};
  },
  toString() {
    console.log("调用toString");
    return 2;
  },
};
console.log(obj + "");

const date = new Date();
Date.prototype.toString = function () {
  console.log("Date调用toString");
  return "string";
};

Date.prototype.valueOf = function () {
  console.log("Date调用valueOf");
  return 1;
};

console.log(1 + date);
