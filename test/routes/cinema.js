const express = require("express");
const cinema = require("../models/cinema.js");

const router = express.Router();

// /cinema
router.get("/", async (req, res) => {
	try {
		const cinemas = await cinema.find();
		res.status(200).json(cinemas);
	} catch (err) {
		res.status(500).json({
			message: "Internal server error",
		});
	}
});

module.exports = router;
