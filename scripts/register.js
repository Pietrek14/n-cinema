const models = require("./database/models");
const mongoose = require("mongoose");

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

function registerUser(email, password) {
	const user = new models.users({
		email: email,
		password: password,
	});
	user.save((err, user) => {
		if (err) console.error(err);
		else console.log(`Zarejestrowano użytkownika: ${user.email}`);
	});
}

function registerCinema(name, movies, width, height) {
	const cinema = new models.cinemas({
		name: name,
		movies: movies,
		width: width,
		height: height,
	});
	cinema.save((err, cinema) => {
		if (err) console.error(err);
		else console.log(`Zarejestrowano kino: ${cinema.name}`);
	});
}

function registerSession(user_email) {
	const session = new models.sessions({
		user_email: user_email,
		birthday: Date.now(),
	});
	session.save((err, session) => {
		if (err) console.error(err);
		else console.log(`Zarejestrowano sesję: ${session._id}`);
	});

	return session._id;
}

module.exports = { registerUser, registerCinema, registerSession };
