import React from "react";
import { Typography, Space, Button, Input } from "antd";
import { ArrowLeftOutlined, PlusOutlined, DownloadOutlined, SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * Robust, Modular Page Header Component
 * Handles both Form headers (with back) and Listing headers (with actions)
 */
const PageHeader = ({ 
    title, 
    subtitle, 
    description, // Used in listing
    onBack, 
    onAdd, 
    addLabel = "Add New",
    onExport, 
    onSearch, 
    searchPlaceholder = "Search...",
    extra // Used for custom action buttons (Print, Edit, etc)
}) => {
    return (
        <header className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Space size={16} align="start">
                    {onBack && (
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={onBack}
                            className="h-10 w-10 flex items-center justify-center hover:text-black border-zinc-200 transition-all font-bold mt-1"
                        />
                    )}
                    <div>
                        {subtitle && (
                            <Text className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                                {subtitle}
                            </Text>
                        )}
                        <Title level={2} className="!m-0 font-bold tracking-tight text-zinc-900 leading-none">
                            {title}
                        </Title>
                        {description && (
                            <Text className="text-zinc-400 text-sm mt-1 block">
                                {description}
                            </Text>
                        )}
                    </div>
                </Space>

                {/* Actions Section */}
                <div className="flex items-center gap-3">
                    {onSearch && (
                        <Input
                            placeholder={searchPlaceholder}
                            prefix={<SearchOutlined className="text-zinc-400" />}
                            onChange={(e) => onSearch(e.target.value)}
                            className="h-10 w-full md:w-64 border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white rounded-xl font-medium"
                        />
                    )}
                    
                    {onExport && (
                        <Button 
                            icon={<DownloadOutlined />} 
                            onClick={onExport}
                            className="h-10 px-4 border-zinc-200 text-zinc-600 font-bold rounded-xl"
                        >
                            Export
                        </Button>
                    )}

                    {onAdd && (
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={onAdd}
                            className="h-10 px-6 bg-black hover:bg-zinc-800 border-none shadow-md shadow-zinc-200 font-bold rounded-xl tracking-tight"
                        >
                            {addLabel}
                        </Button>
                    )}

                    {extra && <div className="flex items-center gap-3">{extra}</div>}
                </div>
            </div>
        </header>
    );
};

export default PageHeader;
