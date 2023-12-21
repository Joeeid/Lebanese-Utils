import { format, parse } from "date-fns";
import axios from "axios";
import cheerio from "cheerio";

const USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";

async function isHoliday(date) {
	// If the parameter is a string, attempt to parse it as a date
	const parsedDate =
		typeof date === "string" ? parse(date, "dd-MM-yyyy", new Date()) : date;

	if (isNaN(parsedDate.getTime())) {
		throw new Error("Invalid date format!");
	}

	const formattedDate = format(parsedDate, "dd-MM-yyyy");
	try {
		const publicHolidays = await getHolidays(parsedDate.getFullYear());
		return publicHolidays.some((holiday) => holiday.date === formattedDate);
	} catch (error) {
		throw new Error(error.message);
	}
}

async function getHolidaysNumber(year) {
	try {
		return (await getHolidays(year)).length;
	} catch (error) {
		throw new Error(error.message);
	}
}

async function getHolidays(year) {
	const publicHolidays = [];
	try {
		const url = "https://www.officeholidays.com/countries/lebanon/" + year;
		const ROW_SELECTOR =
			"#wrapper > div:nth-child(6) > div.twelve.columns > table.country-table > tbody > tr";

		// Downloading the target web page
		// by performing an HTTP GET request in Axios
		const axiosResponse = await axios.request({
			method: "GET",
			url: url,
			headers: {
				"User-Agent": USER_AGENT,
			},
		});

		// Parsing the HTML source of the target web page with Cheerio
		const $ = cheerio.load(axiosResponse.data);

		// Extracting the holiday name and date
		$(ROW_SELECTOR).each((index, element) => {
			const name = $(element).find("td:nth-child(3) > a").text();
			var date = $(element).find("td:nth-child(2) > time").attr("datetime"); // different date format: yyyy-MM-dd

			if (name && date) {
				const formattedDate = format(
					parse(date, "yyyy-MM-dd", new Date()),
					"dd-MM-yyyy"
				);

				const holiday = { name: name, date: formattedDate };
				publicHolidays.push(holiday);
			}
		});
		return publicHolidays;
	} catch (error) {
		console.error(`Error fetching holidays: ${error.message}`);
		if (error.response?.status === 404) {
			throw new Error(`Data for year ${year} not available.`);
		} else {
			throw new Error("Unable to fetch holidays");
		}
	}
}

async function getMarketRate() {
	try {
		const url = "https://www.lira-rate.com/";
		const MARKET_RATE_SELECTOR =
			"#page > div.content-wrapper.backColor > div > div > div > div > div > div.alert.alert-primary > div > p > strong:nth-child(3)";

		// Downloading the target web page
		// by performing an HTTP GET request in Axios
		const axiosResponse = await axios.request({
			method: "GET",
			url: url,
			headers: {
				"User-Agent": USER_AGENT,
			},
		});

		// Parsing the HTML source of the target web page with Cheerio
		const $ = cheerio.load(axiosResponse.data);

		// Selecting the right rate text
		const marketprice = $(MARKET_RATE_SELECTOR).text();

		return marketprice.replace(/[^0-9]/g, "");
	} catch (error) {
		console.error(`Error fetching market rate: ${error.message}`);
		throw new Error("Unable to fetch market rate");
	}
}

async function convertToUSD(amount) {
	if (isNaN(amount)) {
		throw new Error("Invalid number!");
	}
	const rate = await getMarketRate();
	return amount / rate;
}

async function convertToLBP(amount) {
	if (isNaN(amount)) {
		throw new Error("Invalid number!");
	}
	const rate = await getMarketRate();
	return amount * rate;
}

function getAreaCode(number) {
	if (!/^\d+$/.test(number)) {
		throw new Error("Invalid input! Only numbers allowed");
	}
	if (number.length !== 8) {
		throw new Error(
			"Invalid number format! The number should be 8 characters long."
		);
	}
	var areaCode;
	var mainCode = number.substring(0, 2);
	var secondaryCode = number.substring(2, 3);

	switch (mainCode) {
		case "01":
			areaCode = "Beirut";
			break;
		case "02":
			areaCode = "Syria (no longer in use)";
			break;
		case "03":
			switch (secondaryCode) {
				case "0":
				case "6":
				case "7":
				case "8":
				case "9":
					areaCode = "Touch";
					break;
				default:
					areaCode = "Alfa";
			}
			break;
		case "04":
			areaCode = "Mount Lebanon, Metn Caza";
			break;
		case "05":
			areaCode = "Mount Lebanon, Baabda Caza + Aley Caza + Chouf Caza";
			break;
		case "06":
			areaCode = "North Lebanon";
			break;
		case "07":
			areaCode = "South Lebanon";
			break;
		case "08":
			areaCode = "Bekaa and Baalbek-Hermel";
			break;
		case "09":
			areaCode = "Mount Lebanon, Kesrouan Caza + Byblos Caza";
			break;
		case "10":
			areaCode = "MMS";
			break;
		case "70":
			switch (secondaryCode) {
				case "0":
				case "6":
				case "7":
				case "8":
				case "9":
					areaCode = "Touch";
					break;
				default:
					areaCode = "Alfa";
			}
			break;
		case "71":
			switch (secondaryCode) {
				case "0":
				case "6":
				case "7":
				case "8":
				case "9":
					areaCode = "Alfa";
					break;
				default:
					areaCode = "Touch";
			}
			break;
		case "76":
			switch (secondaryCode) {
				case "0":
				case "6":
				case "7":
				case "8":
				case "9":
					areaCode = "Touch";
					break;
				case "2":
					areaCode = "n/a";
					break;
				default:
					areaCode = "Alfa";
			}
			break;
		case "78":
			switch (secondaryCode) {
				case "8":
				case "9":
					areaCode = "Touch";
					break;
				default:
					areaCode = "n/a";
			}
			break;
		case "79":
			switch (secondaryCode) {
				case "1":
				case "2":
				case "3":
					areaCode = "Alfa";
					break;
				default:
					areaCode = "n/a";
			}
			break;
		case "81":
			switch (secondaryCode) {
				case "2":
				case "3":
				case "4":
					areaCode = "Alfa";
					break;
				case "6":
				case "7":
				case "8":
					areaCode = "Touch";
					break;
				default:
					areaCode = "n/a";
			}
			break;
		default:
			throw new Error("Invalid number!");
	}
	return areaCode;
}

function isAlfa(number) {
	return getAreaCode(number) === "Alfa";
}

function isTouch(number) {
	return getAreaCode(number) === "Touch";
}

export {
	isHoliday,
	getHolidaysNumber,
	getHolidays,
	getMarketRate,
	convertToUSD,
	convertToLBP,
	getAreaCode,
	isAlfa,
	isTouch,
};
