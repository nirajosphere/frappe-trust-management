import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const FileUpload = ({ value, onChange, accept = "image/*,application/pdf,.csv" }) => {
    const [fileList, setFileList] = useState([]);

    const handleBeforeUpload = (file) => {
        // Stop automatic AntD Post upload
        return false;
    };

    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        if (onChange) {
            // Expose Raw File back into parent Form value space
            onChange(newFileList.length > 0 ? newFileList[0].originFileObj : null);
        }
    };

    return (
        <Upload
            beforeUpload={handleBeforeUpload}
            fileList={fileList}
            onChange={handleChange}
            accept={accept}
            maxCount={1}
        >
            <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
    );
};

export default FileUpload;
