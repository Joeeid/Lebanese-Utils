import { format, parse } from "date-fns";
import axios from "axios";
import cheerio from "cheerio";

const publicHolidays = [
	{ name: "New Year's Day", date: "01-01-2024" },
	{ name: "Armenian Orthodox Christmas Day", date: "01-06-2024" },
	{ name: "St. Maroun's Day", date: "09-02-2024" },
	{ name: "Rafik Hariri Memorial Day", date: "14-02-2024" },
	{ name: "Feast of Annunciation", date: "25-03-2024" },
	{ name: "Good Friday (Western Church)", date: "29-03-2024" },
	{ name: "Easter Sunday (Western Church)", date: "31-03-2024" },
	{ name: "Eid al-Fitr", date: "10-04-2024" },
	{ name: "Eid al-Fitr", date: "11-04-2024" },
	{ name: "Labour Day", date: "01-05-2024" },
	{ name: "Good Friday (Eastern Church)", date: "03-05-2024" },
	{ name: "Easter Sunday (Eastern Church)", date: "05-05-2024" },
	{ name: "Resistance and Liberation Day", date: "25-05-2024" },
	{ name: "Eid Al Adha", date: "17-06-2024" },
	{ name: "Eid Al Adha", date: "18-06-2024" },
	{ name: "Hijri New Year", date: "08-07-2024" },
	{ name: "Ashoura", date: "16-07-2024" },
	{ name: "Assumption Day", date: "15-08-2024" },
	{ name: "Birthday of Prophet Muhammed", date: "15-09-2024" },
	{ name: "Independence Day", date: "22-11-2024" },
	{ name: "Christmas Day", date: "25-12-2024" },
];

function isHoliday(date) {
	// If the parameter is a string, attempt to parse it as a date
	const parsedDate =
		typeof date === "string" ? parse(date, "dd-MM-yyyy", new Date()) : date;

	if (isNaN(parsedDate.getTime())) {
		throw new Error("Invalid date format!");
	}

	const formattedDate = format(parsedDate, "dd-MM-yyyy");
	return publicHolidays.some((holiday) => holiday.date === formattedDate);
}

function getHolidaysNumber() {
	return publicHolidays.length;
}

function getHolidays() {
	return publicHolidays;
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
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
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

export {
	isHoliday,
	getHolidaysNumber,
	getHolidays,
	getMarketRate,
	convertToUSD,
	convertToLBP,
};
