const Koa = require('koa')
const router = require('koa-router')()

const app = new Koa()
// 配置跨域

// index.js  http://127.0.0.1:8000
// const Websocket = require('ws')

// const port = 8000
// const ws = new Websocket.Server({ port })
// ws.on('connection', obj => {
// 	obj.on('message', data => {
// 		data = JSON.parse(data.toString())
// 		const { name, age } = data
// 		obj.send(`${name}今年${age}岁啦！！！`)
// 	})
// })

// 动态路由
router.post('/getList', ctx => {
	const { name, age, callback } = ctx.request.query

	ctx.response.set('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')

	console.log('打印***ctx.request.query', ctx)

	const person = `我是${name}年龄${age}`
	// ctx.body = `${callback}(${JSON.stringify({ name, age })})`
	ctx.body = {
		data: 'jack'
	}
})
router.get('/getList1', ctx => {
	// console.log('打印***ctx.request.query', ctx.request.query)
	// const { name, age, callback } = ctx.request.query
	// const person = `我是${name}年龄${age}`
	ctx.body = `返回的数据`
})

// 配置路由（建议写在开启服务器的前面） 允许所有的请求方法
app.use(router.routes()).use(router.allowedMethods())

app.listen(4000, () => {
	console.log('http://localhost:4000')
})
