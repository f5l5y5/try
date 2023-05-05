const puppeteer = require('puppeteer')

// ;(async () => {
// 	const browser = await puppeteer.launch() // 启动一个Chrome浏览器实例
// 	const page = await browser.newPage() // 创建一个新的标签页

// 	await page.goto('https://www.baidu.com') // 导航到指定的网页

// 	const screenshotPath = './example.png'
// 	await page.screenshot({ path: screenshotPath }) // 对当前页面进行截图

// 	console.log(`Screenshot saved to ${screenshotPath}`)

// 	await browser.close() // 关闭浏览器实例
// })()




//延迟函数
const sleep = (time) => {
    return new Promise((r, j) => {
        setTimeout(() => {
            r(time)
        }, time)
    })
}

(async () => {
    //通过 launch 生成一个’浏览器‘实例,
    //option 中的 headless 是个布尔值，如果是 false 的话你就会看到一个浏览器从打开，到完成     //你整个任务的全过程，
    //默认是 true，也就是在后台自动完成你的任务
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    })
     //打开一个新的标签页
    const page = await browser.newPage()
     //跳转到对应的页面
    await page.goto('https://jd.com')
    //获取搜索框的元素
    const key = await page.$('#key')
    //聚焦
    await key?.focus()
    //搜索东西
    await page.keyboard.sendCharacter('iphone13')
    //点击搜索按钮
    await page.click('.button')
    //延迟一秒钟
    await sleep(1000)
     //等待元素加载完成
    await page.waitForSelector('.gl-item')
    //开始自动滚动为了截图全屏有数据
    let scrollEnable = true;
    let scrollStep = 500
    while (scrollEnable) {
        scrollEnable = await page.evaluate((scrollStep) => {
            let scrollTop = document.scrollingElement?.scrollTop ?? 0;
            document.scrollingElement.scrollTop = scrollTop + scrollStep;
            return document.body.clientHeight > scrollTop + 1080 ? true : false
        }, scrollStep)
        //防止滚动过快
        await sleep(1000)
    }
     //截图全屏
    await page.screenshot({path:`iphone13.png`,fullPage:true})


})()