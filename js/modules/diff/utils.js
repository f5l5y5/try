// lib.js
/* ========== ESM =========== */
// export let counter = 3;
// export function increaseCount() {
//   counter++;
// }

/* ========== CommonJS =========== */
let counter = 3
function increaseCount() {
	counter++
}
module.exports = {
	counter,
	increaseCount
}