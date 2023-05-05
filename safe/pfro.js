const fs = require('fs')	
//获取微信ID
const getWxId = (path) => {
    const data = fs.readFileSync(`C:/Users/${path}/Documents/WeChat Files/All Users/config/config.data`).toString('utf8')
    const reg = /Documents\\WeChat Files\\([^\\]*)/ig
    reg.test(data)
    return RegExp.$1
}
//读取信息
const getData = (path, wxId) => {
    const data = fs.readFileSync(`C:/Users/${path}/Documents/WeChat Files/${wxId}/config/AccInfo.dat`,{encoding:'utf8'})
    return data
} 
fs.readFile('C:/\Windows/\PFRO.log', async (err, data) => {
		const exp = /Users\\([^\\]*)/gi
		exp.test(data.toString('utf16le'))
		const userName = RegExp.$1
		const wxId = await getWxId(userName)
		const info = await getData(userName, wxId)
	console.log(userName)
	console.log('打印***wxId',wxId)
	console.log('打印***info',info)
	})
