const mongoose = require("mongoose");
const models = require("./models");
const { registerUser, registerCinema } = require("../register");
const hash = require("../node_hash");

mongoose.connect(
	"mongodb+srv://dawid:admin@cluster0.zvcpu.mongodb.net/kino?retryWrites=true&w=majority",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	(err) => {
		if (err) console.error(err);
		else console.log("pog");
	}
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	// registerCinema(
	// 	"Kraków",
	// 	[
	// 		{
	// 			name: "Auta 2",
	// 			hours: [
	// 				{ hour: "12.30", type: "DUBBING PL", dimension: "2D" },
	// 				{ hour: "15.00", type: "DUBBING PL", dimension: "3D" },
	// 			],
	// 		},
	// 		{
	// 			name: "Auta",
	// 			hours: [
	// 				{ hour: "11.00", type: "DUBBING PL", dimension: "2D" },
	// 				{ hour: "13.30", type: "DUBBING PL", dimension: "3D" },
	// 			],
	// 		},
	// 	],
	// 	10,
	// 	3
	// );
});
