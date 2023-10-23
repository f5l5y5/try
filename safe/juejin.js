const puppeteer = require("puppeteer");
const { shuffle, random } = require("lodash");
const { file } = require("@babel/types");

//延迟函数
const sleep = (time) => {
  return new Promise((r, j) => {
    setTimeout(() => {
      r(time);
    }, time);
  });
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  // 1. 启动一个Chrome浏览器实例
  const page = await browser.newPage(); // 创建一个新的标签页
  // 2. 访问网页 拿到所有文章
  await page.goto(
    "https://juejin.cn/user/2824015112318094"
  );
  const res = await page.evaluate(() => {
    return fetch(
      "https://api.juejin.cn/content_api/v1/article/query_list",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cursor: "10",
          sort_type: 2,
          user_id: "2824015112318094",
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => res.data);
  });
  if (!res) return;
  let total = 0;
  if (res.length) {
    total = res[0].author_user_info.post_article_count;
  }

  const allArticle = [];
  for (let j = 0; j < total; j += 10) {
    const data = await page.evaluate(() => {
      return fetch(
        "https://api.juejin.cn/content_api/v1/article/query_list",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cursor: "j",
            sort_type: 2,
            user_id: "2824015112318094",
          }),
        }
      )
        .then((res) => res.json())
        .then((res) => res.data);
    });
    data.forEach((art) => {
      allArticle.push(
        "https://juejin.cn/post/" + art.article_id
      );
    });
  }

  const randomNumber = random(100, total);
  const filterArticle = shuffle(allArticle).filter((_, i) => i <= randomNumber)
  const filterLen = filterArticle.length;
  console.log(filterArticle,filterLen)

  const maxNumber = Number(process.argv[2])
    ? Number(process.argv[2])
    : 60;

  // 遍历刷新
  for (let i = 0; i < filterLen; i++) {
    const time = random(1, maxNumber) * 1000;
    const url = filterArticle[i];
    console.log(url,i);
    console.log(
      `总数${total} 本次刷新${filterLen}篇，刷新间隔${
        time / 1000
      }秒，已完成${i + 1}篇`
    );
    await page.goto(url); // 导航到指定的网页
    await sleep(time);
    i && console.clear();
  }
  await browser.close(); // 关闭浏览器实例
})();

Math.random();
