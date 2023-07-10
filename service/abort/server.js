
const express = require("express");
const app = express();

app.get("/getList", async (req, res) => {
	console.log('打印***req',req)
  res.json({
    data: 1,
  });
});
app.listen(4000, () => {
  console.log("http://localhost:4000");
});
