const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/app') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'identity',
    });

    // 设置超时和无延迟选项，以保持长连接
    req.socket.setTimeout(0);
    req.socket.setNoDelay(true);
    req.socket.setKeepAlive(true);

    // 发送SSE消息
    setInterval(() => {
      const message = 'Hello, SSE!';
      res.write(`data: ${message}\n\n`);
    }, 1000);

  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
