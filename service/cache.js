const Koa = require('koa')
const router = require('koa-router')()
const cors = require('koa-cors')
const render = require('koa-art-template')
const static = require('koa-static'),
	path = require('path')

const app = new Koa()
// 配置跨域
app.use(cors())

render(app, {
	root: path.join(__dirname, 'views'),
	extname: '.html'
})

// 动态的绝对路径
app.use(static(path.join(__dirname), './static'))

let time = new Date().toUTCString()
router.get('/cache', ctx => {
	// ctx.response.set('Cache-Control', 'max-age=5')
	// ctx.response.set('Expires', 'Sun, 26 Mar 2023 07:31:59 GMT')
	ctx.response.set('Pragma', 'no-cache')
	ctx.response.set('Last-Modified', time)
	if (ctx) ctx.body = 111
})

router.get('/getList', async ctx => {
	ctx.render('index')
})

// 配置路由（建议写在开启服务器的前面） 允许所有的请求方法
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
	console.log('http://localhost:3000')
})
