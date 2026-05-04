// import React, { useState } from "react";
// import { Upload, Button, message } from "antd";
// import { UploadOutlined } from "@ant-design/icons";

// const FileUpload = ({ value, onChange, accept = "image/*,application/pdf,.csv" }) => {
//     const [fileList, setFileList] = useState([]);

//     const handleBeforeUpload = (file) => {
//         // Stop automatic AntD Post upload
//         return false;
//     };

//     const handleChange = ({ fileList: newFileList }) => {
//         setFileList(newFileList);
//         if (onChange) {
//             // Expose Raw File back into parent Form value space
//             onChange(newFileList.length > 0 ? newFileList[0].originFileObj : null);
//         }
//     };

//     return (
//         <Upload
//             beforeUpload={handleBeforeUpload}
//             fileList={fileList}
//             onChange={handleChange}
//             accept={accept}
//             maxCount={1}
//         >
//             <Button icon={<UploadOutlined />}>Select File</Button>
//         </Upload>
//     );
// };

// export default FileUpload;


import React, { useEffect, useState } from "react";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const FileUpload = ({ value = [], onChange, accept = "image/*" }) => {
  const [fileList, setFileList] = useState([]);

  // 🔥 sync edit value → upload UI
  useEffect(() => {
    if (value && Array.isArray(value)) {
      setFileList(value);
    }
  }, [value]);

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // 🔥 send full fileList (not raw file)
    onChange?.(newFileList);
  };

  return (
    <Upload
      fileList={fileList}
      onChange={handleChange}
      beforeUpload={() => false}
      accept={accept}
      listType="picture-card"
      maxCount={1}
    >
      {fileList.length === 0 && (
        <Button icon={<UploadOutlined />}>Upload</Button>
      )}
    </Upload>
  );
};

export default FileUpload;