const http = require("node:http");
const fs = require("node:fs");
const url = require("node:url");
const crypto = require("crypto");

http
  .createServer((req, res) => {
    console.log(req.method, req.url);

    const { pathname } = url.parse(req.url);
		if (pathname === "/") {
			// 使用时间对比
      const html = fs.readFileSync("./index.html");
      res.end(html);
    } else if (pathname === "/images/img01.jpeg") {
      const data = fs.readFileSync("./images/img01.jpeg");
      res.writeHead(200, {
        Expires: new Date(
          "2023-08-15 08:36:00"
        ).toUTCString(),
      });
      res.end(data);
		} else if (pathname === "/images/img02.jpeg") {
			// 相对时间
      const data = fs.readFileSync("./images/img02.jpeg");
      res.writeHead(200, {
        "Cache-Control": "max-age=5", // 滚动时间单位s
      });
      res.end(data);
		} else if (pathname === "/images/img03.jpeg") {
			// 时间对比 不可以  可以修改时间
      const data = fs.readFileSync("./images/img03.jpeg");
      const { mtime } = fs.statSync("./images/img03.jpeg");
      // 对比时间
      const ifModifiedSince =
				req.headers["if-modified-since"];
			
			if (ifModifiedSince === mtime.toUTCString()) {
				res.statusCode = 304
				res.end()
				return 
			}

      res.setHeader("last-modified", mtime.toUTCString());
      res.setHeader("Cache-Control", "no-cache"); // 滚动时间单位s
      // 重新请求会有if-modified-since   If-Modified-Since
      res.end(data);
		} else if (pathname === "/images/img04.jpeg") {
			// etag 文件内容生成签名值 不使用etag包
			const data = fs.readFileSync("./images/img04.jpeg");
			const etagContent = crypto
        .createHash("md5")
        .update(data)
				.digest("hex");
			
			const ifNoneMatch = req.headers['if-none-match']

			if (ifNoneMatch === etagContent) {
				res.statusCode = 304
				res.end()
				return
			}
			
			console.log('打印***etagContent',etagContent)
      res.setHeader("etag", etagContent);
      res.setHeader("Cache-Control", "no-cache"); 
      res.end(data);
    } else {
      res.statusCode = 404;
      res.end;
    }
  })
  .listen(3000, () => {
    console.log("http://localhost:3000");
  });
