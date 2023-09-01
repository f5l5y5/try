const Koa = require("koa");
const cors = require("koa-cors");
const { PassThrough } = require("stream");

const app = new Koa();
// 配置跨域
app.use(cors());
app.use(async (ctx, next) => {
    if (ctx.path !== "/api/sse") {
      return await next();
    }

    // ctx.set({
    //   "Content-Type": "text/event-stream",
    //   "Cache-Control": "no-cache",
    //   Connection: "keep-alive",
    // });

    ctx.request.socket.setTimeout(0);
    ctx.req.socket.setNoDelay(true);
    ctx.req.socket.setKeepAlive(true);
    console.log('打印***1111',1111)
   
    // const stream = new PassThrough();
    // ctx.body = stream;

    // setInterval(() => {
    //   stream.write(`id: 1123\n\n`);
    //   stream.write(`event:lol\n`)
    //   stream.write(`data: 111\n\n`);
    // }, 1000);

    // 设置响应体
    ctx.respond = false;
    ctx.res.removeHeader("Content-Type"); // 移除默认的Content-Type响应头
    ctx.res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // 使用计时器定期写入数据到流
    setInterval(() => {
      ctx.res.write("id: 1123\n\n");
      // ctx.res.write("event: lol\n");
      ctx.res.write("data: 111\n\n");
    }, 1000);

    // 监听请求关闭事件
    ctx.req.on("close", () => {
      ctx.res.end(); // 结束响应
    });
  })
  .use((ctx) => {
    ctx.status = 200;
    ctx.body = "ok";
  })
  .listen(3000, () => console.log("Listening"));
