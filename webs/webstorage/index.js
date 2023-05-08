const express = require("express");
const cors = require('express-cors')
const app = express();

app.use(cors)

app.get("/cache", (req, res) => {
	res.header['Access-Control-Allow-Origin' ]='*'
	return res.json(
		{
			code: 1,
			msg:'666'
		}
	);
});

app.listen(3000, () => console.log("> Ready to keylog at localhost:3000")); 