import hash from "../../scripts/hash.js";

const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#login-button");
const logoutButton = document.querySelector("#logout-button");
const log = document.querySelector("#log");

const cinemaSelect = document.querySelector("#cinema");
const movieSelect = document.querySelector("#movie");
const hourSelect = document.querySelector("#hour");

const seats = document.querySelector("#seats");
const price = document.querySelector("#price");

const submitButton = document.querySelector("#submit");

const alertBox = document.querySelector("#alert");
const alertBoxClose = document.querySelector("#alert-close");

const login = document.querySelector("#login");
const buy = document.querySelector("#buy");
const result = document.querySelector("#result");

const TICKET_PRICE = 10;

let session;
let chosenSeats = [];

function alert(text) {
	alertBox.innerHTML = text;
	alertBox.appendChild(alertBoxClose);
	alertBox.classList.remove("d-none");
}

alertBoxClose.onclick = (e) => {
	alertBox.innerHTML = "";
	alertBox.appendChild(alertBoxClose);
	alertBox.classList.add("d-none");
};

const cinemaInfo = await (
	await fetch("http://localhost:3000/cinemainfo", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
).json();

function logIn(session_id) {
	session = session_id;
	login.classList.add("d-none");
	buy.classList.remove("d-none");
	result.classList.add("d-none");
	log.innerText = `Zalogowano jako: ${emailInput.value}`;
	passwordInput.value = "";
}

function logOut() {
	session = undefined;
	login.classList.remove("d-none");
	buy.classList.add("d-none");
	result.classList.add("d-none");
}

loginButton.onclick = async (e) => {
	e.preventDefault();

	if (emailInput.value.length === 0) {
		alert("Email nie może być pusty.");
		return;
	}

	if (passwordInput.value.length === 0) {
		alert("Hasło nie może być puste.");
		return;
	}

	if (
		!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/.test(
			passwordInput.value
		)
	) {
		alert(
			"Hasło musi składać się z przynajmniej ośmiu znaków, zawierać przynajmniej jedną wielką literę oraz cyfrę."
		);
		return;
	}

	const res = await fetch("http://localhost:3000/login", {
		method: "POST",
		body: JSON.stringify({
			email: emailInput.value,
			password: hash(passwordInput.value),
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});

	const body = await res.json();

	if (res.status == 200) {
		logIn(body.session_id);
	} else {
		alert(body.message);
	}
};

logoutButton.onclick = async (e) => {
	e.preventDefault();

	logOut();

	await fetch("http://localhost:3000/logout", {
		method: "POST",
		body: JSON.stringify({
			session: session,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});
};

const isEqual = (first, second) => {
	return JSON.stringify(first) === JSON.stringify(second);
};

cinemaInfo.forEach((cinema, index) => {
	const option = document.createElement("option");

	option.value = index;
	option.innerText = cinema.name;

	cinemaSelect.appendChild(option);
});

cinemaSelect.onchange = (e) => {
	movieSelect.innerHTML = '<option value="" disabled selected>Film...</option>';
	hourSelect.innerHTML =
		'<option value="" disabled selected>Godzina...</option>';
	seats.innerHTML = "";

	for (let i = 0; i < cinemaInfo[cinemaSelect.value].height; i++) {
		const row = document.createElement("tr");
		const rowHeader = document.createElement("th");
		rowHeader.innerText = `Rząd ${i + 1}`;
		rowHeader.classList.add("d-none");
		rowHeader.classList.add("d-md-inline");

		row.appendChild(rowHeader);

		for (let j = 0; j < cinemaInfo[cinemaSelect.value].width; j++) {
			const seat = document.createElement("td");

			seat.classList.add("seat");
			seat.innerHTML = `<div class="seat-num"><p>${j + 1}</p></div>`;

			seat.onclick = (e) => {
				const chosen = chosenSeats.some((e) => isEqual(e, [i, j]));

				if (chosen) {
					seat.style.backgroundColor = "";

					chosenSeats = chosenSeats.filter((value, index, arr) => {
						return !isEqual(value, [i, j]);
					});
				} else {
					seat.style.backgroundColor = "red";

					chosenSeats.push([i, j]);
				}

				if (chosenSeats.length > 0) {
					submitButton.innerText = `Zatwierdź (${
						chosenSeats.length * TICKET_PRICE
					}zł)`;
				} else {
					submitButton.innerText = "Zatwierdź";
				}
			};

			row.appendChild(seat);
		}

		seats.appendChild(row);
	}

	cinemaInfo[cinemaSelect.value].movies.forEach((movie, index) => {
		const option = document.createElement("option");

		option.value = index;
		option.innerText = movie.name;

		movieSelect.appendChild(option);
	});

	submitButton.classList.add("d-none");
};

movieSelect.onchange = (e) => {
	hourSelect.innerHTML =
		'<option value="" disabled selected>Godzina...</option>';

	cinemaInfo[cinemaSelect.value].movies[movieSelect.value].hours.forEach(
		(hour, index) => {
			const option = document.createElement("option");

			option.value = index;
			option.innerText = hour.hour;

			hourSelect.appendChild(option);
		}
	);

	submitButton.classList.add("d-none");
};

hourSelect.onchange = () => {
	submitButton.classList.remove("d-none");
};

submitButton.onclick = async () => {
	if (session === undefined) {
		alert("Nie jesteś zalogowany!");
		return;
	}

	const cinema = cinemaInfo[cinemaSelect.value];
	const movie = cinema.movies[movieSelect.value];
	const hour = movie.hours[hourSelect.value];

	const res = await fetch("http://localhost:3000/buy", {
		method: "POST",
		body: JSON.stringify({
			session: session,
			seats: chosenSeats,
			cinema: cinema,
			movie: movie,
			hour: hour,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});

	const data = await res.json();

	if (res.status === 200) {
		buy.classList.add("d-none");
		const paragraph = document.createElement("p");
		paragraph.innerHTML = data.message;
		result.appendChild(paragraph);
		const goBackButton = document.createElement("button");
		goBackButton.classList.add("go-back-button");
		goBackButton.innerText = "Wróć na stronę główną";
		goBackButton.onclick = (e) => {
			window.location.href = "../index.html";
		};
		result.appendChild(goBackButton);
		result.classList.remove("d-none");
	} else {
		alert(data.message);
	}
};
