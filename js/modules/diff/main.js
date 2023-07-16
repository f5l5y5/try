
// main.js
/* ========== ESM =========== */
// import { counter, increaseCount } from './utils.js';

// console.log(counter); // 3
// increaseCount();
// console.log(counter); // 4

/* ========== CommonJS =========== */
const { counter, increaseCount } = require('./utils')

console.log(counter);
increaseCount()
console.log(counter);