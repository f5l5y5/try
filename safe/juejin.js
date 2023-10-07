const puppeteer = require("puppeteer");
const { shuffle, random } = require("lodash");

const originArticleList = [
  "https://juejin.cn/post/7286266688193789952",// 30
  "https://juejin.cn/post/7286088186849312828",
  "https://juejin.cn/post/7286088186849296444",
  "https://juejin.cn/post/7285673629526638628",
  "https://juejin.cn/post/7285346707139166262",
	"https://juejin.cn/post/7285528146379489295",// 25
	"https://juejin.cn/post/7285604041932472335",
	"https://juejin.cn/post/7284678650200080399",
	"https://juejin.cn/post/7284468618021060623",
	"https://juejin.cn/post/7284468618019880975",
	"https://juejin.cn/post/7284573955267543040",
	"https://juejin.cn/post/7284143489737474088",// 19
	"https://juejin.cn/post/7284196027149287464",
	"https://juejin.cn/post/7283798844236431395",
	"https://juejin.cn/post/7283798251404230656",
	"https://juejin.cn/post/7283791013625397260",
	"https://juejin.cn/post/7283766466084225060",
	"https://juejin.cn/post/7283755778364473398",
	"https://juejin.cn/post/7283791013624856588",
	"https://juejin.cn/post/7283370609600397324",
	"https://juejin.cn/post/7283328111504556086",
  "https://juejin.cn/post/7282975291000569868",// 9
  "https://juejin.cn/post/7283027035965456447",
  "https://juejin.cn/post/7282692887649173516",
  "https://juejin.cn/post/7282692354973351948",
  "https://juejin.cn/post/7281905382486016011",
  "https://juejin.cn/post/7281905382485999627",
  "https://juejin.cn/post/7281825352530345995",
  "https://juejin.cn/post/7281651242022879286",
  "https://juejin.cn/post/7281651242022879286",
  "https://juejin.cn/post/7281651242022830134",// Rust、
  "https://juejin.cn/post/7283060133646385188",
  "https://juejin.cn/post/7280831651084320803",
  "https://juejin.cn/post/7280436213887008809",
  "https://juejin.cn/post/7280000052210335807",
	"https://juejin.cn/post/7274856771410264075",
	"https://juejin.cn/post/7272199653339234344",
  "https://juejin.cn/post/7271907645165682699",
  "https://juejin.cn/post/7270591134811553844",
  "https://juejin.cn/post/7268607295016681509",
  "https://juejin.cn/post/7268530145202667535",
  "https://juejin.cn/post/7266745788536127503",
  "https://juejin.cn/post/7265210393047220264",
  "https://juejin.cn/post/7264396960558399549",
  "https://juejin.cn/post/7263826380889784381",
  "https://juejin.cn/post/7263485683360235580",
  "https://juejin.cn/post/7261994543569469495",
  "https://juejin.cn/post/7260859104952057911",
  "https://juejin.cn/post/7260383080383578171",
  "https://juejin.cn/post/7259681568414416951",
  "https://juejin.cn/post/7257873564959653943",
  "https://juejin.cn/post/7257058135134765116",
  "https://juejin.cn/post/7255967761805721637",
  "https://juejin.cn/post/7255197799050182711",
  "https://juejin.cn/post/7254066710368616508",
  "https://juejin.cn/post/7253391363453288506",
  "https://juejin.cn/post/7252589598152523837",
  "https://juejin.cn/post/7251981828741939261",
  "https://juejin.cn/post/7250776775937343546",
  "https://juejin.cn/post/7249647793898307644",
  "https://juejin.cn/post/7249348036986814522",
  "https://juejin.cn/post/7241487780464263205",
  "https://juejin.cn/post/7241187132889645117",
  "https://juejin.cn/post/7240765897768878139",
  "https://juejin.cn/post/7239715295484592189",
  "https://juejin.cn/post/7239173192493547576",
  "https://juejin.cn/post/7239111080164753467",
  "https://juejin.cn/post/7238762963908362277",
  "https://juejin.cn/post/7238200443582955577",
  "https://juejin.cn/post/7235966082032648249",
  "https://juejin.cn/post/7235228760243486757",
  "https://juejin.cn/post/7235216665431162937",
  "https://juejin.cn/post/7235052094125621306",
  "https://juejin.cn/post/7234924083842433084",
  "https://juejin.cn/post/7234803427041345594",
  "https://juejin.cn/post/7234810590874681404",
  "https://juejin.cn/post/7234133211965505597",
  "https://juejin.cn/post/7234124469572386877",
  "https://juejin.cn/post/7233785522370625595",
  "https://juejin.cn/post/7233784421336694841",
  "https://juejin.cn/post/7233696698862157861",
  "https://juejin.cn/post/7233697025711079479",
  "https://juejin.cn/post/7233057834287972411",
  "https://juejin.cn/post/7233053557833760829",
  "https://juejin.cn/post/7233023728291823673",
  "https://juejin.cn/post/7233012756316012604",
  "https://juejin.cn/post/7232625387297439800",
  "https://juejin.cn/post/7232627919767683129",
  "https://juejin.cn/post/7232284746134192187",
  "https://juejin.cn/post/7232284746134143035",
  "https://juejin.cn/post/7231907374687748156",
  "https://juejin.cn/post/7231896581478055995",
  "https://juejin.cn/post/7231552045931921463",
  "https://juejin.cn/post/7231540022596075581",
  "https://juejin.cn/post/7231097076062060604",
  "https://juejin.cn/post/7230835244768264229",
  "https://juejin.cn/post/7230595863691690043",
  "https://juejin.cn/post/7230461901356384316",
  "https://juejin.cn/post/7230457042963644472",
  "https://juejin.cn/post/7230450465750024251",
  "https://juejin.cn/post/7229832272022241337",
  "https://juejin.cn/post/7229787490256814141",
  "https://juejin.cn/post/7229473045316255804",
  "https://juejin.cn/post/7229463713409269815",
  "https://juejin.cn/post/7229168408419696696",
  "https://juejin.cn/post/7228990409908224057",
  "https://juejin.cn/post/7225231707825537083",
  "https://juejin.cn/post/7224433996137381949",
  "https://juejin.cn/post/7224426218929930301",
  "https://juejin.cn/post/7223778145790197797",
  "https://juejin.cn/post/7223775785207513125",
  "https://juejin.cn/post/7223410490763313189",
  "https://juejin.cn/post/7223410490763296805",
  "https://juejin.cn/post/7223037521424597052",
  "https://juejin.cn/post/7223037521424531516",
  "https://juejin.cn/post/7222666523834925116",
  "https://juejin.cn/post/7222666499663036477",
  "https://juejin.cn/post/7222486446615986236",
  "https://juejin.cn/post/7222486446615953468",
  "https://juejin.cn/post/7221557738539040823",
  "https://juejin.cn/post/7221557738539024439",
  "https://juejin.cn/post/7221320687431417917",
  "https://juejin.cn/post/7221186238248779833",
  "https://juejin.cn/post/7220821129333342263",
  "https://juejin.cn/post/7220441273919717436",
  "https://juejin.cn/post/7220439797566865469",
  "https://juejin.cn/post/7220054775298195511",
  "https://juejin.cn/post/7220049949026385976",
  "https://juejin.cn/post/7219688933575245883",
  "https://juejin.cn/post/7219674355490930748",
  "https://juejin.cn/post/7219656530236686396",
  "https://juejin.cn/post/7218948376167366713",
  "https://juejin.cn/post/7218926523250835515",
  "https://juejin.cn/post/7218926048241860668",
  "https://juejin.cn/post/7218459472919199802",
  "https://juejin.cn/post/7218139468518391869",
  "https://juejin.cn/post/7217082537914646587",
  "https://juejin.cn/post/7217086166419062841",
  "https://juejin.cn/post/7216703870684856378",
  "https://juejin.cn/post/7216705712684154937",
  "https://juejin.cn/post/7216358562498478135",
  "https://juejin.cn/post/7216360818766364730",
  "https://juejin.cn/post/7215971680350027813",
  "https://juejin.cn/post/7215978971710849080",
  "https://juejin.cn/post/7215587423685705765",
  "https://juejin.cn/post/7215587423685672997",
  "https://juejin.cn/post/7215217068802687033",
  "https://juejin.cn/post/7215207897521127461",
  "https://juejin.cn/post/7214880895094046775",
  "https://juejin.cn/post/7214885024117686331",
  "https://juejin.cn/post/7214472421113069626",
  "https://juejin.cn/post/7214457498179272765",
  "https://juejin.cn/post/7214110277121720378",
  "https://juejin.cn/post/7214124426047914043",
  "https://juejin.cn/post/7213757571961684027",
  "https://juejin.cn/post/7213757571961651259",
  "https://juejin.cn/post/7213307113110945851",
  "https://juejin.cn/post/7213307113110782011",
  "https://juejin.cn/post/7213149830444449851",
  "https://juejin.cn/post/7212830775971561530",
  "https://juejin.cn/post/7212822448147611706",
  "https://juejin.cn/post/7212830775971495994",
  "https://juejin.cn/post/7209589093114380347",
  "https://juejin.cn/post/7208897614825340986",
  "https://juejin.cn/post/7208885488802791484",
  "https://juejin.cn/post/7208885488802086972",
  "https://juejin.cn/post/7208885488802070588",
  "https://juejin.cn/post/7208508980163166268",
  "https://juejin.cn/post/7205208559264055352",
  "https://juejin.cn/post/7204450037031878715",
  "https://juejin.cn/post/7204450037030928443",
  "https://juejin.cn/post/7204094247677640759",
  "https://juejin.cn/post/7202987088151887929",
  "https://juejin.cn/post/7202272345834192956",
  "https://juejin.cn/post/7201831630602764325",
  "https://juejin.cn/post/7201831345415520316",
  "https://juejin.cn/post/7201491839815712829",
  "https://juejin.cn/post/7201487543690641466",
  "https://juejin.cn/post/7201114708756381756",
  "https://juejin.cn/post/7201102450728042555",
  "https://juejin.cn/post/7199826518570565688",
  "https://juejin.cn/post/7195547185718165562",
  "https://juejin.cn/post/7195204142854307898",
  "https://juejin.cn/post/7195200368022650941",
  "https://juejin.cn/post/7194844545719205945",
  "https://juejin.cn/post/7194841820394684474",
  "https://juejin.cn/post/7194468381779558456",
  "https://juejin.cn/post/7194462355957219384",
  "https://juejin.cn/post/7193731398815973437",
  "https://juejin.cn/post/7191398648142364731",
  "https://juejin.cn/post/7189063385500090426",
];
const total = originArticleList.length;
const allArticle = shuffle(originArticleList);
// .filter((arr, i) => i === 0));
const randomNumber = random(100, allArticle.length - 1);

const filterArticle = allArticle.filter(
  (_, i) => i <= randomNumber
);

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

  // 启动一个Chrome浏览器实例
  const page = await browser.newPage(); // 创建一个新的标签页
  const len = filterArticle.length;
  const maxNumber = Number(process.argv[2])
    ? Number(process.argv[2])
    : 60;
  for (let i = 0; i < len; i++) {
    const time = random(1, maxNumber) * 1000;
    const url = filterArticle[i];
    await page.goto(url); // 导航到指定的网页
    await sleep(time);
    i && console.clear();    
		console.log(
      `总数${total} 本次刷新${len}篇，刷新间隔${
        time / 1000
      }秒，已完成${i + 1}篇`
    );
  }
  await browser.close(); // 关闭浏览器实例
})();

Math.random();
