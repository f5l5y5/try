// // 1. `'import process from 'node:process;`: 这个导入语句将`process`对象从Node.js的内置模块`process`中导入到当前的模块中。`process`模块提供了对进程的信息和控制的功能，比如获取命令行参数、设置环境变量等。

// import process from 'node:process'
// console.log(process.pid); // 输出当前进程的PID
// console.log(process.cwd()); // 输出当前工作目录的路径

// // 2. `import {spawn} from 'node:child_process';`: 这个导入语句从Node.js的内置模块`child_process`中导入了`spawn`函数。`spawn`函数用于创建子进程并执行外部命令。


// import { spawn } from 'child_process';
// import iconv from 'iconv-lite';

// const ls = spawn('cmd.exe', ['/c', 'dir']);

// // 监听子进程的标准输出
// ls.stdout.on('data', (data) => {
//   const output = iconv.decode(data, 'gbk');
//   console.log(`stdout: ${output}`);
// });

// // 监听子进程的标准错误输出
// ls.stderr.on('data', (data) => {
//   const output = iconv.decode(data, 'gbk');
//   console.error(`stderr: ${output}`);
// });

// // 监听子进程的关闭事件
// ls.on('close', (code) => {
//   console.log(`子进程退出，退出码 ${code}`);
// });


// // 3. `import {fileURLToPath} from 'node:url';`: 这个导入语句从Node.js的内置模块`url`中导入了`fileURLToPath`函数。`fileURLToPath`函数用于将文件的URL转换为文件路径。

// import {fileURLToPath} from 'url';

// const fileURL = new URL('file://path/to/file.txt');
// const filePath = fileURLToPath(fileURL);

// console.log(filePath); // 输出: /path/to/file.txt

// // 4. `import path from 'node:path';`: 这个导入语句从Node.js的内置模块`path`中导入了`path`对象。`path`模块提供了处理文件路径的实用函数。

// import path from 'path';

// const absolutePath = path.resolve('/foo', 'bar', 'baz');
// console.log(absolutePath); // 输出: /foo/bar/baz

// const filename = path.basename('/path/to/file.txt');
// console.log(filename); // 输出


// // 5. `import {format} from 'node:util';`: 这个导入语句从Node.js的内置模块`util`中导入了`format`函数。`format`函数用于按照指定的格式字符串将参数格式化为字符串。

// import {format} from 'util';

// const greeting = format('Hello %s!', 'World');
// console.log(greeting); // 输出: Hello World!

// // 6. `import ConfigStore from 'configstore';`: 这个导入语句从第三方模块`configstore`中导入了`ConfigStore`类。`ConfigStore`用于在本地存储和获取配置数据。

// import ConfigStore from 'configstore';

// const config = new ConfigStore('my-app');

// config.set('username', 'john');
// console.log(config.get('username')); // 输出: john

// // 7. `import chalk from 'chalk';`: 这个导入语句从第三方模块`chalk`中导入了`chalk`对象。`chalk`模块提供了在终端中输出带有颜色和样式的文本的功能。

// import chalk from 'chalk';

// console.log(chalk.red('Error!'));
// console.log(chalk.yellow('Warning!'));
// console.log(chalk.green.bold('Success!'));

// // 8. `import semver from 'semver';`: 这个导入语句从第三方模块`semver`中导入了`semver`对象。`semver`模块提供了对语义化版本的解析和比较的功能。

// import semver from 'semver';

// console.log(semver.valid('1.2.3')); // 输出: 1.2.3
// console.log(semver.gt('1.2.3', '1.1.0')); // 输出: true

// // 9. `import semverDiff from 'semver-diff';`: 这个导入语句从第三方模块`semver-diff`中导入了`semverDiff`函数。`semverDiff`函数用于计算两个版本之间的差异。

// import semverDiff from 'semver-diff';

// console.log('打印***patch',semverDiff('1.0.1', '1.0.2'))
// console.log('打印***minor',semverDiff('1.0.1', '1.1.2'))
// console.log('打印***major',semverDiff('1.0.1', '2.1.2'))

// // 10. `import latestVersion from 'latest-version';`: 这个导入语句从第三方模块`latest-version`中导入了`latestVersion`函数。`latestVersion`函数用于获取指定包名的最新版本号。


// import latestVersion from 'latest-version';

// latestVersion('lodash').then((version) => {
//   console.log(`最新版本号: ${version}`);
// }).catch((error) => {
//   console.error(error);
// });

// // 11. `import {isNpmOrYarn} from 'is-npm';`: 这个导入语句从第三方模块`is-npm`中导入了`isNpmOrYarn`函数。`isNpmOrYarn`函数用于判断当前项目是使用NPM还是Yarn进行包管理。


// import {isNpmOrYarn,isNpm,isYarn} from 'is-npm';
// console.log('打印***isNpmOrYarn,isNpm,isYarn',isNpmOrYarn,isNpm,isYarn)
// if (isNpmOrYarn) {
//   console.log('当前项目使用NPM或Yarn进行包管理');
// } else {
//   console.log('当前项目不使用NPM或Yarn进行包管理');
// }

// // 12. `import isInstalledGlobally from 'is-installed-globally';`: 这个导入语句从第三方模块`is-installed-globally`中导入了`isInstalledGlobally`函数。`isInstalledGlobally`函数用于判断当前模块是否全局安装。


// import isInstalledGlobally from 'is-installed-globally';

// if (isInstalledGlobally) {
//   console.log('当前模块是全局安装的');
// } else {
//   console.log('当前模块不是全局安装的');
// }

// // 13. `import isYarnGlobal from 'is-yarn-global';`: 这个导入语句从第三方模块`is-yarn-global`中导入了`isYarnGlobal`函数。`isYarnGlobal`函数用于判断当前项目是否全局安装的

// import isYarnGlobal from 'is-yarn-global';

// if (isYarnGlobal()) {
//   console.log('当前项目是使用Yarn进行全局安装的');
// } else {
//   console.log('当前项目不是使用Yarn进行全局安装的');
// }

// // 14. `import hasYarn from 'has-yarn';`: 这个导入语句从第三方模块`has-yarn`中导入了`hasYarn`函数。`hasYarn`函数用于判断当前项目是否使用Yarn进行包管理。

// import hasYarn from 'has-yarn';

// if (hasYarn()) {
//   console.log('当前项目使用Yarn进行包管理');
// } else {
//   console.log('当前项目不使用Yarn进行包管理');
// }

// // 15. `import boxen from 'boxen';`: 这个导入语句从第三方模块`boxen`中导入了`boxen`函数。`boxen`函数用于在终端中创建带有边框的框。

// import boxen from 'boxen';

// const text = 'Hello, World!';
// const box = boxen(text, {padding: 1, borderColor: 'green'});

// console.log(box);

// // 16. `import {xdgConfig} from 'xdg-basedir';`: 这个导入语句从第三方模块`xdg-basedir`中导入了`xdgConfig`对象。`xdgConfig`对象包含了一些标准的XDG配置目录的路径。

// import {xdgConfig} from 'xdg-basedir';

// console.log(xdgConfig); // 输出: C:\Users\admin\.config

// // 17. `import isCi from 'is-ci';`: 这个导入语句从第三方模块`is-ci`中导入了`isCi`函数。`isCi`函数用于判断当前代码是否在CI/CD环境中运行。

// import isCi from 'is-ci';

// if (isCi) {
//   console.log('当前代码在CI/CD环境中运行');
// } else {
//   console.log('当前代码不在CI/CD环境中运行');
// }

// // 18. `import pupa from 'pupa';`: 这个导入语句从第三方模块`pupa`中导入了`pupa`函数。`pupa`函数用于将模板字符串中的占位符替换为对应的值。


import pupa from 'pupa';

const template = 'Hello, {name}!';
const result = pupa(template, { name: 'John' });

console.log(result);
