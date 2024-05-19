import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

interface Row {
	id: string;
	'first-name': string;
	'last-name': string;
}

const inputFilePath = path.join(__dirname, 'dirty', 'data.csv');
const outputFilePath = path.join(__dirname, 'clean', 'data.csv');

const readCSV = (filePath: string): Promise<Row[]> => {
	return new Promise((resolve, reject) => {
		const rows: Row[] = [];
		fs.createReadStream(filePath)
			.pipe(csv())
			.on('data', (data: Row) => rows.push(data))
			.on('end', () => resolve(rows))
			.on('error', (error) => reject(error));
	});
};

const writeCSV = (filePath: string, data: Row[]): Promise<void> => {
	return new Promise((resolve, reject) => {
		const csvWriter = createObjectCsvWriter({
			path: filePath,
			header: [
				{ id: 'id', title: 'id' },
				{ id: 'first-name', title: 'first-name' },
				{ id: 'last-name', title: 'last-name' },
			],
		});

		csvWriter
			.writeRecords(data)
			.then(() => resolve())
			.catch((error) => reject(error));
	});
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
		const rows = await readCSV(inputFilePath);
		const deduplicatedRows = deduplicateRows(rows);
		await writeCSV(outputFilePath, deduplicatedRows);
		console.log(`Deduplicated data has been written to ${outputFilePath}`);
	} catch (error) {
		console.error('Error processing CSV files:', error);
	}
};

main();
