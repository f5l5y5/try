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

(async () => {
  async function reader(allArticle) {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });

    // 1. 启动一个Chrome浏览器实例
    const page = await browser.newPage(); // 创建一个新的标签页

    const maxNumber = Number(process.argv[2])
      ? Number(process.argv[2])
      : 60;

    // 遍历刷新
    for (let i = 0; i < 1; i++) {
      const time = 5000;
      const url = allArticle[i];
      console.log(url, i);
      console.log(`已完成${i + 1}篇`);
      await page.goto(url); // 导航到指定的网页
      await sleep(time);
      i && console.clear();
    }
    await browser.close(); // 关闭浏览器实例
  }

  const allArticle = [
    "https://juejin.cn/post/7351728888982503460",
    "https://juejin.cn/post/7349437605857837067",
    "https://juejin.cn/post/7349360925185785867",
  ];
  reader(allArticle);
  const timer = setInterval(async () => {
    await reader(allArticle);
    console.log(`完成${sum++}轮刷新`);
    if (sum > 80) clearInterval(timer);
  }, 60 * 1000);
})();
