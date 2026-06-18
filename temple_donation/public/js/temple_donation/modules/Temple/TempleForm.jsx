// import React, { useEffect, useState } from "react";
// import {
//     Form, Input, Button, Alert, Switch, List, Avatar, Row, Col, Typography, Card, Space
// } from "antd";
// import {
//     HomeOutlined, EnvironmentOutlined, GlobalOutlined, PushpinOutlined,
//     InfoCircleOutlined, FileTextOutlined, BankOutlined, AppstoreOutlined, SearchOutlined
// } from "@ant-design/icons";
// import {
//     useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc, useFrappeGetDocList
// } from "../../hooks/useFrappe";
// import { DOCTYPE_TEMPLE, DOCTYPE_DONATION_TYPE } from "../../config/constants";
// import AddPageHeader from "../../components/common/AddPageHeader";
// import ActivityLog from "../../components/common/ActivityLog";
// import PageLoader from "../../components/common/PageLoader";
// import FormFooter from "../../components/common/FormFooter";

// const { Text } = Typography;

// const TempleForm = ({ id, onBack }) => {
//     const isEdit = !!id;
//     const [form] = Form.useForm();
//     const [selectedDonationTypes, setSelectedDonationTypes] = useState([]);
//     const [searchQuery, setSearchQuery] = useState("");

//     // --- Frappe API Hooks ---
//     const { createDoc, loading: creating } = useFrappeCreateDoc();
//     const { updateDoc, loading: updating } = useFrappeUpdateDoc();
//     const { data, loading, error } = useFrappeGetDoc(DOCTYPE_TEMPLE, id);
//     const { data: donationTypes } = useFrappeGetDocList(DOCTYPE_DONATION_TYPE, {
//         fields: ["name", "donation_type", "donation_image"]
//     });

//     // --- Form Watchers for Live Preview Panel ---
//     const templeName = Form.useWatch("temple_name", form) || "";
//     const templeId   = Form.useWatch("temple_id",   form) || "";
//     const initials   = templeName
//         ? templeName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
//         : "T";

//     // --- Effect for Form Setup and Binding ---
//     useEffect(() => {
//         if (isEdit && data) {
//             form.setFieldsValue(data);
//             if (data.donation_types && Array.isArray(data.donation_types) && data.donation_types.length > 0) {
//                 setSelectedDonationTypes(data.donation_types.map(d => d.donation_type));
//             } else if (data.dontatio_type) {
//                 setSelectedDonationTypes([data.dontatio_type]);
//             }
//         } else {
//             form.setFieldsValue({ country: "India", state: "Gujarat" });
//         }
//     }, [isEdit, data, form]);

//     // --- Form Submission Logic ---
//     const handleSave = async (values) => {
//         try {
//             const payload = {
//                 ...values,
//                 donation_types: selectedDonationTypes.map(name => ({
//                     doctype: "Temple Donation Type",
//                     donation_type: name
//                 }))
//             };
//             if (isEdit) await updateDoc(DOCTYPE_TEMPLE, id, payload);
//             else        await createDoc(DOCTYPE_TEMPLE, payload);
//             if (onBack) onBack();
//         } catch (err) {
//             console.error("Save Error:", err);
//         }
//     };

//     const toggleDonationType = (name) => {
//         setSelectedDonationTypes(prev =>
//             prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
//         );
//     };

//     // --- Search & Filter Logic ---
//     const filteredDonationTypes = donationTypes?.filter(item => 
//         item.donation_type?.toLowerCase().includes(searchQuery.toLowerCase())
//     ) || [];

//     const allSelected = filteredDonationTypes.length > 0 && filteredDonationTypes.every(d => selectedDonationTypes.includes(d.name));

//     const handleSelectAllChange = (checked) => {
//         if (checked) {
//             const filteredIds = filteredDonationTypes.map(d => d.name);
//             setSelectedDonationTypes(prev => Array.from(new Set([...prev, ...filteredIds])));
//         } else {
//             const filteredIds = filteredDonationTypes.map(d => d.name);
//             setSelectedDonationTypes(prev => prev.filter(id => !filteredIds.includes(id)));
//         }
//     };

//     if (isEdit && loading) return <PageLoader />;
//     if (isEdit && error)   return <Alert message="Error loading data" type="error" />;

//     const formItemStyle = { marginBottom: '14px' };

//     // Clean Minimal Card Configuration
//     const commonCardProps = {
//         size: "small",
//         className: "shadow-sm border border-zinc-200 rounded-xl overflow-hidden",
//         style: { 
//             background: '#ffffff',
//             marginBottom: '0px'
//         },
//         headStyle: {
//             background: '#f4f4f5',
//             borderBottom: '1px solid #e4e4e7',
//             paddingTop: '10px',
//             paddingBottom: '10px'
//         },
//         bodyStyle: {
//             padding: '16px'
//         }
//     };

//     return (
//         <div className="donation-page py-4" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
//             <AddPageHeader
//                 onBack={onBack}
//                 title={isEdit ? "Edit Temple" : "Add Temple"}
//                 subtitle="Temple Management Portal"
//                 showBack={true}
//             />

//             <Form layout="vertical" form={form} onFinish={handleSave} requiredMark={false} size="middle">
//                 {/* alignment tweaked to push clean symmetric distribution */}
//                 <Row gutter={[20, 20]} align="stretch">

//                     {/* ================= LEFT COLUMN: Core Profile & Administrative Details ================= */}
//                     <Col xs={24} md={12} lg={14}>
//                         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
//                             {/* Temple Meta Profile Header */}
//                             <Card {...commonCardProps} title={<Space><BankOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Temple Profile</span></Space>}>
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 0' }}>
//                                     <Avatar 
//                                         size={64} 
//                                         style={{ 
//                                             fontSize: 22, 
//                                             fontWeight: 800, 
//                                             border: '1px solid #e4e4e7', 
//                                             backgroundColor: '#18181b', 
//                                             color: '#fff',
//                                             flexShrink: 0
//                                         }}
//                                     >
//                                         {initials}
//                                     </Avatar>
                                    
//                                     <div style={{ flexGrow: 1, minWidth: 0 }}>
//                                         <div style={{ fontSize: '15px', fontWeight: 600, color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                                             {templeName || "Temple Identity"}
//                                         </div>
//                                         {templeId && (
//                                             <div style={{ fontSize: '11px', color: '#71717a', marginTop: 2, fontWeight: 500 }}>
//                                                 System ID: {templeId}
//                                             </div>
//                                         )}
//                                         <div style={{ marginTop: 6 }}>
//                                             <span style={{ fontSize: '10px', color: '#18181b', backgroundColor: '#f4f4f5', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
//                                                 {selectedDonationTypes.length} Selected
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </Card>

//                             {/* Main Details Fields */}
//                             <Card {...commonCardProps} title={<Space><InfoCircleOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Primary Details</span></Space>}>
//                                 <Row gutter={[12, 0]}>
//                                     <Col xs={24} sm={12}>
//                                         <Form.Item name="temple_name" label="Temple Name" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
//                                             <Input prefix={<BankOutlined style={{ color: '#a1a1aa' }} />} placeholder="Full Temple Name" />
//                                         </Form.Item>
//                                     </Col>
//                                     <Col xs={24} sm={12}>
//                                         <Form.Item name="temple_id" label="Temple ID" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
//                                             <Input prefix={<InfoCircleOutlined style={{ color: '#a1a1aa' }} />} placeholder="Unique Identifier" />
//                                         </Form.Item>
//                                     </Col>
//                                     <Col xs={24}>
//                                         <Form.Item name="trust_registration_no" label="Trust Registration No." style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
//                                             <Input prefix={<FileTextOutlined style={{ color: '#a1a1aa' }} />} placeholder="Trust Registration Number" />
//                                         </Form.Item>
//                                     </Col>
//                                     <Col xs={24}>
//                                         <Form.Item name="note" label="Internal Notes" style={formItemStyle}>
//                                             <Input prefix={<FileTextOutlined style={{ color: '#a1a1aa' }} />} placeholder="Optional verification details" />
//                                         </Form.Item>
//                                     </Col>
//                                 </Row>
//                             </Card>

//                             {/* Geographic Information Fields */}
//                             <Card {...commonCardProps} title={<Space><EnvironmentOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Location Details</span></Space>}>
//                                 <Row gutter={[12, 0]}>
//                                     <Col xs={24}>
//                                         <Form.Item name="temple_address" label="Street Address" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
//                                             <Input prefix={<HomeOutlined style={{ color: '#a1a1aa' }} />} placeholder="Full Physical Location Address" />
//                                         </Form.Item>
//                                     </Col>
//                                     <Col xs={24} sm={8}>
//                                         <Form.Item name="country" label="Country" style={formItemStyle} rules={[{ required: true }]}>
//                                             <Input prefix={<GlobalOutlined style={{ color: '#a1a1aa' }} />} placeholder="India" />
//                                         </Form.Item>
//                                     </Col>
//                                     <Col xs={24} sm={8}>
//                                         <Form.Item name="state" label="State" style={formItemStyle} rules={[{ required: true }]}>
//                                             <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="State" />
//                                         </Form.Item>
//                                     </Col>
//                                     <Col xs={24} sm={8}>
//                                         <Form.Item name="city" label="City" style={formItemStyle} rules={[{ required: true }]}>
//                                             <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="City" />
//                                         </Form.Item>
//                                     </Col>
//                                     <Col xs={24}>
//                                         <Form.Item name="pincode" label="Postal Pin Code" style={{ marginBottom: '4px' }} rules={[{ required: true }]}>
//                                             <Input prefix={<PushpinOutlined style={{ color: '#a1a1aa' }} />} placeholder="6-Digit Postal Code" />
//                                         </Form.Item>
//                                     </Col>
//                                 </Row>
//                             </Card>
//                         </div>
//                     </Col>

//                     {/* ================= RIGHT COLUMN: Scrollable Matrix Panel ================= */}
//                     <Col xs={24} md={12} lg={10}>
//                         <Card 
//                             {...commonCardProps} 
//                             style={{ ...commonCardProps.style, height: '100%', display: 'flex', flexDirection: 'column' }}
//                             bodyStyle={{ ...commonCardProps.bodyStyle, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
//                             title={<Space><AppstoreOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Donation Types Matrix</span></Space>}
//                             extra={filteredDonationTypes.length > 0 && (
//                                 <Space size={6}>
//                                     <span style={{ fontSize: '11px', fontWeight: 700, color: '#52525b', letterSpacing: '0.02em' }}>SELECT ALL</span>
//                                     <Switch size="small" checked={allSelected} onChange={handleSelectAllChange} className={allSelected ? "bg-zinc-800" : "bg-zinc-200"} />
//                                 </Space>
//                             )}
//                         >
//                             {/* Filter Bar */}
//                             <div style={{ marginBottom: '12px' }}>
//                                 <Input
//                                     placeholder="Filter by category title..."
//                                     prefix={<SearchOutlined style={{ color: '#a1a1aa' }} />}
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     allowClear
//                                     style={{ borderRadius: '6px' }}
//                                 />
//                             </div>

//                             {/* Highly Responsive Dynamic Scroll Area */}
//                             <div style={{ 
//                                 flexGrow: 1,
//                                 minHeight: '440px',
//                                 maxHeight: '580px', 
//                                 overflowY: 'auto', 
//                                 border: '1px solid #e4e4e7',
//                                 borderRadius: '8px',
//                                 padding: '6px 10px'
//                             }}>
//                                 <List
//                                     dataSource={filteredDonationTypes}
//                                     locale={{ emptyText: "No specific categories matched" }}
//                                     renderItem={item => {
//                                         const active = selectedDonationTypes.includes(item.name);
//                                         return (
//                                             <List.Item
//                                                 className="px-2 py-2 rounded-md my-0.5 hover:bg-zinc-50 transition-all"
//                                                 style={{ borderBottom: '1px solid #f4f4f5' }}
//                                                 actions={[
//                                                     <Switch size="small" checked={active} onChange={() => toggleDonationType(item.name)} className={active ? "bg-zinc-800" : "bg-zinc-200"} />
//                                                 ]}
//                                             >
//                                                 <List.Item.Meta
//                                                     avatar={
//                                                         <Avatar 
//                                                             src={item.donation_image} 
//                                                             shape="square" 
//                                                             size={36} 
//                                                             style={{ 
//                                                                 backgroundColor: '#f4f4f5', 
//                                                                 border: '1px solid #e4e4e7', 
//                                                                 color: '#18181b', 
//                                                                 fontWeight: 700,
//                                                                 borderRadius: '4px'
//                                                             }}
//                                                         >
//                                                             {item.donation_type?.charAt(0)}
//                                                         </Avatar>
//                                                     }
//                                                     title={<Text strong style={{ color: '#27272a', fontSize: '13px' }}>{item.donation_type}</Text>}
//                                                 />
//                                             </List.Item>
//                                         );
//                                     }}
//                                 />
//                             </div>
//                         </Card>
//                     </Col>

//                 </Row>

//                 {/* Footer Controls Alignment */}
//                 <div style={{ marginTop: '20px' }}>
//                     <FormFooter
//                         onCancel={onBack}
//                         loading={creating || updating}
//                         isEdit={isEdit}
//                         saveText={isEdit ? "Update Temple" : "Add Temple"}
//                     />
//                 </div>
//             </Form>

//             {isEdit && <ActivityLog doctype={DOCTYPE_TEMPLE} docname={id} />}
//         </div>
//     );
// };

// export default TempleForm;

import React, { useEffect, useState } from "react";
import {
    Form, Input, Button, Alert, Switch, List, Avatar, Row, Col, Typography, Card, Space
} from "antd";
import {
    HomeOutlined, EnvironmentOutlined, GlobalOutlined, PushpinOutlined,
    InfoCircleOutlined, FileTextOutlined, BankOutlined, AppstoreOutlined, SearchOutlined
} from "@ant-design/icons";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_TEMPLE, DOCTYPE_DONATION_TYPE } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import ActivityLog from "../../components/common/ActivityLog";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";

const { Text } = Typography;

const TempleForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();
    const [selectedDonationTypes, setSelectedDonationTypes] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // --- Frappe API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_TEMPLE, id);
    const { data: donationTypes } = useFrappeGetDocList(DOCTYPE_DONATION_TYPE, {
        fields: ["name", "donation_type", "donation_image"]
    });

    // --- Form Watchers for Live Preview Panel ---
    const templeName = Form.useWatch("temple_name", form) || "";
    const templeId   = Form.useWatch("temple_id",   form) || "";
    const initials   = templeName
        ? templeName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "T";

    // --- Effect for Form Setup and Binding ---
    useEffect(() => {
        if (isEdit && data) {
            form.setFieldsValue(data);
            if (data.donation_types && Array.isArray(data.donation_types) && data.donation_types.length > 0) {
                setSelectedDonationTypes(data.donation_types.map(d => d.donation_type));
            } else if (data.dontatio_type) {
                setSelectedDonationTypes([data.dontatio_type]);
            }
        } else {
            form.setFieldsValue({ country: "India", state: "Gujarat" });
        }
    }, [isEdit, data, form]);

    // --- Form Submission Logic ---
    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                donation_types: selectedDonationTypes.map(name => ({
                    doctype: "Temple Donation Type",
                    donation_type: name
                }))
            };
            if (isEdit) await updateDoc(DOCTYPE_TEMPLE, id, payload);
            else        await createDoc(DOCTYPE_TEMPLE, payload);
            if (onBack) onBack();
        } catch (err) {
            console.error("Save Error:", err);
        }
    };

    const toggleDonationType = (name) => {
        setSelectedDonationTypes(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    // --- Search & Filter Logic ---
    const filteredDonationTypes = donationTypes?.filter(item => 
        item.donation_type?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const allSelected = filteredDonationTypes.length > 0 && filteredDonationTypes.every(d => selectedDonationTypes.includes(d.name));

    const handleSelectAllChange = (checked) => {
        if (checked) {
            const filteredIds = filteredDonationTypes.map(d => d.name);
            setSelectedDonationTypes(prev => Array.from(new Set([...prev, ...filteredIds])));
        } else {
            const filteredIds = filteredDonationTypes.map(d => d.name);
            setSelectedDonationTypes(prev => prev.filter(id => !filteredIds.includes(id)));
        }
    };

    if (isEdit && loading) return <PageLoader />;
    if (isEdit && error)   return <Alert message="Error loading data" type="error" />;

    const formItemStyle = { marginBottom: '14px' };

    // Clean Minimal Card Configuration
    const commonCardProps = {
        size: "small",
        className: "shadow-sm border border-zinc-200 overflow-hidden",
        style: { 
            background: '#ffffff',
            marginBottom: '0px'
        },
        headStyle: {
            background: '#f4f4f5',
            borderBottom: '1px solid #e4e4e7',
            paddingTop: '10px',
            paddingBottom: '10px'
        },
        bodyStyle: {
            padding: '16px'
        }
    };

    return (
        <div className="donation-page py-4" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Temple" : "Add Temple"}
                subtitle="Temple Management Portal"
                showBack={true}
            />

            <Form layout="vertical" form={form} onFinish={handleSave} requiredMark={false} size="middle">
                {/* Hata diya align="stretch" taaki cards unnecessary stretch na ho */}
                <Row gutter={[20, 20]}>

                    {/* ================= LEFT COLUMN: Core Profile & Administrative Details ================= */}
                    <Col xs={24} md={12} lg={14}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            {/* Temple Meta Profile Header */}
                            <Card {...commonCardProps} title={<Space><BankOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Temple Profile</span></Space>}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 0' }}>
                                    <Avatar 
                                        size={64} 
                                        style={{ 
                                            fontSize: 22, 
                                            fontWeight: 800, 
                                            border: '1px solid #e4e4e7', 
                                            backgroundColor: '#18181b', 
                                            color: '#fff',
                                            flexShrink: 0
                                        }}
                                    >
                                        {initials}
                                    </Avatar>
                                    
                                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {templeName || "Temple Identity"}
                                        </div>
                                        {templeId && (
                                            <div style={{ fontSize: '11px', color: '#71717a', marginTop: 2, fontWeight: 500 }}>
                                                System ID: {templeId}
                                            </div>
                                        )}
                                        <div style={{ marginTop: 6 }}>
                                            <span style={{ fontSize: '10px', color: '#18181b', backgroundColor: '#f4f4f5', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                                {selectedDonationTypes.length} Selected
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Main Details Fields */}
                            <Card {...commonCardProps} title={<Space><InfoCircleOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Primary Details</span></Space>}>
                                <Row gutter={[12, 0]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="temple_name" label="Temple Name" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<BankOutlined style={{ color: '#a1a1aa' }} />} placeholder="Full Temple Name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="temple_id" label="Temple ID" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<InfoCircleOutlined style={{ color: '#a1a1aa' }} />} placeholder="Unique Identifier" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item name="trust_registration_no" label="Trust Registration No." style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<FileTextOutlined style={{ color: '#a1a1aa' }} />} placeholder="Trust Registration Number" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item name="note" label="Internal Notes" style={formItemStyle}>
                                            <Input prefix={<FileTextOutlined style={{ color: '#a1a1aa' }} />} placeholder="Optional verification details" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Geographic Information Fields */}
                            <Card {...commonCardProps} title={<Space><EnvironmentOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Location Details</span></Space>}>
                                <Row gutter={[12, 0]}>
                                    <Col xs={24}>
                                        <Form.Item name="temple_address" label="Street Address" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<HomeOutlined style={{ color: '#a1a1aa' }} />} placeholder="Full Physical Location Address" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="country" label="Country" style={formItemStyle} rules={[{ required: true }]}>
                                            <Input prefix={<GlobalOutlined style={{ color: '#a1a1aa' }} />} placeholder="India" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="state" label="State" style={formItemStyle} rules={[{ required: true }]}>
                                            <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="State" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="city" label="City" style={formItemStyle} rules={[{ required: true }]}>
                                            <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="City" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item name="pincode" label="Postal Pin Code" style={{ marginBottom: '4px' }} rules={[{ required: true }]}>
                                            <Input prefix={<PushpinOutlined style={{ color: '#a1a1aa' }} />} placeholder="6-Digit Postal Code" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </div>
                    </Col>

                    {/* ================= RIGHT COLUMN: Self-Healing Adaptive Matrix Panel ================= */}
                    <Col xs={24} md={12} lg={10}>
                        <Card 
                            {...commonCardProps} 
                            style={{ ...commonCardProps.style, height: 'auto' }} // Height to auto taaki content size ke hisab se scale kare
                            title={<Space><AppstoreOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Donation Types Matrix</span></Space>}
                            extra={filteredDonationTypes.length > 0 && (
                                <Space size={6}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#52525b', letterSpacing: '0.02em' }}>SELECT ALL</span>
                                    <Switch size="small" checked={allSelected} onChange={handleSelectAllChange} className={allSelected ? "bg-zinc-800" : "bg-zinc-200"} />
                                </Space>
                            )}
                        >
                            {/* Filter Bar */}
                            <div style={{ marginBottom: '12px' }}>
                                <Input
                                    placeholder="Filter by category title..."
                                    prefix={<SearchOutlined style={{ color: '#a1a1aa' }} />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    allowClear
                                    style={{ borderRadius: '6px' }}
                                />
                            </div>

                            {/* Content limits wrapper: Chhote list pe clean wrap karega, bade hone par hi scroll layega */}
                            <div style={{ 
                                maxHeight: '580px', 
                                overflowY: 'auto', 
                                border: '1px solid #e4e4e7',
                                borderRadius: '8px',
                                padding: '6px 10px'
                            }}>
                                <List
                                    dataSource={filteredDonationTypes}
                                    locale={{ emptyText: "No specific categories matched" }}
                                    renderItem={item => {
                                        const active = selectedDonationTypes.includes(item.name);
                                        return (
                                            <List.Item
                                                className="px-2 py-2 rounded-md my-0.5 hover:bg-zinc-50 transition-all"
                                                style={{ borderBottom: '1px solid #f4f4f5' }}
                                                actions={[
                                                    <Switch size="small" checked={active} onChange={() => toggleDonationType(item.name)} className={active ? "bg-zinc-800" : "bg-zinc-200"} />
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar 
                                                            src={item.donation_image} 
                                                            shape="square" 
                                                            size={36} 
                                                            style={{ 
                                                                backgroundColor: '#f4f4f5', 
                                                                border: '1px solid #e4e4e7', 
                                                                color: '#18181b', 
                                                                fontWeight: 700,
                                                                borderRadius: '4px'
                                                            }}
                                                        >
                                                            {item.donation_type?.charAt(0)}
                                                        </Avatar>
                                                    }
                                                    title={<Text strong style={{ color: '#27272a', fontSize: '13px' }}>{item.donation_type}</Text>}
                                                />
                                            </List.Item>
                                        );
                                    }}
                                />
                            </div>
                        </Card>
                    </Col>

                </Row>

                {/* Footer Controls Alignment */}
                <div style={{ marginTop: '20px' }}>
                    <FormFooter
                        onCancel={onBack}
                        loading={creating || updating}
                        isEdit={isEdit}
                        saveText={isEdit ? "Update Temple" : "Add Temple"}
                    />
                </div>
            </Form>

            {isEdit && <ActivityLog doctype={DOCTYPE_TEMPLE} docname={id} />}
        </div>
    );
};

export default TempleForm;