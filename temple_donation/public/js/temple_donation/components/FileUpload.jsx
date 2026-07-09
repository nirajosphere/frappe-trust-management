import React, { useEffect, useState } from "react";
import { Upload, Button, Typography, message } from "antd";
import { 
    UploadOutlined, 
    FileImageOutlined, 
    FilePdfOutlined, 
    FileExcelOutlined, 
    FileOutlined, 
    CloudUploadOutlined,
    DeleteOutlined
} from "@ant-design/icons";

const { Text } = Typography;

const getFileInfo = (fileName, url) => {
    const nameToTest = (fileName && fileName.includes(".")) ? fileName : (url || fileName || "");
    if (!nameToTest) return { icon: <FileOutlined />, color: "#64748b", type: "file" };
    
    const cleanName = nameToTest.split("?")[0].split("#")[0];
    const ext = cleanName.split('.').pop().toLowerCase();
    
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
        return { icon: <FileImageOutlined />, color: "#3b82f6", type: "image" };
    }
    if (ext === "pdf") {
        return { icon: <FilePdfOutlined />, color: "#ef4444", type: "pdf" };
    }
    if (["xls", "xlsx", "csv"].includes(ext)) {
        return { icon: <FileExcelOutlined />, color: "#10b981", type: "excel" };
    }
    return { icon: <FileOutlined />, color: "#64748b", type: "file" };
};

const FileUpload = ({ 
    value, 
    onChange, 
    accept = "image/*,application/pdf,.csv,.xls,.xlsx",
    maxCount = 1,
    listType = "picture-card",
    placeholder = "Upload File",
    description = "Supports images, PDFs, CSVs, and Excel",
    icon
}) => {
    const [fileList, setFileList] = useState([]);
    const [previewUrls, setPreviewUrls] = useState({});

    // Sync value from parent form to internal fileList
    useEffect(() => {
        if (!value) {
            setFileList([]);
            return;
        }

        let normalizedList = [];
        if (Array.isArray(value)) {
            normalizedList = value.map((item, idx) => {
                if (typeof item === "string") {
                    const fileName = item.split("/").pop();
                    return { uid: String(-idx - 1), name: fileName, status: "done", url: item };
                }
                return item;
            });
        } else if (typeof value === "string") {
            const fileName = value.split("/").pop();
            normalizedList = [{ uid: "-1", name: fileName, status: "done", url: value }];
        } else if (value && typeof value === "object") {
            normalizedList = [value];
        }

        setFileList(normalizedList);
    }, [value]);

    // Handle local blob URL generation for previews
    useEffect(() => {
        const newUrls = {};
        fileList.forEach(file => {
            if (file.url) {
                newUrls[file.uid] = file.url;
            } else if (file.thumbUrl) {
                newUrls[file.uid] = file.thumbUrl;
            } else if (file.originFileObj) {
                newUrls[file.uid] = URL.createObjectURL(file.originFileObj);
            }
        });
        setPreviewUrls(newUrls);

        // Cleanup blob URLs on change or unmount
        return () => {
            Object.values(newUrls).forEach(url => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [fileList]);

    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        if (onChange) {
            onChange(newFileList);
        }
    };

    // Custom renderer for picture-card listType
    const renderUploadButton = () => {
        if (fileList.length >= maxCount) return null;

        if (listType === "picture-card") {
            return (
                <div style={{
                    width: '130px',
                    height: '130px',
                    borderRadius: '12px',
                    border: '2px dashed #cbd5e1',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                }} className="hover:border-zinc-400 hover:bg-zinc-50">
                    {icon || <CloudUploadOutlined style={{ fontSize: '24px', color: '#64748b' }} />}
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#334155', textAlign: 'center' }}>
                        {placeholder}
                    </div>
                    {description && (
                        <div style={{ fontSize: '9px', color: '#94a3b8', textAlign: 'center', padding: '0 8px', lineHeight: '1.2' }}>
                            {description}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Button icon={icon || <UploadOutlined />}>
                {placeholder}
            </Button>
        );
    };

    // Custom card previews for files that are not images, or when listType is picture-card
    const renderPreviews = () => {
        if (fileList.length === 0) return null;

        if (listType === "picture-card") {
            return (
                <>
                    {fileList.map((file) => {
                        const fileUrl = previewUrls[file.uid] || "";
                        const { icon: typeIcon, color, type } = getFileInfo(file.name, fileUrl);

                        return (
                            <div 
                                key={file.uid}
                                style={{
                                    width: '130px',
                                    height: '130px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f8fafc',
                                    padding: '8px',
                                    overflow: 'hidden',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {/* Remove button */}
                                <div 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedList = fileList.filter(f => f.uid !== file.uid);
                                        handleChange({ fileList: updatedList });
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '6px',
                                        right: '6px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        zIndex: 10,
                                        border: '1px solid #e2e8f0'
                                    }}
                                    className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                    <DeleteOutlined style={{ fontSize: '12px' }} />
                                </div>

                                {/* Render image preview or file type icon */}
                                {type === "image" && fileUrl ? (
                                    <img 
                                        src={fileUrl} 
                                        alt={file.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '8px'
                                        }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%', padding: '4px' }}>
                                        <div style={{ fontSize: '32px', color }}>
                                            {typeIcon}
                                        </div>
                                        <Text 
                                            style={{ 
                                                fontSize: '11px', 
                                                fontWeight: 500, 
                                                color: '#334155',
                                                textAlign: 'center',
                                                width: '100%',
                                                display: 'block'
                                            }} 
                                            ellipsis={{ tooltip: file.name }}
                                        >
                                            {file.name}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </>
            );
        }

        return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                {fileList.map((file) => {
                    const fileUrl = previewUrls[file.uid] || "";
                    const { icon: typeIcon, color } = getFileInfo(file.name, fileUrl);

                    return (
                        <div 
                            key={file.uid}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #f1f5f9',
                                backgroundColor: '#f8fafc'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ fontSize: '16px', color }}>{typeIcon}</div>
                                <Text style={{ fontSize: '12px', color: '#334155' }}>{file.name}</Text>
                            </div>
                            <DeleteOutlined 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const updatedList = fileList.filter(f => f.uid !== file.uid);
                                    handleChange({ fileList: updatedList });
                                }}
                                style={{ color: '#94a3b8', cursor: 'pointer' }}
                                className="hover:text-red-500 transition-colors"
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={{ 
            width: '100%', 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px', 
            justifyContent: 'center', 
            alignItems: 'center' 
        }}>
            {renderPreviews()}
            {fileList.length < maxCount && (
                <Upload
                    accept={accept}
                    fileList={fileList}
                    onChange={handleChange}
                    beforeUpload={() => false}
                    showUploadList={false}
                    maxCount={maxCount}
                >
                    {renderUploadButton()}
                </Upload>
            )}
        </div>
    );
};

export default FileUpload;