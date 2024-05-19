import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';

interface Row {
	id: string;
	firstName: string;
	lastName: string;
}

const inputFilePath = path.join(__dirname, 'dirty', 'data.xlsx');
const outputFilePath = path.join(__dirname, 'clean', 'data.xlsx');

const readExcel = (filePath: string): Row[] => {
	const workbook = xlsx.readFile(filePath);
	const sheetName = workbook.SheetNames[0];
	const sheet = workbook.Sheets[sheetName];
	const rows: Row[] = xlsx.utils
		.sheet_to_json(sheet, { header: 1 })
		.slice(1) // Skip header row
		.map((row: any[]) => ({
			id: row[0].toString(),
			firstName: row[1],
			lastName: row[2],
		}));
	return rows;
};

const writeExcel = (filePath: string, data: Row[]): void => {
	const workbook = xlsx.utils.book_new();
	const worksheetData = [
		['id', 'first-name', 'last-name'],
		...data.map((row) => [row.id, row.firstName, row.lastName]),
	];
	const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
	xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
	xlsx.writeFile(workbook, filePath);
};

const deduplicateRows = (rows: Row[]): Row[] => {
	const uniqueRowsMap: { [key: string]: Row } = {};

	rows.forEach((row) => {
		uniqueRowsMap[row.id] = row;
	});

	return Object.values(uniqueRowsMap);
};

const main = async () => {
	try {
		const rows = readExcel(inputFilePath);
		const deduplicatedRows = deduplicateRows(rows);
		writeExcel(outputFilePath, deduplicatedRows);
		console.log(`Deduplicated data has been written to ${outputFilePath}`);
	} catch (error) {
		console.error('Error processing Excel files:', error);
	}
};

main();
