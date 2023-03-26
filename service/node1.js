const Koa = require('koa')
const router = require('koa-router')()
const cors = require('koa-cors')
const axios = require('axios')
const static = require('koa-static'),
	path = require('path')

const app = new Koa()
// 配置跨域
app.use(cors())

// 动态的绝对路径
app.use(static(path.join(__dirname), './static'))

/**
 前端必须开启withCredentials 
 options中不设置 Access-Control-Allow-Credentials', 'true'， 不会发get请求，尽管显示成功options
 设置后，可以get请求，但是浏览器会显示跨域，需要将 get请求的头设置为true
 
 */

// router.options('/getList', ctx => {
// 	// ctx.response.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE')
// 	ctx.response.set('Access-Control-Allow-Headers', 'Cache-Control')
// 	ctx.response.set('Access-Control-Allow-Credentials', 'true')
// 	ctx.response.set('Access-Control-Allow-Origin', 'http://localhost:5174')
// 	console.log('打印***ctx', ctx)
// 	ctx.body = 204
// 	ctx.response.status = 204
// })

app.use((ctx, next) => {
	console.log(ctx)
	next()
})

router.get('/static', ctx => {
	console.log('打印***111', 111)
})

router.get('/getList', async ctx => {
	console.log('打印***1', ctx.request)
	// ctx.response.set('Access-Control-Allow-Methods', 'POST')
	// ctx.response.set('Access-Control-Allow-Headers', 'X-Requested-With')
	// ctx.response.set('Access-Control-Allow-Credentials', 'true')
	// ctx.response.set('Access-Control-Allow-Headers', 'Cache-Control')

	ctx.response.set('Cache-Control', 'max-age=6000')
	// ctx.response.set('Expires', new Date(Date.now() + 6000).toUTCString())

	// ctx.response.set('Access-Control-Allow-Origin', 'http://localhost:5174')
	// ctx.response.set('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
	ctx.body = `<div>你好</div>`
	// const res = await axios.get('http://localhost:4000/getList1')
	// ctx.body = res.data
})

// 配置路由（建议写在开启服务器的前面） 允许所有的请求方法
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
	console.log('http://localhost:3000')
})
