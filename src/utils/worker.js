onmessage = function (e) {
	console.log("打印***接受主进程信息", e.data);
	console.time('worker')
	const handleData = e.data.map(item => {
		if (item.id !== 7) {
			return item
		}
		item.sex = 'man'
		item.pid = item.id
		item.key = item.id
		return item
	})
	console.timeEnd("worker");

	postMessage(handleData)
	close()
};
