const Koa = require('koa')
const fs = require('fs')
const cors = require('koa-cors')
const crypto = require('crypto')
const router = require('koa-router')()
const path = require('path')

const app = new Koa()
// 配置跨域
app.use(cors())

// 读取静态文件
function readFile(filePath) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, (err, data) => {
			if (err) reject(err)
			else resolve(data)
		})
	})
}

router.get('/cache', async ctx => {
	const filePath = path.resolve(__dirname, 'views/index.html')
	const fileContent = await readFile(filePath)

	// 计算文件的 ETag 和 Last-Modified
	const hash = crypto.createHash('md5').update(fileContent).digest('hex')
	console.log('打印***hash', hash)
	// 获取文件修改的时间
	const lastModified = fs.statSync(filePath).mtime.toUTCString()
	console.log('打印***lastModified', lastModified)

	// 如果客户端请求头中的 If-None-Match 字段与服务端生成的资源的 ETag 字段一致，则返回 304 Not Modified 状态码
	if (ctx.headers['if-none-match'] === hash) {
		ctx.status = 304
		return
	}

	// 如果客户端请求头中的 If-Modified-Since 字段与服务端生成的资源的 Last-Modified 字段一致或更晚，则返回 304 Not Modified 状态码
	if (ctx.headers['if-modified-since'] === lastModified) {
		ctx.status = 304
		return
	}

	// 设置响应头中的 ETag 和 Last-Modified 字段
	// ctx.set('Content-Type', 'text/html')
	ctx.set('Access-Control-Expose-Headers', '*') // 暴露给客户端使用
	ctx.set('ETag', hash)
	ctx.set('Last-Modified', lastModified)

	ctx.body = fileContent
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
	console.log('http://localhost:3000')
})
