import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

/**
 * Script to analyze a single Excel dataset file for the Village API SaaS Platform importer foundation.
 * 
 * Objective: Read the first worksheet, extract metadata (sheet name, dimensions), 
 * and display the column headers and first 10 rows in a readable console format.
 */

// 1. Path of the file to read as per the requirement
const FILE_PATH = 'D:\\dataset\\Rdir_2011_10_BIHAR.xls';

function main() {
  console.log('==================================================');
  console.log('       Village API - Dataset Analyzer Foundation   ');
  console.log('==================================================');
  console.log(`Target File: ${FILE_PATH}\n`);

  // Verify file existence
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`Error: File does not exist at path: ${FILE_PATH}`);
    process.exit(1);
  }

  try {
    console.log('Reading Excel file...');
    const startTime = Date.now();
    
    // Read the workbook (xlsx package handles both .xls and .xlsx files)
    const workbook = XLSX.readFile(FILE_PATH);
    const readDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Workbook loaded successfully in ${readDuration}s.`);

    // Load first worksheet name
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      console.error('Error: No worksheets found in the workbook.');
      process.exit(1);
    }

    // Load first worksheet
    const worksheet = workbook.Sheets[firstSheetName];

    // Read the range of the sheet using XLSX utilities
    const ref = worksheet['!ref'];
    let totalRows = 0;
    let totalColumns = 0;

    if (ref) {
      const range = XLSX.utils.decode_range(ref);
      // Row and column indices are 0-based, so we add 1 to get count
      totalRows = range.e.r - range.s.r + 1;
      totalColumns = range.e.c - range.s.c + 1;
    }

    // Convert sheet to an array of arrays to preserve structure and avoid header key mapping issues
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    // The first row (index 0) contains the column headers
    const headers = rows[0] || [];

    // Print the required parameters
    console.log('\n------------------ METADATA ------------------');
    console.log(`Sheet Name    : ${firstSheetName}`);
    console.log(`Total Rows    : ${totalRows}`);
    console.log(`Total Columns : ${totalColumns}`);

    console.log('\n----------------- HEADERS --------------------');
    console.log(`Total Headers Count: ${headers.length}`);
    if (headers.length > 0) {
      headers.forEach((header, index) => {
        console.log(`  [Col ${index + 1}] ${header}`);
      });
    } else {
      console.log('  (No headers found)');
    }

    console.log('\n---------------- FIRST 10 ROWS ---------------');
    // First 10 rows of data (index 0 is headers, indices 1 to 10 are the first 10 data rows)
    const limit = Math.min(rows.length, 11); // up to index 10 inclusive (which is 10 rows)
    
    if (rows.length <= 1) {
      console.log('  (No data rows found)');
    } else {
      for (let i = 1; i < limit; i++) {
        const rowData = rows[i];
        console.log(`\nRow ${i}:`);
        
        // Map headers to row cells for a clean and readable console structure
        const rowObject = {};
        headers.forEach((header, colIndex) => {
          const colName = header || `Column_${colIndex + 1}`;
          rowObject[colName] = rowData[colIndex] !== undefined ? rowData[colIndex] : '';
        });
        
        console.dir(rowObject, { colors: true, depth: null });
      }
    }

    console.log('\n==================================================');
    console.log('Analysis Complete!');
    console.log('==================================================');

  } catch (error) {
    console.error('An error occurred during dataset analysis:', error);
    process.exit(1);
  }
}

// Execute the main analysis function
main();
