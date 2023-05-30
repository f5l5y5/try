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
		name: 'sid'
	})
);


// 创建一个简单的路由，将访问次数存储在 session 中
app.get('/count', function (req, res) {
	console.log('打印***req.session.views', req.session.views)
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

app.get('/', function (req, res) {
	// res.send('Hello World!');
	res.sendFile(__dirname + '/index.html');
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});



const arr = [
	{
		"appId": "pep-web",
		"name": "项目管理",
		"desc": "集团项目全生命周期管理系统",
		"picUrl": "https://test.img.betterwood.com/sys/management/pep-web.png",
	},
	{
		"appId": "ShandsMMR",
		"name": "数说（老版）",
		"desc": "酒店集团数据平台（老版）",
		"picUrl": "https://test.img.betterwood.com/sys/management/ShandsMMR.png",
	},
	{
		"appId": "delonix-admin",
		"name": "Delonix管理后台",
		"desc": "德胧管理后台",
		"picUrl": "https://test.img.betterwood.com/sys/management/delonix-admin.png",
	},
	{
		"appId": "senbo-guest-ticket",
		"name": "森客",
		"desc": "森泊门票核销系统",
		"picUrl": "https://test.img.betterwood.com/sys/management/senbo-guest-ticket.png",
	},
	{
		"appId": "shands-uc3",
		"name": "通宝",
		"desc": "集团用户一体化管理应用平台",
		"picUrl": "https://test.img.betterwood.com/sys/management/shands-uc3.png",
	},
	{
		"appId": "ELS",
		"name": "ELS",
		"desc": "ELS-会员忠诚度管理系统",
		"picUrl": "https://test.img.betterwood.com/sys/management/ELS.png",
	},
	{
		"appId": "ETS",
		"name": "ETS",
		"desc": "ETS-电子券核销",
		"picUrl": "https://test.img.betterwood.com/sys/management/ETS.png",
	},
	{
		"appId": "ETS-NEW",
		"name": "票券营销中心",
		"desc": "票券营销中心(ETS-NEW)",
		"picUrl": "https://test.img.betterwood.com/sys/management/ETS_NEW.png",
	},
	{
		"appId": "channelCloud",
		"name": "渠道通(TC)",
		"desc": "",
		"picUrl": "https://test.img.betterwood.com/sys/management/channelCloud.png",
	},
	{
		"appId": "chatgpt",
		"name": "ChatGPT",
		"desc": "ChatGPT应用",
		"picUrl": "https://test.img.betterwood.com/sys/management/chatgpt.png",
	},
	{
		"appId": "fanruan",
		"name": "报表平台",
		"desc": "德胧集团大数据平台",
		"picUrl": "https://test.img.betterwood.com/sys/management/fanruan.png",
	},
	{
		"appId": "message-setting-center",
		"name": "消息中心",
		"desc": "消息中心管理",
		"picUrl": "https://test.img.betterwood.com/sys/management/message-setting-center.png",
	},
	{
		"appId": "senbo-haogu",
		"name": "森泊渠道通（皓谷）",
		"desc": "",
		"picUrl": "https://test.img.betterwood.com/sys/management/senbo-haogu.png",
	},
	{
		"appId": "shands-account",
		"name": "扇贝奖励账户",
		"desc": "",
		"picUrl": "https://test.img.betterwood.com/sys/management/shands-account.png",
	},
	{
		"appId": "shands-gys",
		"name": "供应商评价",
		"desc": "供应商评价",
		"picUrl": "https://test.img.betterwood.com/sys/management/shands-gys.png",
	},
	{
		"appId": "shands-wechat-cloud",
		"name": "扇微Cloud",
		"desc": "扇微",
		"picUrl": "https://test.img.betterwood.com/sys/management/shands-wechat-cloud.png",
	},
	{
		"appId": "shandsis",
		"name": "积分商城",
		"desc": "",
		"picUrl": "https://test.img.betterwood.com/sys/management/shandsis.png",
	},
	{
		"appId": "billboard-rest",
		"name": "扇动力",
		"desc": "",
		"picUrl": "https://test.img.betterwood.com/sys/management/billboard-rest.png",
	},
	{
		"appId": "gw-admin",
		"name": "官网管理后台",
		"desc": "官网管理后台",
		"picUrl": "https://test.img.betterwood.com/sys/management/gw-admin.png",
	},
	{
		"appId": "jst-rest",
		"name": "结算通管理后台",
		"desc": "结算通管理后台",
		"picUrl": "https://test.img.betterwood.com/sys/management/jst-rest.png",
	},
	{
		"appId": "senbo-setting-center",
		"name": "森泊渠道通",
		"desc": "",
		"picUrl": "https://test.img.betterwood.com/sys/management/senbo-setting-center.png",
	},
	{
		"appId": "pinmall-admin",
		"name": "悦选商城",
		"desc": "悦选商城管理后台",
		"picUrl": "https://test.img.betterwood.com/sys/management/pinmall-admin.png",
	},
	{
		"appId": "setting-center",
		"name": "渠道通管理后台",
		"desc": "渠道通管理后台",
		"picUrl": "https://test.img.betterwood.com/sys/management/setting-center.png",
	},
	{
		"appId": "USL",
		"name": "USL联合销售",
		"desc": "USL联合销售",
		"picUrl": "https://test.img.betterwood.com/sys/management/USL.png",
	},
	{
		"appId": "ETS-MGMT",
		"name": "ETS管理后台",
		"desc": "ETS管理后台",
		"picUrl": "https://test.img.betterwood.com/sys/management/ETS-MGMT.png",
	},
	{
		"appId": "mod3",
		"name": "扇小二",
		"desc": "",
		"picUrl": "https://test.img.betterwood.com/sys/management/mod3.png",
	},
	{
		"appId": "mod3-pt",
		"name": "扇小二运营平台",
		"desc": "",
		"picUrl": "https://test.img.betterwood.com/sys/management/mod3-pt.png",
	}
]


const arr = [
	{
		"appId": "pep-web",
		"name": "项目管理",
		"desc": "集团项目全生命周期管理系统",
		"picUrl": "http://tb.shands.cn/icon/icon_pep-web.png",
		"url": "http://pep.delonix.group?uc_token=${token}"
	},
	{
		"appId": "ShandsMMR",
		"name": "数说（老版）",
		"desc": "酒店集团数据平台（老版）",
		"picUrl": "",
		"url": "http://shushuo.shands.cn/rest/login/uc?token=${token}"
	},
	{
		"appId": "delonix-admin",
		"name": "Delonix管理后台",
		"desc": "德胧管理后台",
		"picUrl": "11",
		"url": "https://console.betterwood.com/?uc_token=${token}"
	},
	{
		"appId": "senbo-guest-ticket",
		"name": "森客",
		"desc": "森泊门票核销系统",
		"picUrl": "",
		"url": "http://sgt.shands.cn/rest/login/uc?token=${token}&hotel_id=${hotelId}"
	},
	{
		"appId": "shands-uc3",
		"name": "通宝",
		"desc": "集团用户一体化管理应用平台",
		"picUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Ftech.sina.com.cn%2Froll%2F2020-05-19%2Fdoc-iircuyvi3973713.shtml&psig=AOvVaw2ggg6KOC1QrJKapNUnLz1t&ust=1598753869697000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCMinxrWsv-sCFQAAAAAdAAAAABAD",
		"url": "/mgmt/dashboard?uc_token=${token}"
	},
	{
		"appId": "ELS",
		"name": "ELS",
		"desc": "ELS-会员忠诚度管理系统",
		"picUrl": "www",
		"url": "http://els.shands.cn/login/adminUc.htm?token=${token}"
	},
	{
		"appId": "ETS",
		"name": "ETS",
		"desc": "ETS-电子券核销",
		"picUrl": "www",
		"url": "http://ets.shands.cn/front/ucLogin.htm?token=${token}"
	},
	{
		"appId": "ETS-NEW",
		"name": "票券营销中心",
		"desc": "票券营销中心(ETS-NEW)",
		"picUrl": " ",
		"url": "http://ets-new.shands.cn/ssoLogin?uc_token=${token}"
	},
	{
		"appId": "channelCloud",
		"name": "渠道通(TC)",
		"desc": "",
		"picUrl": " ",
		"url": "http://channel.hotelgo.cn/#/ssoLogin?uc_token=${token}"
	},
	{
		"appId": "chatgpt",
		"name": "ChatGPT",
		"desc": "ChatGPT应用",
		"picUrl": "1",
		"url": "http://chat-gpt.delonix.group?token=${token}"
	},
	{
		"appId": "fanruan",
		"name": "报表平台",
		"desc": "德胧集团大数据平台",
		"picUrl": "www",
		"url": "http://shushuo.delonix.group/webroot/decision?uc_token=${token}&method2=POST"
	},
	{
		"appId": "message-setting-center",
		"name": "消息中心",
		"desc": "消息中心管理",
		"picUrl": "1",
		"url": "http://mc2.shands.cn/?uc_token=${token}"
	},
	{
		"appId": "senbo-haogu",
		"name": "森泊渠道通（皓谷）",
		"desc": "",
		"picUrl": " ",
		"url": "http://sbchannel.hotelgo.cn/#/ssoLogin?uc_token=${token}"
	},
	{
		"appId": "shands-account",
		"name": "扇贝奖励账户",
		"desc": "",
		"picUrl": "a",
		"url": "http://account.kaiyuanhotels.com/#/ssoLogin?uc_token=${token}"
	},
	{
		"appId": "shands-gys",
		"name": "供应商评价",
		"desc": "供应商评价",
		"picUrl": null,
		"url": "http://gys.shands.cn?token=${token}"
	},
	{
		"appId": "shands-wechat-cloud",
		"name": "扇微Cloud",
		"desc": "扇微",
		"picUrl": "1",
		"url": "http://wx.kaiyuanhotels.com/web?uc_token=${token}"
	},
	{
		"appId": "shandsis",
		"name": "积分商城",
		"desc": "",
		"picUrl": "1",
		"url": "http://store3.kaiyuanhotels.com/rest/login/uc?uc_token=${token}"
	},
	{
		"appId": "billboard-rest",
		"name": "扇动力",
		"desc": "",
		"picUrl": "a",
		"url": "http://billboardsdl.shands.cn/#/ssoLogin?uc_token=${token}"
	},
	{
		"appId": "gw-admin",
		"name": "官网管理后台",
		"desc": "官网管理后台",
		"picUrl": "1",
		"url": "https://haohaoxuexi.kaiyuanhotels.com/#/ssoLogin?uc_token=${token}"
	},
	{
		"appId": "jst-rest",
		"name": "结算通管理后台",
		"desc": "结算通管理后台",
		"picUrl": "1",
		"url": "http://jst.shands.cn/#/ssoLogin?uc_token=${token}"
	},
	{
		"appId": "senbo-setting-center",
		"name": "森泊渠道通",
		"desc": "",
		"picUrl": " ",
		"url": "http://stopsbchannel.shands.cn/#/ssoLogin?uc_token=${token}"
	},
	{
		"appId": "pinmall-admin",
		"name": "悦选商城",
		"desc": "悦选商城管理后台",
		"picUrl": "1",
		"url": "https://yxmall-admin.kaiyuanhotels.com/ssoLogin?uc_token=${token}"
	},
	{
		"appId": "setting-center",
		"name": "渠道通管理后台",
		"desc": "渠道通管理后台",
		"picUrl": "1",
		"url": "http://stopchannel.shands.cn/#/ssoLogin?uc_token=${token}"
	},
	{
		"appId": "USL",
		"name": "USL联合销售",
		"desc": "USL联合销售",
		"picUrl": "1",
		"url": "http://usl.shands.cn/login/ucLogin.htm?token=${token}"
	},
	{
		"appId": "ETS-MGMT",
		"name": "ETS管理后台",
		"desc": "ETS管理后台",
		"picUrl": null,
		"url": "http://ets.shands.cn/single/ucLogin.htm?token=${token}"
	},
	{
		"appId": "mod3",
		"name": "扇小二",
		"desc": "",
		"picUrl": " ",
		"url": "http://sxe.shands.cn/middlePage?uc_token=${token}"
	},
	{
		"appId": "mod3-pt",
		"name": "扇小二运营平台",
		"desc": "",
		"picUrl": "1",
		"url": "http://sxe-admin.shands.cn/middlePage?uc_token=${token}"
	}
],