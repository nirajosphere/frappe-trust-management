/**
 * Utility to export data to CSV
 */
export const exportToCSV = (data, columns, filename) => {
    if (!data || data.length === 0) return;

    // CSV Header
    const headers = columns
        .filter(col => col.title && col.title !== 'Actions')
        .map(col => col.title);
    
    const csvRows = [];
    csvRows.push(headers.join(','));

    // CSV Body
    data.forEach(item => {
        const row = columns
            .filter(col => col.title && col.title !== 'Actions')
            .map(col => {
                const val = item[col.dataIndex];
                return `"${String(val || '').replace(/"/g, '""')}"`;
            });
        csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename.replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Utility to export data to Excel (XLS)
 */
export const exportToExcel = (data, columns, filename) => {
    if (!data || data.length === 0) return;

    const cols = columns.filter(col => col.title && col.title !== 'Actions');

    // Create simple HTML Table representing the spreadsheet
    let tableHtml = '<table border="1"><thead><tr style="background-color: #18181b; color: #ffffff; font-weight: bold;">';
    cols.forEach(col => {
        tableHtml += `<th>${col.title}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    data.forEach((item, index) => {
        tableHtml += `<tr style="${index % 2 === 0 ? 'background-color: #fafafa;' : ''}">`;
        cols.forEach(col => {
            const val = item[col.dataIndex] || '';
            tableHtml += `<td>${String(val)}</td>`;
        });
        tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    // SpreadsheetML formatting context wrapper
    const excelTemplate = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Sheet 1</x:Name>
                            <x:WorksheetOptions>
                                <x:DisplayGridlines/>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <meta charset="utf-8">
        </head>
        <body>${tableHtml}</body>
        </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename.replace(/\s+/g, '_')}_export.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Utility to export data to PDF (Browser Print view)
 */
export const exportToPDF = (data, columns, filename) => {
    if (!data || data.length === 0) return;

    const cols = columns.filter(col => col.title && col.title !== 'Actions');

    // Create table content
    let tableRows = '';
    data.forEach((item, index) => {
        let cells = '';
        cols.forEach(col => {
            const val = item[col.dataIndex] || '';
            cells += `<td style="padding: 10px; border-bottom: 1px solid #e4e4e7; font-size: 13px;">${val}</td>`;
        });
        tableRows += `<tr style="${index % 2 === 0 ? 'background-color: #fafafa;' : ''}">${cells}</tr>`;
    });

    let tableHeaders = '';
    cols.forEach(col => {
        tableHeaders += `<th style="padding: 12px 10px; text-align: left; background-color: #18181b; color: white; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${col.title}</th>`;
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
        <html>
        <head>
            <title>${filename}</title>
            <style>
                body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #18181b; padding: 40px; margin: 0; }
                .header { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #18181b; padding-bottom: 15px; }
                .title { font-size: 24px; font-weight: 700; margin: 0; }
                .date { font-size: 14px; color: #71717a; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1 class="title">${filename}</h1>
                </div>
                <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
            </div>
            <table>
                <thead>
                    <tr>${tableHeaders}</tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};
