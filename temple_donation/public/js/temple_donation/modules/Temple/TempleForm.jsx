// import React, { useEffect, useState } from "react";
// import {
//     Form, Input, Button, Card, Typography, Space, Row, Col,
//     message, Spin, Alert, List, Avatar
// } from "antd";
// import { ArrowLeftOutlined, SaveOutlined, CheckCircleFilled } from "@ant-design/icons";
// import {
//     useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc, useFrappeGetDocList
// } from "../../hooks/useFrappe";
// import { DOCTYPE_TEMPLE, DOCTYPE_DONATION_TYPE } from "../../config/constants";
// import { templeFormFields } from "../../formfield/templeFormFields";
// import PageHeader from "../../components/common/PageHeader";

// const { Title, Text } = Typography;

// const TempleForm = ({ id, onBack }) => {
//     const isEdit = !!id;
//     const [form] = Form.useForm();
//     const [selectedDonationTypes, setSelectedDonationTypes] = useState([]);

//     const { createDoc, loading: creating } = useFrappeCreateDoc();
//     const { updateDoc, loading: updating } = useFrappeUpdateDoc();
//     const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_TEMPLE, id);
//     const { data: allDonationTypes, loading: loadingDTypes } = useFrappeGetDocList(DOCTYPE_DONATION_TYPE, {
//         fields: ["name", "donation_type", "donation_image"]
//     });

//     useEffect(() => {
//         if (isEdit && initialValues) {
//             form.setFieldsValue(initialValues);
//             if (initialValues.donation_types) {
//                 setSelectedDonationTypes(initialValues.donation_types.map(dt => dt.donation_type));
//             }
//         } else if (!isEdit) {
//             const defaultValues = {};
//             templeFormFields.fields.forEach(f => {
//                 if (f.defaultValue) defaultValues[f.name] = f.defaultValue;
//             });
//             form.setFieldsValue(defaultValues);
//             setSelectedDonationTypes([]);
//         }
//     }, [isEdit, initialValues, form]);

//     const handleSave = async (values) => {
//         try {
//             const formData = {
//                 ...values,
//                 donation_types: selectedDonationTypes.map(name => ({ donation_type: name }))
//             };

//             if (isEdit) {
//                 await updateDoc(DOCTYPE_TEMPLE, id, formData);
//                 message.success("Temple updated successfully!");
//             } else {
//                 await createDoc(DOCTYPE_TEMPLE, formData);
//                 message.success("Temple created successfully!");
//             }
//             if (onBack) onBack();
//         } catch (err) {
//             message.error(err.message || "Something went wrong.");
//         }
//     };

//     const toggleDonationType = (typeName) => {
//         setSelectedDonationTypes(prev =>
//             prev.includes(typeName)
//                 ? prev.filter(t => t !== typeName)
//                 : [...prev, typeName]
//         );
//     };

//     if (isEdit && fetching) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
//                 <Spin size="large" />
//                 <Text className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading temple data...</Text>
//             </div>
//         );
//     }

//     if (isEdit && fetchError) {
//         return (
//             <div className="p-8">
//                 <Alert
//                     message="Identification Error"
//                     description={fetchError.message || "Failed to fetch temple details."}
//                     type="error"
//                     showIcon
//                     action={<Button onClick={onBack} icon={<ArrowLeftOutlined />}>Return</Button>}
//                 />
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-4xl mx-auto py-6 pb-20">
//             <PageHeader
//                 onBack={onBack}
//                 subtitle="Operational Infrastructure"
//                 title={isEdit ? `Configure ${initialValues?.temple_name || 'Temple'}` : "Register New Temple"}
//             />

//             <Form
//                 form={form}
//                 layout="vertical"
//                 onFinish={handleSave}
//                 scrollToFirstError
//                 requiredMark={false}
//             >
//                 <Card size="small" className="aavatto-card mb-8">
//                     <Text className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-900 block mb-6 px-4">Entity Details</Text>
//                     <Row gutter={[24, 0]} className="px-4">
//                         {templeFormFields.fields.map((field) => (
//                             <Col xs={24} md={field.type === 'textarea' ? 24 : 12} key={field.name}>
//                                 <Form.Item
//                                     name={field.name}
//                                     label={<Text strong className="text-zinc-500 uppercase text-[10px] tracking-widest">{field.label}</Text>}
//                                     rules={[
//                                         { required: field.required, message: field.message }
//                                     ].filter(Boolean)}
//                                 >
//                                     {field.type === 'textarea' ? (
//                                         <Input.TextArea
//                                             placeholder={field.placeholder}
//                                             rows={field.rows || 3}
//                                             className="border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all rounded-lg p-3"
//                                         />
//                                     ) : (
//                                         <Input
//                                             placeholder={field.placeholder}
//                                             className="h-10 border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all rounded-lg px-4 font-medium"
//                                         />
//                                     )}
//                                 </Form.Item>
//                             </Col>
//                         ))}
//                     </Row>
//                 </Card>

//                 <Card size="small" className="aavatto-card mb-10">
//                     <Text className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-900 block mb-6 px-4">Enabled Donation Categories</Text>
//                     <div className="px-4 pb-4">
//                         <List
//                             loading={loadingDTypes}
//                             grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
//                             dataSource={allDonationTypes}
//                             renderItem={item => {
//                                 const isSelected = selectedDonationTypes.includes(item.name);
//                                 return (
//                                     <List.Item>
//                                         <div
//                                             onClick={() => toggleDonationType(item.name)}
//                                             className={`
//                                                 p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3
//                                                 ${isSelected
//                                                     ? 'border-zinc-900 bg-black text-white'
//                                                     : 'border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-300'}
//                                             `}
//                                         >
//                                             <Avatar
//                                                 src={item.donation_image}
//                                                 shape="circle"
//                                                 size="small"
//                                                 className={isSelected ? 'border-zinc-700' : 'border-white'}
//                                             />
//                                             <div className="flex-1 min-w-0">
//                                                 <Text className={`block text-xs font-bold truncate tracking-tight ${isSelected ? 'text-white' : 'text-zinc-800'}`}>
//                                                     {item.donation_type}
//                                                 </Text>
//                                             </div>
//                                             {isSelected && <CheckCircleFilled className="text-white text-xs" />}
//                                         </div>
//                                     </List.Item>
//                                 );
//                             }}
//                         />
//                     </div>
//                 </Card>

//                 <div className="flex items-center justify-end gap-3 rounded-2xl bg-white p-6 border-2 border-zinc-100 shadow-xl shadow-zinc-100/20">
//                     <Button
//                         onClick={onBack}
//                         className="h-10 px-8 font-bold border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all text-[10px] uppercase tracking-widest bg-transparent"
//                     >
//                         Cancel
//                     </Button>
//                     <Button
//                         type="primary"
//                         htmlType="submit"
//                         loading={creating || updating}
//                         icon={<SaveOutlined />}
//                         className="h-10 px-10 font-bold bg-black hover:bg-zinc-800 border-none shadow-md flex items-center gap-2 text-[10px] uppercase tracking-widest"
//                     >
//                         {isEdit ? "Synchronize Configuration" : "Initialize Entity"}
//                     </Button>
//                 </div>
//             </Form>
//         </div>
//     );
// };

// export default TempleForm;

import React, { useEffect, useState } from "react";
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Row,
    Col,
    message,
    Spin,
    Alert
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";

import {
    useFrappeCreateDoc,
    useFrappeUpdateDoc,
    useFrappeGetDoc,
    useFrappeGetDocList
} from "../../hooks/useFrappe";

import { DOCTYPE_TEMPLE, DOCTYPE_DONATION_TYPE } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";

const { Text } = Typography;

const TempleForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();
    const [selectedDonationTypes, setSelectedDonationTypes] = useState([]);

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_TEMPLE, id);

    const { data: donationTypes } = useFrappeGetDocList(
        DOCTYPE_DONATION_TYPE,
        { fields: ["name", "donation_type"] }
    );

    // 👉 Prefill
    useEffect(() => {
        if (isEdit && data) {
            form.setFieldsValue(data);

            if (data.donation_types) {
                setSelectedDonationTypes(
                    data.donation_types.map(d => d.donation_type)
                );
            }
        } else {
            form.setFieldsValue({
                country: "India",
                state: "Gujarat"
            });
        }
    }, [isEdit, data]);

    // 👉 Save
    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                donation_types: selectedDonationTypes.map(name => ({
                    donation_type: name
                }))
            };

            if (isEdit) {
                await updateDoc(DOCTYPE_TEMPLE, id, payload);
                message.success("Temple updated");
            } else {
                await createDoc(DOCTYPE_TEMPLE, payload);
                message.success("Temple created");
            }

            onBack && onBack();
        } catch (err) {
            message.error("Error saving");
        }
    };

    const toggleDonationType = (name) => {
        setSelectedDonationTypes(prev =>
            prev.includes(name)
                ? prev.filter(n => n !== name)
                : [...prev, name]
        );
    };

    // 👉 Loading
    if (isEdit && loading) return <Spin />;

    if (isEdit && error) {
        return <Alert message="Error loading data" type="error" />;
    }

    return (
        <div className="max-w-6xl mx-auto p-4">

            {/* HEADER */}
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Temple" : "Add Temple"}
                subtitle="Temple Management"
            />

            <Form layout="vertical" form={form} onFinish={handleSave}>

                {/* 🔥 FORM */}
                <Card className="border border-zinc-200 rounded-xl mb-6">

                    <Row gutter={[16, 0]}>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="temple_name" label="Temple Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>

                        {/* <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="temple_id" label="Temple ID" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col> */}

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="trust_registration_no" label="Trust Registration No" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>



                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="country" label="Country">
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="state" label="State" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="city" label="City" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="pincode" label="Pincode" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Form.Item name="temple_address" label="Temple Address" rules={[{ required: true }]}>
                                <Input.TextArea rows={3} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Form.Item name="note" label="Note">
                                <Input.TextArea rows={3} />
                            </Form.Item>
                        </Col>

                    </Row>

                </Card>

                {/* 🔥 DONATION TYPES */}
                <Card className="border border-zinc-200 rounded-xl mb-6">

                    <Text strong className="block mb-3">Donation Types</Text>

                    <div className="flex flex-wrap gap-2">
                        {donationTypes?.map(item => {
                            const active = selectedDonationTypes.includes(item.name);

                            return (
                                <div
                                    key={item.name}
                                    onClick={() => toggleDonationType(item.name)}
                                    className={`px-4 py-2 border rounded-md cursor-pointer
                                    ${active ? "bg-black text-white border-black" : "bg-white border-zinc-300"}`}
                                >
                                    {item.donation_type}
                                </div>
                            );
                        })}
                    </div>

                </Card>

                {/* 🔥 BUTTONS */}
                <div className="flex justify-end gap-2">

                    <Button onClick={onBack}>
                        Cancel
                    </Button>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={creating || updating}
                        icon={<SaveOutlined />}
                    >
                        {isEdit ? "Update" : "Save"}
                    </Button>

                </div>

            </Form>
        </div>
    );
};

export default TempleForm;