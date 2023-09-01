const express = require('express');
const fs = require('fs');
const app = express();

/**
在Express框架中，`res.write()`是HTTP响应对象（`res`）的方法之一。它允许你向响应流中写入数据。

`res.write()`方法用于将数据写入响应体中，可以使用多次以写入多个片段的数据。这个方法主要用于向客户端实时发送数据，比如在处理长轮询（long-polling）或SSE(Server-Sent Events)等实时通信的请求时。

以下是一个在Express中使用`res.write()`的简单示例：

```javascript
app.get('/stream', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  setInterval(() => {
    res.write('Data from the server\n');
  }, 1000);
});
```

在上述示例中，当收到`/stream`的GET请求时，服务器向客户端发送连续的文本数据。通过调用`res.write()`方法，服务器每隔1秒向响应流中写入一条消息。

需要注意的是，在使用`res.write()`方法写入数据后，通常还需要调用`res.end()`方法来标志响应结束，以便通知客户端响应已完成。否则，客户端可能会一直等待响应的结束。

需要注意的是，在使用`res.write()`方法写入数据后，通常还需要调用`res.end()`方法来标志响应结束，以便通知客户端响应已完成。否则，客户端可能会一直等待响应的结束。

请注意，`res.write()`方法必须在响应头被发送之前调用。如果在发送响应头后调用`res.write()`，将会抛出错误。因此，通常将`res.write()`方法放在`res

 */

app.get('/api/sse', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream', //核心返回数据流
        'Connection': 'close',
        'Access-Control-Allow-Origin': '*',
    })
    const data = fs.readFileSync('./a.txt', 'utf8')
    const total = data.length;
    console.log('打印***total',total)
    let current = 0;
    //mock sse 数据
    let time = setInterval(() => {
        console.log(current, total)
        if (current >= total) {
            console.log('end')
            clearInterval(time)
            return
        }
        //返回自定义事件名
        res.write(`id:${1}\n`)// 自定义id
        res.write(`event:lol\n`)// 不能使用onmessage接受数据，通过addEventListener接受数据
        // 返回数据
        res.write(`data:${data.split('')[current]}\n\n`)
        current++
    }, 300)
})
app.listen(3000, () => {
    console.log('Listening on port 3000');
});

