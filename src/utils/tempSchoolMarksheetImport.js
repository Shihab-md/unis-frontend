export const TEMP_SCHOOL_MARKSHEET_SHEET_NAME = "School_Marksheet_Template";

export const TEMP_SCHOOL_MARKSHEET_HEADERS = [
  "exam", "acYear", "regNumber", "name", "course", "niswanCode",
  "niswanName", "address",
  "subName1", "mark1", "result1", "subName2", "mark2", "result2",
  "subName3", "mark3", "result3", "subName4", "mark4", "result4",
  "subName5", "mark5", "result5", "subName6", "mark6", "result6",
  "day", "month", "year", "grade", "remarks",
  "totalSubjects", "totalMarks", "percentage",
];

const headerKey = (value) => String(value ?? "").trim().toLowerCase();
const knownHeaders = new Map(
  TEMP_SCHOOL_MARKSHEET_HEADERS.map((header) => [headerKey(header), header])
);
const hasText = (value) => String(value ?? "").trim() !== "";

export const parseTempSchoolMarksheetWorkbook = (workbook, XLSX) => {
  const sheetNames = Array.isArray(workbook?.SheetNames) ? workbook.SheetNames : [];
  const sheetName = sheetNames.find(
    (name) => headerKey(name) === headerKey(TEMP_SCHOOL_MARKSHEET_SHEET_NAME)
  ) || sheetNames[0];
  const worksheet = workbook?.Sheets?.[sheetName];
  if (!worksheet) throw new Error("No readable worksheet was found in the Excel file.");

  // Read displayed cell text, preserving leading zeros and Excel number formats.
  const matrix = XLSX.utils.sheet_to_json(worksheet, {
    header: 1, defval: "", raw: false, blankrows: true,
  });
  const headers = Array.isArray(matrix[0]) ? matrix[0] : [];
  const fieldNames = headers.map((header) => knownHeaders.get(headerKey(header)));
  const firstRow = worksheet["!ref"]
    ? XLSX.utils.decode_range(worksheet["!ref"]).s.r
    : 0;
  const rows = [];

  for (let index = 1; index < matrix.length; index += 1) {
    const values = Array.isArray(matrix[index]) ? matrix[index] : [];
    const row = { sourceRowNumber: firstRow + index + 1 };
    TEMP_SCHOOL_MARKSHEET_HEADERS.forEach((header) => { row[header] = ""; });
    fieldNames.forEach((header, column) => {
      // Duplicate known headers use the first nonblank value, without rejection.
      if (header && !hasText(row[header])) row[header] = values[column] ?? "";
    });
    if (TEMP_SCHOOL_MARKSHEET_HEADERS.some((header) => hasText(row[header]))) {
      rows.push(row);
    }
  }
  return rows;
};
