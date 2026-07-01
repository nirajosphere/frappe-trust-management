import React, { useState } from "react";
import {
    Button, Table, Alert, Card, Row, Col, Typography, Upload, Tag, Progress, message
} from "antd";
import { DownloadOutlined, UploadOutlined, PlayCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import AddPageHeader from "../../components/common/AddPageHeader";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";
import { getTagConfig } from "../../utils/tagUtils";

const { Text, Paragraph } = Typography;

const ItemBulkImporter = ({ onBack }) => {
    const [importing, setImporting] = useState(false);
    const [parsedData, setParsedData] = useState([]);
    const [importResult, setImportResult] = useState(null);
    const [fileName, setFileName] = useState("");

    const call = (method, args = {}) => {
        return new Promise((resolve, reject) => {
            if (typeof frappe === "undefined") {
                resolve(null);
                return;
            }
            frappe.call({
                method,
                args,
                callback: (r) => resolve(r.message || r),
                error: (err) => reject(err)
            });
        });
    };

    // CSV parser helper
    const parseCSV = (text) => {
        const lines = text.split(/\r?\n/);
        if (lines.length === 0) return [];
        
        // Headers: Item Name,Item Code,Category,Store Location,Unit,Minimum Stock,Maximum Stock,Description
        const items = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Simple split by comma while respecting potential quotes
            const cells = [];
            let inQuotes = false;
            let currentCell = '';
            for (let c = 0; c < line.length; c++) {
                const char = line[c];
                if (char === '"' || char === "'") {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    cells.push(currentCell.trim());
                    currentCell = '';
                } else {
                    currentCell += char;
                }
            }
            cells.push(currentCell.trim());
            
            if (cells.length > 0 && cells[0]) {
                items.push({
                    item_name: cells[0] || "",
                    item_code: cells[1] || "",
                    category: cells[2] || "",
                    store_location: cells[3] || "",
                    unit: cells[4] || "Nos",
                    minimum_stock: parseFloat(cells[5]) || 0,
                    maximum_stock: parseFloat(cells[6]) || 0,
                    description: cells[7] || ""
                });
            }
        }
        return items;
    };

    const handleDownloadTemplate = () => {
        const headers = ["Item Name", "Item Code", "Category", "Store Location", "Unit", "Minimum Stock", "Maximum Stock", "Description"];
        const exampleRow = ["Fresh Banana", "BAN-01", "Fruits", "Main Kitchen", "Nos", "50", "200", "Bananas for pooja prasadam"];
        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), exampleRow.join(",")].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "item_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBeforeUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const data = parseCSV(text);
            if (data.length === 0) {
                message.error("The uploaded CSV file is empty or formatted incorrectly.");
                return;
            }
            setParsedData(data);
            setFileName(file.name);
            setImportResult(null);
            message.success(`Parsed ${data.length} items from CSV.`);
        };
        reader.readAsText(file);
        return false; // Prevent auto upload
    };

    const handleStartImport = async () => {
        if (parsedData.length === 0) return;
        setImporting(true);
        try {
            const res = await call("temple_donation.api.import_inventory_items", {
                items_list: JSON.stringify(parsedData)
            });
            if (res) {
                setImportResult(res);
                setParsedData([]); // Clear preview
                message.success("Bulk import processing complete!");
            }
        } catch (err) {
            console.error(err);
            message.error("Error occurred during bulk item import.");
        } finally {
            setImporting(false);
        }
    };

    const previewColumns = [
        { title: "Item Name", dataIndex: "item_name", key: "item_name" },
        { title: "Item Code", dataIndex: "item_code", key: "item_code" },
        { title: "Category", dataIndex: "category", key: "category" },
        { title: "Location", dataIndex: "store_location", key: "store_location" },
        { title: "Unit", dataIndex: "unit", key: "unit" },
        { title: "Min Stock", dataIndex: "minimum_stock", key: "minimum_stock", align: "right" }
    ];

    return (
        <ViewContainer className="bulk-import-page">
            <AddPageHeader
                onBack={onBack}
                title="Bulk Item Importer"
                subtitle="Upload assets and items using CSV template"
                showBack={true}
            />

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <div className="flex flex-col gap-6">
                        {/* Download Template Card */}
                        <SectionCard title="1. Download Template">
                            <Paragraph className="text-zinc-500 text-xs">
                                Download our standard CSV template containing all required column headers to ensure valid database records.
                            </Paragraph>
                            <Button
                                type="dashed"
                                icon={<DownloadOutlined />}
                                onClick={handleDownloadTemplate}
                                block
                                className="h-10 border-zinc-300 text-zinc-700 font-semibold"
                            >
                                Download Template CSV
                            </Button>
                        </SectionCard>

                        {/* Upload CSV Card */}
                        <SectionCard title="2. Upload CSV File">
                            <Paragraph className="text-zinc-500 text-xs">
                                Select or drag and drop your completed CSV template here.
                            </Paragraph>
                            <Upload
                                beforeUpload={handleBeforeUpload}
                                accept=".csv"
                                fileList={[]}
                            >
                                <Button
                                    icon={<UploadOutlined />}
                                    block
                                    className="h-10 border-zinc-900 bg-zinc-900 text-white font-semibold hover:!bg-zinc-800 hover:!border-zinc-800"
                                >
                                    Select CSV File
                                </Button>
                            </Upload>
                            {fileName && (
                                <div className="mt-3 p-2 bg-zinc-50 border border-zinc-100 rounded text-center">
                                    <Text className="text-xs font-semibold text-zinc-700">Selected: {fileName}</Text>
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </Col>

                <Col xs={24} lg={16}>
                    {/* Results / Import Logs Card */}
                    {importResult && (
                        <div className="flex flex-col gap-6 mb-6">
                            <Card className="card-glass border-zinc-100" title="Import Summary" bordered={false}>
                                <Row gutter={[16, 16]} className="text-center">
                                    <Col xs={8}>
                                        <Card className="bg-emerald-50/50 border-emerald-100/50" bordered={false}>
                                            <Text className="block text-2xl font-bold text-emerald-600">{importResult.created}</Text>
                                            <Text className="text-[10px] uppercase font-bold text-zinc-400">Created</Text>
                                        </Card>
                                    </Col>
                                    <Col xs={8}>
                                        <Card className="bg-zinc-50 border-zinc-100" bordered={false}>
                                            <Text className="block text-2xl font-bold text-zinc-500">{importResult.skipped}</Text>
                                            <Text className="text-[10px] uppercase font-bold text-zinc-400">Skipped</Text>
                                        </Card>
                                    </Col>
                                    <Col xs={8}>
                                        <Card className="bg-red-50/50 border-red-100/50" bordered={false}>
                                            <Text className="block text-2xl font-bold text-red-600">{importResult.failed}</Text>
                                            <Text className="text-[10px] uppercase font-bold text-zinc-400">Failed</Text>
                                        </Card>
                                    </Col>
                                </Row>

                                {importResult.logs?.length > 0 && (
                                    <div className="mt-6">
                                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Detailed Audit Logs</div>
                                        <div className="max-h-60 overflow-y-auto border border-zinc-100 rounded-lg p-3 bg-zinc-50/50 flex flex-col gap-1.5">
                                            {importResult.logs.map((log, idx) => {
                                                let isErr = log.includes("Error") || log.includes("does not exist") || log.includes("required") || log.includes("invalid");
                                                let isSkip = log.includes("already exists") || log.includes("Skipped");
                                                return (
                                                    <div key={idx} className="text-xs flex items-start gap-1.5">
                                                        <Tag color={isErr ? "red" : isSkip ? "orange" : "green"} className="m-0 text-[10px] font-bold rounded">
                                                            {isErr ? "FAIL" : isSkip ? "SKIP" : "OK"}
                                                        </Tag>
                                                        <span className="text-zinc-700">{log}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* Preview parsed items */}
                    {parsedData.length > 0 ? (
                        <SectionCard 
                            title={`Preview Parsed Data (${parsedData.length} records)`}
                            extra={
                                <Button
                                    type="primary"
                                    icon={<PlayCircleOutlined />}
                                    loading={importing}
                                    onClick={handleStartImport}
                                    className="bg-black hover:bg-zinc-800"
                                >
                                    Process & Import
                                </Button>
                            }
                        >
                            <Table
                                dataSource={parsedData}
                                columns={previewColumns}
                                rowKey={(record, index) => index}
                                pagination={{ pageSize: 5 }}
                                size="small"
                                className="border border-zinc-100 rounded-lg overflow-hidden"
                            />
                        </SectionCard>
                    ) : (
                        !importResult && (
                            <Card className="card-glass border-zinc-100 flex items-center justify-center p-12 text-center" bordered={false}>
                                <Empty 
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div className="flex flex-col gap-1.5">
                                            <Text className="font-semibold text-zinc-700">No CSV file uploaded yet</Text>
                                            <Text className="text-zinc-400 text-xs">Upload your completed item template to preview and validate the data here.</Text>
                                        </div>
                                    } 
                                />
                            </Card>
                        )
                    )}
                </Col>
            </Row>
        </ViewContainer>
    );
};

export default ItemBulkImporter;
