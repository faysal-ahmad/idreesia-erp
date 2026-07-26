import ExcelJS from 'exceljs';

export async function createWorkbookBuffer(sheetData, sheetName) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (sheetData.length > 0) {
    const headers = Object.keys(sheetData[0]);
    worksheet.columns = headers.map(header => ({
      header,
      key: header,
    }));

    sheetData.forEach(row => {
      worksheet.addRow(row);
    });
  }

  const data = await workbook.xlsx.writeBuffer();
  return Buffer.from(data);
}
