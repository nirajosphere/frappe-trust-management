import React, { useState, useEffect } from "react";
import {
    Button, Table, Alert, Card, Row, Col, Typography, Upload, Tag, Progress, message, Empty, Select
} from "antd";
import { DownloadOutlined, UploadOutlined, PlayCircleOutlined, InfoCircleOutlined, InboxOutlined } from "@ant-design/icons";
import { parseSpreadsheetFile } from "../../utils/importUtils";
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
    const [temples, setTemples] = useState([]);
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [importPage, setImportPage] = useState(1);
    const [importPageSize, setImportPageSize] = useState(5);

    useEffect(() => {
        setImportPage(1);
    }, [parsedData?.length]);

    useEffect(() => {
        const fetchTemples = async () => {
            try {
                const res = await call("frappe.client.get_list", {
                    doctype: "Temple",
                    fields: ["name", "temple_name"],
                    limit_page_length: 100,
                    order_by: "temple_name asc"
                });
                if (res) {
                    setTemples(res);
                    if (res.length > 0) {
                        setSelectedTemple(res[0].name);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchTemples();
    }, []);

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

    // Map parsed headers and rows to Item structure
    const parseItemData = (headers, rows) => {
        const headersLower = headers.map(h => h.trim().toLowerCase());
        const getHeaderKey = (possibleNames) => {
            const idx = headersLower.findIndex(h => possibleNames.some(p => h.includes(p)));
            return idx >= 0 ? headers[idx] : null;
        };
        
        const keyName = getHeaderKey(["item name", "name"]);
        const keyCode = getHeaderKey(["item code", "code"]);
        const keyCategory = getHeaderKey(["category"]);
        const keyLocation = getHeaderKey(["store location", "location", "store"]);
        const keyTemple = getHeaderKey(["temple", "trust"]);
        const keyUnit = getHeaderKey(["unit"]);
        const keyMinStock = getHeaderKey(["minimum stock", "min stock", "minimum"]);
        const keyMaxStock = getHeaderKey(["maximum stock", "max stock", "maximum"]);
        const keyDesc = getHeaderKey(["description", "desc"]);
        
        return rows.map((row, index) => {
            const val = (key, fallbackIdx) => {
                if (key && row[key] !== undefined && row[key] !== null) {
                    return String(row[key]).trim();
                }
                const keys = Object.keys(row);
                const fallbackKey = keys[fallbackIdx];
                return fallbackKey ? String(row[fallbackKey]).trim() : "";
            };
            
            return {
                item_name: val(keyName, 0),
                item_code: val(keyCode, 1),
                category: val(keyCategory, 2),
                store_location: val(keyLocation, 3),
                temple: val(keyTemple, 4),
                unit: val(keyUnit, 5) || "Nos",
                minimum_stock: parseFloat(val(keyMinStock, 6)) || 0,
                maximum_stock: parseFloat(val(keyMaxStock, 7)) || 0,
                description: val(keyDesc, 8)
            };
        }).filter(item => item.item_name);
    };

    const handleDownloadTemplate = () => {
        const headers = ["Item Name", "Item Code", "Category", "Store Location", "Temple / Trust", "Unit", "Minimum Stock", "Maximum Stock", "Description"];
        const exampleRow = ["Fresh Banana", "BAN-01", "Fruits", "Main Kitchen", selectedTemple || "MALATAJ MELDI MAA", "Nos", "50", "200", "Bananas for pooja prasadam"];
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
        parseSpreadsheetFile(file)
            .then(({ headers, rows }) => {
                const parsed = parseItemData(headers, rows);
                if (parsed.length === 0) {
                    message.error("No valid items could be parsed from the file.");
                    return;
                }
                const mappedData = parsed.map(item => ({
                    ...item,
                    temple: item.temple || selectedTemple
                }));
                setParsedData(mappedData);
                setFileName(file.name);
                setImportResult(null);
                message.success(`Parsed ${parsed.length} items from template.`);
            })
            .catch(err => {
                console.error(err);
                message.error("Failed to parse file. Make sure it is a valid CSV or Excel file.");
            });
        return false; // Prevent auto upload
    };

    const handleStartImport = async () => {
        if (parsedData.length === 0) return;
        setImporting(true);
        try {
            const preparedData = parsedData.map(item => ({
                ...item,
                temple: item.temple || selectedTemple
            }));
            const res = await call("temple_donation.api.import_inventory_items", {
                items_list: JSON.stringify(preparedData)
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
        { title: "Temple/Trust", dataIndex: "temple", key: "temple" },
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
                        {/* Select Trust/Temple Card */}
                        <SectionCard title="1. Select Target Trust">
                            <Paragraph className="text-zinc-500 text-xs">
                                Choose the Temple or Trust you are importing items for. This will pre-fill the downloaded template and serve as the default for all rows.
                            </Paragraph>
                            <Select
                                placeholder="Select Trust / Temple"
                                value={selectedTemple}
                                onChange={(val) => {
                                    setSelectedTemple(val);
                                    // If we already parsed data, update its temple values
                                    if (parsedData.length > 0) {
                                        const updated = parsedData.map(item => ({
                                            ...item,
                                            temple: val
                                        }));
                                        setParsedData(updated);
                                    }
                                }}
                                className="w-full"
                                options={temples.map(t => ({ label: t.temple_name || t.name, value: t.name }))}
                            />
                        </SectionCard>

                        {/* Download Template Card */}
                        <SectionCard title="2. Download Template">
                            <Paragraph className="text-zinc-500 text-xs">
                                Download our standard CSV template containing all required column headers to ensure valid database records.
                            </Paragraph>
                            <Button
                                type="dashed"
                                icon={<DownloadOutlined />}
                                onClick={handleDownloadTemplate}
                                disabled={!selectedTemple}
                                block
                            >
                                Download Template CSV
                            </Button>
                        </SectionCard>

                        {/* Upload CSV Card */}
                        <SectionCard title="3. Upload Template File">
                            <Paragraph className="text-zinc-500 text-xs">
                                Select or drag and drop your completed CSV or Excel template here.
                            </Paragraph>
                            <Upload.Dragger
                                beforeUpload={handleBeforeUpload}
                                accept=".csv,.xlsx,.xls"
                                fileList={[]}
                                disabled={!selectedTemple}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">
                                    Click to select or drag CSV or Excel file here
                                </p>
                                <p className="ant-upload-hint">
                                    Supports CSV, Excel (.xlsx, .xls) and Google Sheets (exported)
                                </p>
                            </Upload.Dragger>
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
                            <SectionCard title="Import Summary">
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
                            </SectionCard>
                        </div>
                    )}

                    {/* Preview parsed items */}
                    {parsedData.length > 0 ? (
                        <SectionCard 
                            title={`Preview Parsed Data (${parsedData.length} records)`}
                            right={
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<PlayCircleOutlined />}
                                    loading={importing}
                                    onClick={handleStartImport}
                                >
                                    Process & Import
                                </Button>
                            }
                        >
                            <Table
                                dataSource={parsedData}
                                columns={previewColumns}
                                rowKey={(record, index) => index}
                                pagination={{
                                    current: importPage,
                                    pageSize: importPageSize,
                                    showSizeChanger: true,
                                    onChange: (p, s) => {
                                        setImportPage(p);
                                        setImportPageSize(s);
                                    }
                                }}
                                size="small"
                                className="border border-zinc-100 rounded-lg overflow-hidden"
                            />
                        </SectionCard>
                    ) : (
                        !importResult && (
                            <Card className="flex items-center justify-center p-12 text-center" bordered={false}>
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
