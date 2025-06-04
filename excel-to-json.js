const XLSX = require('xlsx');
const fs = require('fs');

// 讀取Excel文件
const workbook = XLSX.readFile('work-info.xlsx');

// 獲取第一個工作表
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];

// 將工作表轉換為JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet);

// 將JSON數據寫入文件
fs.writeFileSync('output.json', JSON.stringify(jsonData, null, 2));

console.log('Excel文件已成功轉換為JSON！'); 