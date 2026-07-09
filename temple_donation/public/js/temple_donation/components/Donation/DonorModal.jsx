// import React, { useEffect } from "react";
// import { Modal, Form, Input, message, Typography, Space } from "antd";
// import { UserAddOutlined, ProfileOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from "@ant-design/icons";
// import { useFrappeCreateDoc } from "../../hooks/useFrappe";

// const { Text } = Typography;

// const DonorModal = ({ open, onCancel, onSuccess, initialMobileNumber }) => {
//     const [form] = Form.useForm();
//     const { createDoc, loading } = useFrappeCreateDoc();

//     useEffect(() => {
//         if (open && initialMobileNumber) {
//             form.setFieldsValue({ mobile_number: initialMobileNumber });
//         } else if (open) {
//             form.resetFields();
//         }
//     }, [open, initialMobileNumber]);

//     const handleSubmit = async () => {
//         try {
//             const values = await form.validateFields();
//             await createDoc("Donor", values);
//             message.success("Donor added successfully");
//             form.resetFields();
//             onSuccess(values);
//         } catch (error) {
//             console.error("Failed to add donor:", error);
//             message.error(error.message || "Failed to add donor");
//         }
//     };

//     return (
//         <Modal
//             title={
//                 <Space>
//                     <UserAddOutlined className="text-primary" />
//                     <span className="font-bold">Register New Donor</span>
//                 </Space>
//             }
//             open={open}
//             onCancel={onCancel}
//             onOk={handleSubmit}
//             confirmLoading={loading}
//             okText="Register Donor"
//             cancelText="Cancel"
//             centered
//             width={500}
//             className="custom-modal"
//             okButtonProps={{
//                 className: "bg-primary border-none h-10 px-6 rounded-lg font-bold shadow-sm hover:bg-primary-hover",
//             }}
//             cancelButtonProps={{
//                 className: "h-10 rounded-lg px-6"
//             }}
//         >
//             <div className="py-4">
//                 <Text type="secondary" className="block mb-6 text-sm italic">
//                     Fill in the details below to create a permanent donor profile in the system.
//                 </Text>

//                 <Form form={form} layout="vertical" requiredMark="optional">
//                     <Form.Item
//                         name="donor_name"
//                         label={<Text strong className="text-gray-600">Full Name</Text>}
//                         rules={[{ required: true, message: "Please enter donor name" }]}
//                     >
//                         <Input
//                             placeholder="e.g. Rajesh Kumar"
//                             prefix={<ProfileOutlined className="text-gray-400" />}
//                             className="h-11 "
//                         />
//                     </Form.Item>

//                     <Form.Item
//                         name="mobile_number"
//                         label={<Text strong className="text-gray-600">Mobile Number</Text>}
//                         rules={[
//                             { required: true, message: "Please enter mobile number" },
//                             { pattern: /^\d{10}$/, message: "Please enter a valid 10-digit mobile number" }
//                         ]}
//                     >
//                         <Input
//                             placeholder="10-digit number"
//                             prefix={<PhoneOutlined className="text-gray-400" />}
//                             className="h-11  font-medium"
//                         />
//                     </Form.Item>

//                     <Form.Item
//                         name="email"
//                         label={<Text strong className="text-gray-600">Email Address (Optional)</Text>}
//                     >
//                         <Input
//                             placeholder="email@example.com"
//                             prefix={<MailOutlined className="text-gray-400" />}
//                             className="h-11 "
//                         />
//                     </Form.Item>

//                     <Form.Item
//                         name="address"
//                         label={<Text strong className="text-gray-600">Resident Address (Optional)</Text>}
//                     >
//                         <Input.TextArea
//                             placeholder="Enter full address"
//                             rows={3}
//                             prefix={<HomeOutlined className="text-gray-400" />}
//                             className=""
//                         />
//                     </Form.Item>
//                 </Form>
//             </div>
//         </Modal>
//     );
// };

// export default DonorModal;


import React, { useEffect } from "react";
import { Modal, Form, Input, message } from "antd";
import { useFrappeCreateDoc } from "../../hooks/useFrappe";

const DonorModal = ({ open, onCancel, onSuccess, initialMobileNumber }) => {
    const [form] = Form.useForm();
    const { createDoc, loading } = useFrappeCreateDoc();

    // 👉 Prefill mobile number
    useEffect(() => {
        if (open) {
            if (initialMobileNumber) {
                form.setFieldsValue({
                    mobile_number: initialMobileNumber
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, initialMobileNumber, form]);

    // 👉 Submit handler
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const res = await createDoc("Donor", values);

            form.resetFields();
            onSuccess(res);

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Modal
            title="Add New Donor"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Save"
            cancelText="Cancel"
            width={450}
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
            >
                {/* Name */}
                <Form.Item
                    name="donor_name"
                    label="Full Name"
                    rules={[
                        { required: true, message: "Please enter donor name" }
                    ]}
                >
                    <Input placeholder="Enter full name" />
                </Form.Item>

                {/* Mobile */}
                <Form.Item
                    name="mobile_number"
                    label="Mobile Number"
                    rules={[
                        { required: true, message: "Enter mobile number" },
                        { pattern: /^\d{10}$/, message: "Enter valid 10-digit number" }
                    ]}
                >
                    <Input
                        maxLength={10}
                        placeholder="10-digit number"
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            form.setFieldsValue({ mobile_number: val });
                        }}
                    />
                </Form.Item>

                {/* Email */}
                <Form.Item
                    name="email"
                    label="Email (Optional)"
                    rules={[
                        { type: "email", message: "Enter valid email" }
                    ]}
                >
                    <Input placeholder="example@gmail.com" />
                </Form.Item>

                {/* Address */}
                <Form.Item
                    name="address"
                    label="Address (Optional)"
                >
                    <Input.TextArea
                        rows={3}
                        placeholder="Enter address"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DonorModal;