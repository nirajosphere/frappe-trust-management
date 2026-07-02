import React, { useState } from "react";
import { Card, Select, Button, Upload, Typography, Alert, Space, Table, notification, Dropdown } from "antd";
import { DownloadOutlined, InboxOutlined, CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { useFrappeGetDocList } from "../../../hooks/useFrappe";
import { parseSpreadsheetFile, convertToCSVString } from "../../../utils/importUtils";

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;

const RoomImport = () => {
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [importLogs, setImportLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    
    const [csvContent, setCsvContent] = useState(null);
    const [previewData, setPreviewData] = useState(null);

    // Fetch Temples
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    const handleDownloadCSV = () => {
        if (typeof window !== "undefined") {
            window.open("/api/method/temple_donation.api.room_booking.download_room_import_template");
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const XLSX = await import("xlsx");
            const headers = ["Room Number", "Building Code", "Floor Number", "Room Type Name", "Capacity", "Price Per Day", "Status", "Description", "Notes"];
            const exampleRow1 = ["A-101", "BLD001", "1", "AC", "2", "1500", "Available", "Main Building AC Room", "Near elevator"];
            const exampleRow2 = ["A-102", "BLD001", "1", "Non AC", "4", "800", "Available", "Main Building Quad Room", "Family sized"];
            
            const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow1, exampleRow2]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Rooms Template");
            XLSX.writeFile(workbook, "room_import_template.xlsx");
        } catch (err) {
            notification.error({ message: "Failed to generate Excel template", description: err.message });
        }
    };

    const templateMenuItems = [
        {
            key: "csv",
            label: "CSV Template",
            onClick: handleDownloadCSV
        },
        {
            key: "excel",
            label: "Excel Template (.xlsx)",
            onClick: handleDownloadExcel
        }
    ];

    const handleUpload = (file) => {
        if (!selectedTemple) {
            notification.warning({ message: "Please select a Temple first before uploading." });
            return false;
        }

        parseSpreadsheetFile(file)
            .then(({ headers, rows }) => {
                // Validate headers
                const required = ["Room Number", "Building Code", "Floor Number", "Room Type Name"];
                const missing = required.filter(req => !headers.includes(req));
                if (missing.length > 0) {
                    notification.error({
                        message: "Invalid Template Format",
                        description: `Missing required columns: ${missing.join(", ")}`
                    });
                    return;
                }
                const csvStr = convertToCSVString(headers, rows);
                setCsvContent(csvStr);
                setPreviewData(rows);
                setStats(null);
                setImportLogs([]);
            })
            .catch(err => {
                notification.error({
                    message: "Failed to parse file",
                    description: err.message || "Unknown parsing error"
                });
            });
        return false; // Prevent auto-upload by AntD
    };

    const handleCancelPreview = () => {
        setCsvContent(null);
        setPreviewData(null);
        setStats(null);
        setImportLogs([]);
    };

    const handleConfirmImport = () => {
        if (!csvContent || !selectedTemple) return;
        performImport(csvContent);
    };

    const performImport = (content) => {
        if (typeof frappe === "undefined") {
            notification.error({ message: "Frappe environment not found" });
            return;
        }

        setLoading(true);
        setImportLogs([]);
        setStats(null);

        frappe.call({
            method: "temple_donation.api.room_booking.import_rooms_from_csv",
            args: {
                csv_content: content,
                temple: selectedTemple
            },
            callback: (r) => {
                setLoading(false);
                setPreviewData(null);
                setCsvContent(null);
                if (r.message) {
                    setStats({
                        success: r.message.success,
                        failed: r.message.failed,
                        message: r.message.message
                    });
                    setImportLogs(r.message.logs || []);
                    notification.success({
                        message: "Import Completed",
                        description: r.message.message
                    });
                }
            },
            error: (err) => {
                setLoading(false);
            }
        });
    };

    const previewColumns = [
        { title: "Room Number", dataIndex: "Room Number", key: "room_number" },
        { title: "Building Code", dataIndex: "Building Code", key: "building_code" },
        { title: "Floor Number", dataIndex: "Floor Number", key: "floor_number" },
        { title: "Room Type", dataIndex: "Room Type Name", key: "room_type_name" },
        { title: "Capacity", dataIndex: "Capacity", key: "capacity", render: (val) => val || "2 (Default)" },
        { title: "Price Per Day", dataIndex: "Price Per Day", key: "price_per_day", render: (val) => val ? `₹${Number(val).toLocaleString()}` : "0" },
        { title: "Status", dataIndex: "Status", key: "status", render: (val) => val || "Available" }
    ];

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px 0" }}>
            <Card 
                bordered={false} 
                style={{ 
                    borderRadius: "12px", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Import Rooms</Title>
                        <Paragraph type="secondary" style={{ margin: 0 }}>
                            Upload a CSV file to import rooms in bulk. Ensure Building Codes and Room Categories exist in the system first.
                        </Paragraph>
                    </div>
                    <Dropdown menu={{ items: templateMenuItems }} trigger={["click"]}>
                        <Button 
                            type="dashed" 
                            icon={<DownloadOutlined />}
                        >
                            Download Sample Template
                        </Button>
                    </Dropdown>
                </div>

                <div style={{ marginBottom: "24px" }}>
                    <Text strong style={{ display: "block", marginBottom: "8px" }}>Select Destination Temple</Text>
                    <Select 
                        showSearch 
                        placeholder="Select Temple to Import Rooms Into"
                        style={{ width: "100%" }}
                        optionFilterProp="children"
                        loading={loadingTemples}
                        disabled={previewData !== null || loading}
                        onChange={(val) => setSelectedTemple(val)}
                        options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                    />
                </div>

                {!previewData ? (
                    <Dragger 
                        accept=".csv,.xlsx,.xls"
                        beforeUpload={handleUpload}
                        showUploadList={false}
                        disabled={!selectedTemple || loading}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag CSV or Excel file to this area to import</p>
                        <p className="ant-upload-hint">
                            {!selectedTemple 
                                ? "Please select a destination temple above first." 
                                : "Supports CSV, Excel (.xlsx, .xls) and Google Sheets (exported)"}
                        </p>
                    </Dragger>
                ) : (
                    <div style={{ marginTop: "16px" }}>
                        <Alert 
                            message="Template File Loaded Successfully" 
                            description={`Found ${previewData.length} room records. Please review the preview below before confirming the import.`} 
                            type="info" 
                            showIcon 
                            style={{ marginBottom: "16px" }}
                        />
                        <div style={{ marginBottom: "16px", overflowX: "auto" }}>
                            <Table 
                                dataSource={previewData.map((row, idx) => ({ ...row, key: idx }))} 
                                columns={previewColumns} 
                                pagination={{ pageSize: 5 }} 
                                size="small"
                                bordered
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <Button 
                                danger 
                                icon={<CloseOutlined />} 
                                onClick={handleCancelPreview}
                                disabled={loading}
                            >
                                Cancel & Reset
                            </Button>
                            <Button 
                                type="primary" 
                                icon={<CheckOutlined />} 
                                loading={loading}
                                onClick={handleConfirmImport}
                                style={{ backgroundColor: "#000", borderColor: "#000" }}
                            >
                                Confirm & Import {previewData.length} Rooms
                            </Button>
                        </div>
                    </div>
                )}

                {stats && (
                    <div style={{ marginTop: "24px" }}>
                        <Alert 
                            message="Import Results Summary" 
                            description={
                                <div>
                                    <p>{stats.message}</p>
                                    <Space>
                                        <Text type="success">Succeeded: {stats.success}</Text>
                                        <Text type="danger">Failed: {stats.failed}</Text>
                                    </Space>
                                </div>
                            } 
                            type={stats.failed > 0 ? "warning" : "success"} 
                            showIcon 
                        />
                    </div>
                )}

                {importLogs.length > 0 && (
                    <div style={{ marginTop: "24px" }}>
                        <Text strong style={{ display: "block", marginBottom: "8px" }}>Import Logs</Text>
                        <div 
                            style={{ 
                                height: "200px", 
                                overflowY: "auto", 
                                background: "#090d16", 
                                color: "#a9b2c3", 
                                fontFamily: "monospace", 
                                padding: "12px", 
                                borderRadius: "6px",
                                fontSize: "12px"
                            }}
                        >
                            {importLogs.map((log, i) => {
                                const isError = log.includes("Error");
                                return (
                                    <div key={i} style={{ color: isError ? "#f87171" : "#34d399", marginBottom: "4px" }}>
                                        {log}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default RoomImport;
