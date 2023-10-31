const { userAgent } = navigator;
const isAndroid = userAgent.indexOf("android") > -1; // android终端
// const isIOS = !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // ios终端

// 与原生安卓交互
const androidFn = (callback) => {
  if (window.WebViewJavascriptBridge) {
    callback(window.WebViewJavascriptBridge);
  } else {
    document.addEventListener(
      "WebViewJavascriptBridge",
      () => {
        callback(window.WebViewJavascriptBridge);
      },
      false
    );
  }
  if (window.WebViewJavascriptBridge) {
    return callback(window.WebViewJavascriptBridge);
  }
  if (window.WVJBCallbacks) {
    return window.WVJBCallbacks.push(callback);
  }
  window.WVJBCallbacks = [callback];
};

const iosFn = (callback) => {
  if (window.WebViewJavascriptBridge) {
    return callback(window.WebViewJavascriptBridge);
  }
  if (window.WVJBCallbacks) {
    return window.WVJBCallbacks.push(callback);
  }
  window.WVJBCallbacks = [callback];
  const WVJBIframe = document.createElement("iframe");
  WVJBIframe.style.display = "none";
  WVJBIframe.src = "https://__BRIDGE_LOADED__";
  document.documentElement.appendChild(WVJBIframe);
  setTimeout(() => {
    document.documentElement.removeChild(WVJBIframe);
  }, 0);
  return null;
};

const setupWebViewJavascriptBridge = isAndroid
  ? androidFn
  : iosFn;

// 不能初始化两次
if (isAndroid) {
  console.log("init");
  setupWebViewJavascriptBridge((bridge) => {
    console.log("打印***enter");
    bridge.init((message, responseCallback) => {
      console.log("打印***message");
      if (responseCallback) {
        responseCallback("JS 初始化成功");
      }
    });
  });
  console.log("webview", window.WebViewJavascriptBridge);
}

export default {
  // js调APP方法 （参数分别为:app提供的方法名  传给app的数据  回调）
  callHandler(name, params, callback) {
    setupWebViewJavascriptBridge((bridge) => {
      bridge.callHandler(name, params, callback);
    });
  },

  // APP调js方法 （参数分别为:js提供的方法名  回调）
  registerHandler(name, callback) {
    setupWebViewJavascriptBridge((bridge) => {
      bridge.registerHandler(
        name,
        (data, responseCallback) => {
          callback(data, responseCallback);
        }
      );
    });
  },
};

/*

jsBridge.registerHandler(
  "getInfo",
  (data, responseCallback) => {
    console.log("打印***get app data", data);
    responseCallback("我是返回的数据");
  }
);
const message = {
  data: "h5 send",
};
const url = `/sendMsg/${encodeURIComponent(
  JSON.stringify(message)
)}`;
window.location.href = url;

jsBridge.callHandler(
  "getAppUserInfo",
  { title: "首页" },
  (data) => {
    console.log("打印***created", data);
  }
);

*/