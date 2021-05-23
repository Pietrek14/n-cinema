import hash from "../../scripts/hash.js";

const registerForm = document.querySelector("#register-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const registerButton = document.querySelector("#register-button");

const result = document.querySelector("#result");

const alertBox = document.querySelector("#alert");
const alertBoxClose = document.querySelector("#alert-close");

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

function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

registerButton.onclick = async (e) => {
	e.preventDefault();

	if (emailInput.value.length === 0) {
		alert("Email nie może być pusty.");
		return;
	}

	if (!validateEmail(emailInput.value)) {
		alert("Podano niepoprawny email!");
		return;
	}

	if (passwordInput.value.length === 0) {
		alert("Hasło nie może być puste.");
		return;
	}

	if (passwordInput.value.length < 8) {
		alert("Hasło musi mieć przynajmniej 8 znaków.");
		return;
	}

	if (
		!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/.test(
			passwordInput.value
		)
	) {
		alert("Hasło musi zawierać przynajmniej jedną wielką literę oraz cyfrę.");
		return;
	}

	const res = await fetch("http://localhost:3000/register", {
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
		result.innerText = body.message;
		registerForm.classList.add("d-none");
		result.classList.remove("d-none");
	} else {
		alert(body.message);
	}

	console.log(body);
};
