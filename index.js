const GOLAS = "SEX";

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const models = require("./scripts/database/models");
const hash = require("./scripts/node_hash");
const {
	registerUser,
	registerCinema,
	registerSession,
} = require("./scripts/register");

const SESSION_LIFETIME = 10 * 60 * 1000;
const SESSION_CLEAR_INTERVAL = 60 * 60 * 1000;

const TICKET_PRICE = 10;

const app = express();

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

app.use(express.json());
app.use(cors());

function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
	return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/.test(password);
}

// ------------------------------------------------------------

app.post("/login", async (req, res) => {
	const user = (await models.users.find({ email: req.body.email }).exec())[0];

	if (!user) {
		if (req.body.email === "GOLAS") {
			console.log(GOLAS);
		}

		res
			.status(401)
			.send(
				JSON.stringify({ message: "Użytkownik o podanym emailu nie istnieje!" })
			);
		return;
	}

	if (user.password == req.body.password) {
		console.log(`${user.email} się zalogował`);

		const sessionId = registerSession(user.email);

		setTimeout(async () => {
			await models.sessions.deleteOne({ _id: sessionId }).exec();
			console.log(`Wygaszono sesję: ${sessionId}`);
		}, SESSION_LIFETIME);

		res.status(200).send(
			JSON.stringify({
				message: `Zalogowano na mailu ${user.email}`,
				session_id: sessionId,
			})
		);
	} else {
		res.status(401).send(JSON.stringify({ message: "Błędne hasło!" }));
	}
});

app.post("/logout", async (req, res) => {
	await models.sessions.deleteOne({ _id: req.body.session }).exec();
});

app.post("/register", async (req, res) => {
	if (req.body.email.length === 0) {
		res
			.status(400)
			.send(JSON.stringify({ message: "Email nie może być pusty!" }));
		return;
	}

	if (!validateEmail(req.body.email)) {
		res
			.status(400)
			.send(JSON.stringify({ message: "Podano niepoprawny email!" }));
		return;
	}

	const query = await models.users.find({ email: req.body.email });

	if (query.length !== 0) {
		res
			.status(400)
			.send(
				JSON.stringify({ message: "Istnieje już konto z tym adresem email." })
			);
		return;
	}

	if (req.body.password === 0) {
		res
			.status(400)
			.send(JSON.stringify({ message: "Hasło nie może być puste." }));
		return;
	}

	registerUser(req.body.email, req.body.password);
	res.status(200).send(
		JSON.stringify({
			message: "Zarejestrowano pomyślnie.",
		})
	);

	console.log(`Zarejestrowano: ${req.body.email}`);
});

// clear old sessions
setInterval(async () => {
	const time = new Date(Date.now() - SESSION_LIFETIME);

	await models.sessions
		.deleteMany({
			birthdate: { $lt: time },
		})
		.exec();

	console.log("Cleared old sessions");
}, SESSION_CLEAR_INTERVAL);

app.get("/cinemainfo", async (req, res) => {
	try {
		const cinemaInfo = await models.cinemas.find();
		res.status(200).json(cinemaInfo);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "oh shit",
		});
	}
});

app.post("/buy", async (req, res) => {
	const session = await models.sessions.findById(req.body.session).exec();

	if (!session) {
		res.status(400).send(JSON.stringify({ message: "Twoja sesja wygasła." }));
		return;
	}

	if (session.birthdate < Date.now() - SESSION_LIFETIME) {
		res.status(400).send(JSON.stringify({ message: "Twoja sesja wygasła." }));
		await models.sessions.deleteOne({ _id: req.body.session }).exec();
		return;
	}

	if (req.body.seats.length === 0) {
		res
			.status(400)
			.send(JSON.stringify({ message: "Nie wybrano żadnych miejsc." }));
		return;
	}

	if (!req.body.cinema) {
		res.status(400).send(JSON.stringify({ message: "Nie wybrano kina." }));
		return;
	}

	if (!req.body.movie) {
		res.status(400).send(JSON.stringify({ message: "Nie wybrano filmu." }));
		return;
	}

	if (!req.body.hour) {
		res.status(400).send(JSON.stringify({ message: "Nie wybrano godziny." }));
		return;
	}

	let seatsString = "";

	req.body.seats.forEach((seat) => {
		seatsString += `Rząd ${seat[0] + 1}, Miejsce ${seat[1] + 1}<br>`;
	});

	res.status(200).send(
		JSON.stringify({
			message: `Liczba biletów: ${req.body.seats.length}<br>
			Film: ${req.body.movie.name}<br>
			Kino: ${req.body.cinema.name}<br>
			Godzina: ${req.body.hour.hour}<br>
			Cena: ${req.body.seats.length * TICKET_PRICE} zł<br>
			Miejsca: <br>${seatsString}`,
		})
	);
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	app.listen(3000, () => {
		console.log("strona dziala");
	});
});
