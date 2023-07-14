const path = require("path");

module.exports = {
  mode: "development",
  entry: "./main.js", // 入口文件路径
  output: {
    filename: "bundle.js", // 输出文件名
    path: path.resolve(__dirname, "dist"), // 输出文件夹路径
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.js$/,
  //       exclude: /node_modules/,
  //       use: {
  //         loader: "babel-loader",
  //       },
  //     },
  //   ],
  // },
};
