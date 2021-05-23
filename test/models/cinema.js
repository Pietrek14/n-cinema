const mongoose = require("mongoose");

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

module.exports = mongoose.model("cinema", CinemaSchema);
