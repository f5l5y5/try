const puppeteer = require("puppeteer");
const { shuffle, random } = require("lodash");

//延迟函数
const sleep = (time) => {
	return new Promise((r, j) => {
		setTimeout(() => {
			r(time);
		}, time);
	});
};
let sum = 1;

let browser, page


(async () => {

	async function reader() {
		if (!browser) {
			browser = await puppeteer.launch({
				headless: false,
				defaultViewport: null,
				args: ["--start-maximized"],
			});

			// 1. 启动一个Chrome浏览器实例
			page = await browser.newPage(); // 创建一个新的标签页
		}

		const allArticle = [
		"https://juejin.cn/post/7501588469699428378",
		"https://juejin.cn/post/7493579575848271887",
		// "https://juejin.cn/post/7439009350050807835",
		// "https://juejin.cn/post/7437392704231948298"	
		];



		// 遍历刷新
		for (let i = 0; i < allArticle.length; i++) {
			const time = 30000;
			const url = allArticle[i];
			console.log(`已完成${i + 1}篇`);
			await page.goto(url); // 导航到指定的网页
			await sleep(time);
		}
	}



	const timer = setInterval(async () => {
		await reader();
		console.log(`完成${sum++}轮刷新`);
		if (sum > 100) {
			clearInterval(timer)
			browser.close(); // 关闭浏览器实例
		};
	}, 1000 * 60);
})();
