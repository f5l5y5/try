let arr = [1, 2, 3, 4, 5];

// 纯函数
console.log(arr.slice(0, 3));
console.log(arr.slice(0, 3));
console.log(arr.slice(0, 3));

// 不纯的函数
console.log(arr.splice(0, 3));
console.log(arr.splice(0, 3));
console.log(arr.splice(0, 3));

// 自己写一个

function sum(n1, n2) {
  return n1 + n2;
}

console.log(sum(1, 2));
console.log(sum(1, 2));
console.log(sum(1, 2));
