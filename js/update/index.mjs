import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
// 获取所有的script标签
const allScriptTags =
  document.getElementsByTagName("script");

let appHash = "";

// 遍历script标签集合
for (let i = 0; i < allScriptTags.length; i++) {
  // 获取当前script标签的src属性
  const src = allScriptTags[i].getAttribute("src");

  // 判断是否存在src属性
  if (src.indexOf("app") !== -1) {
    appHash = src;
    break;
  }
}
console.log("打印***appHash", appHash);

if (appHash) {
	Modal.confirm({
		title: "Do you want to delete these items?",
		icon: createVNode(ExclamationCircleOutlined),
		content:
			"页面已更新，请刷新页面！",
		onOk() {
			location.reload()
		},
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		onCancel() {},
	});
}
