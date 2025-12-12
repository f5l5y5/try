import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { MarkdownParser } from './lib/markdown-parser.js';
import { JuejinPublisher } from './lib/juejin-publisher.js';
import { WechatPublisher } from './lib/wechat-publisher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 读取配置文件
 */
function loadConfig() {
  const configPath = path.join(__dirname, 'config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('配置文件不存在: config.json');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * 读取同步历史
 */
function loadHistory() {
  const historyPath = path.join(__dirname, 'sync-history.json');
  if (!fs.existsSync(historyPath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
}

/**
 * 保存同步历史
 */
function saveHistory(history) {
  const historyPath = path.join(__dirname, 'sync-history.json');
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');
}

/**
 * 命令行输入
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * 提示用户输入
 */
function question(rl, query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('======================================');
  console.log('  Obsidian 文章同步工具');
  console.log('  支持平台: 掘金、微信公众号');
  console.log('======================================\n');

  const config = loadConfig();
  const rl = createReadlineInterface();

  try {
    // 1. 选择要同步的文章
    const articlePath = await question(
      rl,
      `请输入 Markdown 文章的完整路径:\n（默认目录: ${config.obsidianDir}）\n> `
    );

    if (!articlePath) {
      console.error('错误: 未提供文章路径');
      rl.close();
      return;
    }

    // 解析文件路径（支持相对路径和绝对路径）
    const fullPath = path.isAbsolute(articlePath)
      ? articlePath
      : path.join(config.obsidianDir, articlePath);

    if (!fs.existsSync(fullPath)) {
      console.error(`错误: 文件不存在: ${fullPath}`);
      rl.close();
      return;
    }

    // 2. 解析文章
    console.log('\n正在解析文章...');
    const article = MarkdownParser.parse(fullPath);
    console.log(`标题: ${article.title}`);
    console.log(`本地图片数量: ${article.images.length}`);

    // 3. 选择发布平台
    const platformChoice = await question(
      rl,
      '\n请选择发布平台:\n1. 掘金\n2. 微信公众号\n3. 掘金 + 微信公众号\n> '
    );

    const publishToJuejin = platformChoice === '1' || platformChoice === '3';
    const publishToWechat = platformChoice === '2' || platformChoice === '3';

    if (!publishToJuejin && !publishToWechat) {
      console.error('错误: 无效的平台选择');
      rl.close();
      return;
    }

    // 4. 确认发布
    const confirm = await question(rl, '\n确认发布？(y/n) > ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('已取消发布');
      rl.close();
      return;
    }

    rl.close();

    // 5. 发布到掘金
    if (publishToJuejin && config.platforms.juejin.enabled) {
      console.log('\n========== 掘金发布 ==========');
      const juejinPublisher = new JuejinPublisher(config.platforms.juejin, config.browser);
      await juejinPublisher.init();

      try {
        await juejinPublisher.publish(article);
        console.log('\n掘金发布流程完成');
      } catch (error) {
        console.error('掘金发布失败:', error.message);
      } finally {
        await juejinPublisher.close();
      }
    }

    // 6. 发布到微信公众号
    if (publishToWechat && config.platforms.wechat.enabled) {
      console.log('\n========== 微信公众号发布 ==========');
      const wechatPublisher = new WechatPublisher(config.platforms.wechat, config.browser);
      await wechatPublisher.init();

      try {
        await wechatPublisher.publish(article);
        console.log('\n微信公众号发布流程完成');
      } catch (error) {
        console.error('微信公众号发布失败:', error.message);
      } finally {
        await wechatPublisher.close();
      }
    }

    // 7. 记录同步历史
    const history = loadHistory();
    history.push({
      filePath: fullPath,
      title: article.title,
      platforms: {
        juejin: publishToJuejin,
        wechat: publishToWechat
      },
      timestamp: new Date().toISOString()
    });
    saveHistory(history);

    console.log('\n========== 同步完成 ==========');
    console.log('已记录到同步历史');

  } catch (error) {
    console.error('\n发生错误:', error.message);
    console.error(error.stack);
  } finally {
    rl.close();
  }
}

// 运行主函数
main().catch((error) => {
  console.error('程序异常:', error);
  process.exit(1);
});
