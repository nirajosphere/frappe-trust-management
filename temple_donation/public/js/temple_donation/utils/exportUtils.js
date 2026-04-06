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
