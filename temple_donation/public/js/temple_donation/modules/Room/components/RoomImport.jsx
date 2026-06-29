import React, { useState } from "react";
import { Card, Select, Button, Upload, Typography, Alert, Space, Table, notification } from "antd";
import { DownloadOutlined, InboxOutlined } from "@ant-design/icons";
import { useFrappeGetDocList } from "../../../hooks/useFrappe";

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;

const RoomImport = () => {
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [importLogs, setImportLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    // Fetch Temples
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    const handleDownloadTemplate = () => {
        if (typeof window !== "undefined") {
            window.open("/api/method/temple_donation.api.room_booking.download_room_import_template");
        }
    };

    const handleUpload = (file) => {
        if (!selectedTemple) {
            notification.warning({ message: "Please select a Temple first before uploading." });
            return false;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvContent = e.target.result;
            performImport(csvContent);
        };
        reader.readAsText(file);
        return false; // Prevent auto-upload by AntD
    };

    const performImport = (csvContent) => {
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
                csv_content: csvContent,
                temple: selectedTemple
            },
            callback: (r) => {
                setLoading(false);
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

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 0" }}>
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
                    <Button 
                        type="dashed" 
                        icon={<DownloadOutlined />} 
                        onClick={handleDownloadTemplate}
                    >
                        Download Sample Template
                    </Button>
                </div>

                <div style={{ marginBottom: "24px" }}>
                    <Text strong style={{ display: "block", marginBottom: "8px" }}>Select Destination Temple</Text>
                    <Select 
                        showSearch 
                        placeholder="Select Temple to Import Rooms Into"
                        style={{ width: "100%" }}
                        optionFilterProp="children"
                        loading={loadingTemples}
                        onChange={(val) => setSelectedTemple(val)}
                        options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                    />
                </div>

                <Dragger 
                    accept=".csv"
                    beforeUpload={handleUpload}
                    showUploadList={false}
                    disabled={!selectedTemple || loading}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag CSV file to this area to import</p>
                    <p className="ant-upload-hint">
                        {!selectedTemple 
                            ? "Please select a destination temple above first." 
                            : "Support for single CSV file containing room records."}
                    </p>
                </Dragger>

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
