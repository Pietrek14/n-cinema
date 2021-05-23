const cinemaSelect = document.querySelector("#cinema-select");
const result = document.querySelector("#result");

const cinemaInfo = await (
	await fetch("http://localhost:3000/cinemainfo", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
).json();

for (let i = 0; i < cinemaInfo.length; i++) {
	const option = document.createElement("option");
	option.value = i;
	option.innerText = cinemaInfo[i].name;
	cinemaSelect.appendChild(option);
}

cinemaSelect.onchange = (e) => {
	const cinema = cinemaInfo[cinemaSelect.value];
	result.innerHTML = "";
	cinema.movies.forEach((movie) => {
		const span = document.createElement("span");
		span.innerText = `${movie.name}: `;
		const hours = [];
		movie.hours.forEach((hour) => {
			hours.push(`${hour.hour} ${hour.dimension} ${hour.type}`);
		});
		span.innerText += hours.join(" | ");
		result.appendChild(span);
	});
	result.classList.remove("d-none");
};
