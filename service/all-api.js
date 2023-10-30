const Koa = require('koa')
const Router = require('koa-router')
const websockify = require('koa-websocket')
const cors = require('koa2-cors')
const { koaBody } = require('koa-body');

const app = new Koa();

app.use(koaBody());


// 使用koa2-cors中间件解决跨域
app.use(cors())

const router = new Router()

//  使用 koa-websocket 将应用程序升级为 WebSocket 应用程序
const appWebSocket = websockify(app)

// webSocket
appWebSocket.ws.use((ctx, next) => {
	// 存储新连接的客户端
	clients.add(ctx.websocket)
	// 处理连接关闭事件
	ctx.websocket.on('close', () => {
		clients.delete(ctx.websocket)
	})
	ctx.websocket.on('message', (data) => {
		console.log('打印***data', data)
		ctx.websocket.send('pong' + Math.random())
	})
	ctx.websocket.on('error', (err) => {
		console.log('打印***err', err)
		clients.delete(ctx.websocket)
	})

	return next(ctx)
})

// xhr
router.get('/api/siteWork/list', (ctx) => {
	console.log('打印***1111')
	ctx.body = {
		code: 200,
		data: 'I am xhr!'
		
	}
})
// xhr
router.post('/api/xhr', (ctx) => {
	ctx.body = 'I am xhr!'
})
// fetch
router.get('/api/fetch', (ctx) => {
	ctx.body = 'I am fetch!'
})
// beacon
router.post('/api/beacon', (ctx) => {
	const data = ctx.request.body
	console.log('打印***data', data)
	ctx.body = 'I am beacon!'
})
// sse
router.get('/api/sse', (ctx) => {

	ctx.respond = false
	ctx.res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
	});

	// 发送初始事件数据
	ctx.res.write(`data: I am sse!\n\n`);

	// 定期发送事件数据
	setInterval(() => {
		ctx.res.write(`data: This is a SSE message at ${new Date().toISOString()}\n\n`);
	}, 1000);
})

// 将路由注册到应用程序
appWebSocket.use(router.routes()).use(router.allowedMethods())

// 启动服务器
appWebSocket.listen(3000, () => {
	console.log('Server started on port 3000')
})
