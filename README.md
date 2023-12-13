# lebanese-utils

**lebanese-utils** is a Node.js package that provides a collection of utility functions tailored for the Lebanese community. It includes features such as Lebanese public holidays, currency rate conversion, and more. Feel free to use this package to integrate Lebanese functionalities into your Node.js projects.

## Requirements

This module requires:

- [Node.js](https://nodejs.org/)
- [date-fns](https://date-fns.org/)
- [axios](https://axios-http.com/)
- [cheerio](https://cheerio.js.org/)

## Installation ⚙

```bash
npm install lebanese-utils
```

## Usage 🛠

```javascript
import * as lebaneseUtils from "lebanese-utils";
```

## Available Functions ✨

```javascript
/*** Holiday Functions - currently only works with 2024 ***/

isHoliday(date: "dd-MM-yyyy"): boolean
//Check if a given date is a public holiday.
//Ex: console.log(lebaneseUtils.isHoliday("01-01-2024"));
//output: true

getHolidaysNumber(): number
//Get the number of all public holidays.

getHolidays(): Array<Object>
//Get a list of all public holidays.

/*** USD/LBP Rate Conversion Functions ***/
/***      All functions are async      ***/

getMarketRate(): number
//Get the latest Market USD/LBP Rate.

convertToLBP(amount: number): number
//Convert an amount in USD to LBP.

convertToUSD(amount: number): number
//Convert an amount in LBP to USD.
```

## Contributing ❤️

Contributions are welcome! If you have ideas for new features or improvements, feel free to open an issue or submit a pull request.
