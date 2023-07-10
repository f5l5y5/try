
const express = require("express");
const axios = require('axios')
const app = express();

app.get("/getList", (req, res) => {
	//   axios.get(
  //   "http://localhost:4000/getList"
	// 	).then((res1) => {
		
	// 		console.log('打印***res1',res1)
	// })
	res.json({
		data:1
	})
});
app.listen(3000);
