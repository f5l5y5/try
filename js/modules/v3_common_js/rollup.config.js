import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "./main.js",
  output: {
    file: "bundle.js",
    format: "amd",
  },

  plugins: [
    commonjs(), // 使用 commonjs 插件
  ],
};
