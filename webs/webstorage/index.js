// const express = require("express");
// const cors = require('cors')
// const app = express();

// app.use(cors())

// app.get("/cache", (req, res) => {
// 	res.header['Access-Control-Allow-Origin' ]='*'
// 	return res.json(
// 		{
// 			code: 1,
// 			msg:'666'
// 		}
// 	);
// });

// app.listen(3000, () => console.log("> Ready to keylog at localhost:3000"));


const express = require('express');
const cors = require('cors')
const session = require('express-session');
const app = express();
app.use(cors())

// 将 public 目录设置为静态资源文件夹
app.use(express.static('public'));
// 设置 session 配置
app.use(
  session({
    secret: 'mySecretKey',
    resave: false,
		saveUninitialized: true,
		name:'sid'
  })
);


// 创建一个简单的路由，将访问次数存储在 session 中
app.get('/count', function (req, res) {
	console.log('打印***req.session.views',req.session.views)
  if (req.session.views) {
    req.session.views++;
    res.setHeader('Content-Type', 'text/html');
    res.write('<p>访问次数: ' + req.session.views + '</p>');
    res.end();
  } else {
    req.session.views = 1;
    res.end('欢迎您首次光临！请刷新页面查看访问次数');
  }
});

app.get('/', function(req, res) {
  // res.send('Hello World!');
	 res.sendFile(__dirname + '/index.html');
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
