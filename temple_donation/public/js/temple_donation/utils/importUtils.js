import * as XLSX from "xlsx";

/**
 * Parses a line of CSV text while respecting quotes.
 */
export const parseCSVLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
};

/**
 * Parses raw CSV text into { headers, rows } where rows are objects.
 */
export const parseCSVText = (text) => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const headers = parseCSVLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const values = parseCSVLine(line);
        if (values.length === 0 || values.every(v => !v)) continue;
        
        const rowObj = {};
        headers.forEach((header, index) => {
            rowObj[header] = values[index] || "";
        });
        rows.push(rowObj);
    }
    return { headers, rows };
};

/**
 * Reads a File object (CSV or Excel) and parses it into { headers, rows }.
 */
export const parseSpreadsheetFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
        
        if (isExcel) {
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    if (json.length === 0) {
                        reject(new Error("The Excel file is empty."));
                        return;
                    }
                    
                    const headers = json[0].map(h => String(h || "").trim());
                    const rows = [];
                    for (let i = 1; i < json.length; i++) {
                        const rowData = json[i];
                        if (!rowData || rowData.length === 0 || rowData.every(v => v === undefined || v === null || v === "")) {
                            continue;
                        }
                        const rowObj = {};
                        headers.forEach((header, index) => {
                            const val = rowData[index];
                            rowObj[header] = val !== undefined && val !== null ? String(val).trim() : "";
                        });
                        rows.push(rowObj);
                    }
                    resolve({ headers, rows });
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        } else {
            // CSV
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const parsed = parseCSVText(text);
                    resolve(parsed);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
        }
    });
};

/**
 * Serializes parsed headers and rows back into a standard CSV string.
 */
export const convertToCSVString = (headers, rows) => {
    const escapeCell = (val) => {
        const str = val !== undefined && val !== null ? String(val) : "";
        if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };
    
    const headerRow = headers.map(escapeCell).join(",");
    const dataRows = rows.map(row => {
        return headers.map(header => escapeCell(row[header])).join(",");
    });
    
    return [headerRow, ...dataRows].join("\n");
};
