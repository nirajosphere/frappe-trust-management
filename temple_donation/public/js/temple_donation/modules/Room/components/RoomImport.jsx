import React, { useState } from "react";
import { Card, Select, Button, Upload, Typography, Alert, Space, Table, notification, Dropdown, Row, Col, Empty, Tag } from "antd";
import { DownloadOutlined, InboxOutlined, CloseOutlined, CheckOutlined, EyeOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useFrappeGetDocList } from "../../../hooks/useFrappe";
import { parseSpreadsheetFile, convertToCSVString } from "../../../utils/importUtils";
import SectionCard from "../../../components/common/SectionCard";

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;

const RoomImport = () => {
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [importLogs, setImportLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    
    const [csvContent, setCsvContent] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [previewPage, setPreviewPage] = useState(1);
    const [previewPageSize, setPreviewPageSize] = useState(5);

    React.useEffect(() => {
        setPreviewPage(1);
    }, [previewData?.length]);

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
        <div style={{ padding: "16px 0" }}>
            <Row gutter={[24, 24]}>
                {/* Left Configuration Column */}
                <Col xs={24} lg={8}>
                    <div className="flex flex-col gap-6">
                        
                        {/* Select Destination Temple */}
                        <SectionCard title="1. Select Destination Temple">
                            <Paragraph className="text-zinc-500 text-xs" style={{ marginBottom: "12px" }}>
                                Choose the Temple or Trust you are importing rooms into. This must be selected before uploading files.
                            </Paragraph>
                            <Select 
                                showSearch 
                                placeholder="Select Temple to Import Rooms Into"
                                className="w-full"
                                optionFilterProp="children"
                                loading={loadingTemples}
                                disabled={previewData !== null || loading}
                                onChange={(val) => setSelectedTemple(val)}
                                options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                            />
                        </SectionCard>

                        {/* Download Template Card */}
                        <SectionCard title="2. Download Template">
                            <Paragraph className="text-zinc-500 text-xs" style={{ marginBottom: "12px" }}>
                                Download the official CSV or Excel template structure. Fill in the room numbers and configurations.
                            </Paragraph>
                            <Dropdown menu={{ items: templateMenuItems }} trigger={["click"]}>
                                <Button 
                                    type="dashed" 
                                    icon={<DownloadOutlined />}
                                    block
                                >
                                    Download Sample Template
                                </Button>
                            </Dropdown>
                        </SectionCard>

                        {/* Upload CSV Card */}
                        <SectionCard title="3. Upload Template File">
                            <Paragraph className="text-zinc-500 text-xs" style={{ marginBottom: "12px" }}>
                                Select or drag and drop your completed CSV or Excel template here.
                            </Paragraph>
                            <Dragger 
                                accept=".csv,.xlsx,.xls"
                                beforeUpload={handleUpload}
                                showUploadList={false}
                                disabled={!selectedTemple || loading}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag template file here</p>
                                <p className="ant-upload-hint">
                                    {!selectedTemple 
                                        ? "Select a destination temple first." 
                                        : "Supports CSV, Excel (.xlsx, .xls)"}
                                </p>
                            </Dragger>
                        </SectionCard>
                    </div>
                </Col>

                {/* Right Results & Preview Column */}
                <Col xs={24} lg={16}>
                    {/* Stats Summary Panel */}
                    {stats && (
                        <div className="flex flex-col gap-6 mb-6">
                            <SectionCard title="Import Results Summary">
                                <Row gutter={[16, 16]} className="text-center">
                                    <Col xs={12}>
                                        <Card className="bg-emerald-50/50 border-emerald-100/50" bordered={false}>
                                            <Text className="block text-2xl font-bold text-emerald-600">{stats.success}</Text>
                                            <Text className="text-[10px] uppercase font-bold text-zinc-400">Imported Successfully</Text>
                                        </Card>
                                    </Col>
                                    <Col xs={12}>
                                        <Card className="bg-red-50/50 border-red-100/50" bordered={false}>
                                            <Text className="block text-2xl font-bold text-red-600">{stats.failed}</Text>
                                            <Text className="text-[10px] uppercase font-bold text-zinc-400">Failed / Skipped</Text>
                                        </Card>
                                    </Col>
                                </Row>

                                {importLogs.length > 0 && (
                                    <div className="mt-6">
                                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Import Logs</div>
                                        <div className="max-h-60 overflow-y-auto border border-zinc-100 rounded-lg p-3 bg-zinc-50/50 flex flex-col gap-1.5">
                                            {importLogs.map((log, i) => {
                                                const isError = log.includes("Error") || log.includes("does not exist") || log.includes("required") || log.includes("failed");
                                                return (
                                                    <div key={i} className="text-xs flex items-start gap-1.5">
                                                        <Tag color={isError ? "red" : "green"} className="m-0 text-[10px] font-bold rounded">
                                                            {isError ? "ERROR" : "SUCCESS"}
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

                    {/* Preview Table */}
                    {previewData ? (
                        <SectionCard 
                            title={`Preview Rooms to Import (${previewData.length} records)`}
                            right={
                                <Space size={8}>
                                    <Button 
                                        size="small"
                                        danger 
                                        icon={<CloseOutlined />} 
                                        onClick={handleCancelPreview}
                                        disabled={loading}
                                    >
                                        Reset
                                    </Button>
                                    <Button 
                                        size="small"
                                        type="primary" 
                                        icon={<PlayCircleOutlined />} 
                                        loading={loading}
                                        onClick={handleConfirmImport}
                                    >
                                        Import Rooms
                                    </Button>
                                </Space>
                            }
                        >
                            <Table 
                                dataSource={previewData.map((row, idx) => ({ ...row, key: idx }))} 
                                columns={previewColumns} 
                                pagination={{
                                    current: previewPage,
                                    pageSize: previewPageSize,
                                    showSizeChanger: true,
                                    onChange: (p, s) => {
                                        setPreviewPage(p);
                                        setPreviewPageSize(s);
                                    }
                                }} 
                                size="small"
                                className="border border-zinc-100 rounded-lg overflow-hidden"
                            />
                        </SectionCard>
                    ) : (
                        !stats && (
                            <Card className="flex items-center justify-center p-12 text-center" bordered={false}>
                                <Empty 
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div className="flex flex-col gap-1.5">
                                            <Text className="font-semibold text-zinc-700">No import file loaded</Text>
                                            <Text className="text-zinc-400 text-xs">Select a Temple and upload a completed template to preview room configurations here.</Text>
                                        </div>
                                    } 
                                />
                            </Card>
                        )
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default RoomImport;
