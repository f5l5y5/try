const Koa = require('koa');
const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const cors = require('koa-cors')

const app = new Koa();
const router = new Router();
app.use(cors())


router.get('/download', async (ctx) => {
    const filePath = path.join(__dirname, 'files', 'file.pdf');
    const fileName = 'file.pdf'; // 下载时显示的文件名

    // 设置响应头
    ctx.set('Content-Disposition', `attachment; filename=${fileName}`);
    // ctx.set('Content-Disposition', `inline; filename=${fileName}`);
    // 设置未pdf预览
    // ctx.set('Content-Type', 'application/pdf');
    ctx.set('Content-Type', 'application/octet-stream');

    // 创建文件读取流
    const fileStream = fs.createReadStream(filePath);

    // 将文件流传输到响应体
    ctx.body = fileStream;

    fileStream.on('error', (err) => {
        console.error('文件读取错误:', err);
        ctx.throw(500, '文件读取错误');
    });
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 5500;
app.listen(PORT, () => {
    console.log(`服务器在 http://localhost:${PORT} 运行`);
});
