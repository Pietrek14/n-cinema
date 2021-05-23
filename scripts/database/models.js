const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
	email: String,
	password: String,
});

const HourSchema = new mongoose.Schema({
	hour: String,
	type: String,
	dimension: String,
});

const MovieSchema = new mongoose.Schema({
	name: String,
	hours: [HourSchema],
});

const CinemaSchema = new mongoose.Schema({
	name: String,
	movies: [MovieSchema],
	width: Number,
	height: Number,
});

const sessionsSchema = new mongoose.Schema({
	user_email: String,
	birthdate: { type: Date, default: Date.now },
});

const users = mongoose.model("users", usersSchema);
const cinemas = mongoose.model("cinemas", CinemaSchema);
const sessions = mongoose.model("sessions", sessionsSchema);

module.exports = { users, cinemas, sessions };
