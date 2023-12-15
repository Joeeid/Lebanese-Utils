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

export {
	isHoliday,
	getHolidaysNumber,
	getHolidays,
	getMarketRate,
	convertToUSD,
	convertToLBP,
};
