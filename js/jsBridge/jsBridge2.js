// eslint-disable-next-line consistent-return
function setupWebViewJavascriptBridge(callback) {
  // 已经注册了WebViewJavascriptBridge，就执行回调
  if (window.WebViewJavascriptBridge) {
    return callback(window.WebViewJavascriptBridge);
  }
  // WebViewJavascriptBridgeReady 事件是在 JsBridge 注册的
  document.addEventListener('WebViewJavascriptBridgeReady', () => {
    // WebView 加载完成后初始化 JsBridge
    // WebViewJavascriptBridge 也是在 JsBridge 定义的
    console.log('打印***111', 111);

    callback(window.WebViewJavascriptBridge);
  }, false);
  if (window.WVJBCallbacks) {
    return window.WVJBCallbacks.push(callback);
  }
  window.WVJBCallbacks = [callback];
  console.log('打印***window.WVJBCallbacks', window.WVJBCallbacks);
  // 创建一个iframe 设置不可见并将src设置为 https://__bridge_loaded__
  // 设置在下一次宏任务中移除这个 iframe
  // 这里创建 iframe 的目的是为了让 webview 拦截到这个请求并进行特定的操作。主要用于IOS的WKWebview
  const WVJBIframe = document.createElement('iframe');
  WVJBIframe.style.display = 'none';
  WVJBIframe.src = 'https://__BRIDGE_LOADED__';
  document.documentElement.appendChild(WVJBIframe);
  setTimeout(() => {
    document.documentElement.removeChild(WVJBIframe);
  }, 0);
}

// 初始化
setupWebViewJavascriptBridge((bridge) => {
  bridge.init((message, callback) => {
    callback(null);
  });
});
console.log('webview', window.WebViewJavascriptBridge);

export default {
  // js调APP方法 （参数分别为:app提供的方法名  传给app的数据  回调）
  callHandler(method, params, callback) {
    setupWebViewJavascriptBridge((bridge) => {
      bridge.callHandler(method, params, callback);
    });
  },

  // APP调js方法 （参数分别为:js提供的方法名  回调）
  registerHandler(method, callback) {
    setupWebViewJavascriptBridge((bridge) => {
      bridge.registerHandler(method, (data, responseCallback) => {
        callback(data, responseCallback);
      });
    });
  },
};
