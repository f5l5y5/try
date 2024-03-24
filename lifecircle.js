const environment = process.env.npm_lifecycle_event;
console.log("打印***process.env", process.env);
if (environment === "lint") {
  console.log("打印***lint", environment);
}
if (environment === "prelint") {
  console.log("打印***prelint", environment);
}
if (environment === "postlint") {
  console.log("打印***postlint", environment);
}
