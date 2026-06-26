// import React from "react";
// import { Button, Space, Typography } from "antd";
// import {
//     ArrowLeftOutlined,
//     RedoOutlined,
//     EditOutlined,
//     PlusOutlined
// } from "@ant-design/icons";

// const { Text, Title } = Typography;

// const AddPageHeader = ({
//     title = "Page Title",
//     subtitle,
//     onBack,
//     onReset,
//     onEdit,
//     onAdd,

//     showBack = true,
//     showReset = false,
//     showEdit = false,
//     showAdd = false,

//     disableReset = false
// }) => {
//     return (
//         <div className="flex items-center justify-between mb-6 border-b border-zinc-200 pb-4">

//             {/* LEFT */}
//             {/* <div className="flex items-center gap-3">

//                 {showBack && (
//                     <Button
//                         icon={<ArrowLeftOutlined />}
//                         onClick={onBack || (() => window.history.back())}
//                         className="h-10 w-10 border border-zinc-200"
//                     />
//                 )}

//                 <div>
//                     <Title level={3} className="!m-0">
//                         {title}
//                     </Title>
//                     {subtitle && (
//                         <Text className="text-[10px] text-zinc-400 block">
//                             {subtitle}
//                         </Text>
//                     )}
//                 </div>
//             </div> */}
//             <div className="flex items-center gap-4">

//                 {showBack && (
//                     <Button
//                         type="default"
//                         icon={<ArrowLeftOutlined />}
//                         onClick={onBack || (() => window.history.back())}
//                         className="flex items-center justify-center h-9 w-9 border border-zinc-200 hover:border-zinc-400"
//                     />
//                 )}

//                 <div className="flex flex-col">
//                     <Title level={4} className="!m-0 leading-tight">
//                         {title}
//                     </Title>
//                     {subtitle && (
//                         <Text className="text-xs text-zinc-400 leading-tight">
//                             {subtitle}
//                         </Text>
//                     )}
//                 </div>

//             </div>
//             {/* RIGHT */}
//             <Space>

//                 {showAdd && (
//                     <Button
//                         icon={<PlusOutlined />}
//                         onClick={onAdd}
//                         className="h-10 border border-zinc-200"
//                     >
//                         Add
//                     </Button>
//                 )}

//                 {showEdit && (
//                     <Button
//                         icon={<EditOutlined />}
//                         onClick={onEdit}
//                         className="h-10 border border-zinc-200"
//                     >
//                         Edit
//                     </Button>
//                 )}

//                 {showReset && (
//                     <Button
//                         icon={<RedoOutlined />}
//                         onClick={onReset}
//                         disabled={disableReset}
//                         className="h-10 border border-zinc-200"
//                     >
//                         Reset
//                     </Button>
//                 )}

//             </Space>
//         </div>
//     );
// };

// export default AddPageHeader;

import React from "react";
import { Button, Space, Typography } from "antd";
import { ArrowLeft } from "lucide-react"; // Sleek, modern design library
import {
    RedoOutlined,
    EditOutlined,
    PlusOutlined
} from "@ant-design/icons";

const { Text, Title } = Typography;

const AddPageHeader = ({
    title = "Page Title",
    subtitle,
    onBack,
    onReset,
    onEdit,
    onAdd,

    showBack = true,
    showReset = false,
    showEdit = false,
    showAdd = false,

    disableReset = false
}) => {
    return (
        <div className="flex items-center justify-between mb-6 border-b border-zinc-100">

            {/* LEFT SECTION */}
            <div className="flex items-center gap-4">
                {showBack && (
                    <Button
                        type="default"
                        icon={<ArrowLeft size={16} strokeWidth={2.5} className="transition-transform group-hover:-translate-x-0.5 duration-200" />}
                        onClick={onBack || (() => window.history.back())}
                        className="group flex items-center justify-center h-9 w-9 border border-zinc-200 hover:border-zinc-400 bg-white hover:bg-zinc-50 text-zinc-700 transition-all shadow-none"
                    />
                )}

                <div className="flex flex-col">
                    <Title level={4} className="!m-0 !font-bold text-zinc-900 tracking-tight leading-none mb-1">
                        {title}
                    </Title>
                    {subtitle && (
                        <Text className="text-xs text-zinc-400 font-medium tracking-wide">
                            {subtitle}
                        </Text>
                    )}
                </div>
            </div>

            {/* RIGHT SECTION */}
            <Space size={8}>
                {showAdd && (
                    <Button
                        icon={<PlusOutlined className="text-xs" />}
                        onClick={onAdd}
                        className="h-9 px-4 border border-zinc-200 text-zinc-700 font-medium hover:border-zinc-400  shadow-none text-sm transition-all"
                    >
                        Add
                    </Button>
                )}

                {showEdit && (
                    <Button
                        icon={<EditOutlined className="text-xs" />}
                        onClick={onEdit}
                        className="h-9 px-4 border border-zinc-200 text-zinc-700 font-medium hover:border-zinc-400  shadow-none text-sm transition-all"
                    >
                        Edit
                    </Button>
                )}

                {showReset && (
                    <Button
                        icon={<RedoOutlined className="text-xs" />}
                        onClick={onReset}
                        disabled={disableReset}
                        className="h-9 px-4 border border-zinc-200 text-zinc-700 font-medium hover:border-zinc-400  shadow-none text-sm transition-all disabled:bg-zinc-50 disabled:text-zinc-300"
                    >
                        Reset
                    </Button>
                )}
            </Space>
        </div>
    );
};

export default AddPageHeader;