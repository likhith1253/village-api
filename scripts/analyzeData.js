const XLSX = require("xlsx");

const workbook = XLSX.readFile("D:/dataset/Rdir_2011_10_BIHAR.xls");

console.log(workbook.SheetNames);

const sheet = workbook.Sheets[workbook.SheetNames[0]];

const data = XLSX.utils.sheet_to_json(sheet);

console.log("Rows:", data.length);

console.log(data[1]);
