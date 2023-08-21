const http = require("node:http");
const fs = require("node:fs");
const url = require("node:url");
const crypto = require("crypto");

http
  .createServer((req, res) => {
    console.log(req.method, req.url);

    const { pathname } = url.parse(req.url);
    if (pathname === "/") {
      const html = fs.readFileSync("./index.html");
      res.end(html);
    } else if (pathname === "/images/img01.jpeg") {
      // res.writeHead(200, {
      //   "Cache-Control": "no-cache max-age=30", // 滚动时间单位s
      //   Expires: new Date(
      //     "2023-08-18 11:24:55"
      //   ).toUTCString(),
      // });
      const data = fs.readFileSync("./images/img01.jpeg");
      // 获取etag
      const etag = crypto
        .createHash("md5")
        .update(data)
        .digest("hex");

      // 获取last-modified
      const { mtime } = fs.statSync("./images/img01.jpeg");
      const lastModified = mtime.toUTCString();

      // 设置响应头
      res.setHeader("last-modified", lastModified);
      res.setHeader("etag", etag);
      res.setHeader("Cache-Control", "no-cache");

      // if-none-match与etag对比
      const ifNoneMatch = req.headers["if-none-match"];
      if (ifNoneMatch === etag) {
        res.statusCode = 304;
        res.end();
        return;
      }

      // if-modified-since与lastModified
      const ifModifiedSince =
        req.headers["if-modified-since"];
      if (ifModifiedSince === lastModified) {
        res.statusCode = 304;
        res.end();
        return;
      }

      res.end(data);
    } else {
      res.statusCode = 404;
      res.end();
    }
  })
  .listen(3000, () => {
    console.log("http://localhost:3000");
  });
