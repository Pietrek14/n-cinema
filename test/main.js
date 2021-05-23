const express = require("express");
const mongoose = require("mongoose");
const cinemaRoute = require("./routes/cinema.js");

const app = express();

mongoose.connect(
	"mongodb+srv://dawid:admin@cluster0.zvcpu.mongodb.net/kino?retryWrites=true&w=majority",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);

app.use(express.json());

app.use("/cinema", cinemaRoute);

app.listen(3000);
