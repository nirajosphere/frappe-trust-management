import React from "react";
import { Typography, Space, Button, Input, Dropdown } from "antd";
import { ArrowLeftOutlined, PlusOutlined, DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import FilterPopover from "./FilterPopover";
import ColumnsPopover from "./ColumnsPopover";
import SortPopover from "./SortPopover";

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
    allowExport = true,
    exportOptions = ["csv", "excel", "pdf"],
    onSearch,
    searchPlaceholder = "Search...",
    extra, // Used for custom action buttons (Print, Edit, etc)
    columns, // Passed from ListingPage for dynamic filter field list
    doctype, // The database DocType name
    appliedFilters,
    onApplyFilters, // Callback for dynamic filters: (filtersArray) => void
    appliedSorters,
    onApplySorters, // Callback for dynamic multi-column sorting: (sortersArray) => void
    savedViews,
    onRefreshViews,
    customizedColumns,
    onSaveColumns
}) => {
    // Filter export dropdown options based on the exportOptions prop
    const defaultItems = [
        { key: "csv", label: "Export to CSV" },
        { key: "excel", label: "Export to Excel" },
        { key: "pdf", label: "Export to PDF" }
    ];

    const menuItems = exportOptions && Array.isArray(exportOptions)
        ? defaultItems.filter(item => exportOptions.includes(item.key))
        : defaultItems;

    return (
        <header className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                    {onBack && (
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={onBack}
                            className="h-10 w-10 flex items-center justify-center hover:text-black border-zinc-200 transition-all font-bold mt-1 flex-shrink-0"
                        />
                    )}
                    <div className="min-w-0">
                        {subtitle && (
                            <Text className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                                {subtitle}
                            </Text>
                        )}
                        <Title level={2} className="!m-0 font-bold tracking-tight text-zinc-900 leading-none break-words">
                            {title}
                        </Title>
                        {description && (
                            <Text className="text-zinc-400 text-sm mt-1 block break-words">
                                {description}
                            </Text>
                        )}
                    </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
                    {onSearch && (
                        <Input
                            placeholder={searchPlaceholder}
                            prefix={<SearchOutlined className="text-zinc-400" />}
                            onChange={(e) => onSearch(e.target.value)}
                            className="h-10 w-full sm:w-[280px] border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white font-medium"
                        />
                    )}

                    {onApplyFilters && (
                        <FilterPopover 
                            columns={columns} 
                            doctype={doctype}
                            appliedFilters={appliedFilters}
                            onApplyFilters={onApplyFilters}
                            appliedSorters={appliedSorters}
                            savedViews={savedViews}
                            onRefreshViews={onRefreshViews}
                        />
                    )}

                    {onApplySorters && (
                        <SortPopover 
                            columns={columns}
                            appliedSorters={appliedSorters}
                            onApplySorters={onApplySorters}
                        />
                    )}

                    {customizedColumns && onSaveColumns && (
                        <ColumnsPopover 
                            customizedColumns={customizedColumns}
                            onSaveColumns={onSaveColumns}
                            originalColumns={columns}
                            doctype={doctype}
                        />
                    )}

                    {onExport && allowExport && menuItems.length > 0 && (
                        <Dropdown
                            menu={{
                                items: menuItems,
                                onClick: ({ key }) => onExport(key)
                            }}
                            trigger={["click"]}
                            placement="bottomRight"
                        >
                            <Button
                                icon={<DownloadOutlined />}
                                className="h-10 px-4 border-zinc-200 text-zinc-600 font-bold"
                            >
                                {/* Export */}
                            </Button>
                        </Dropdown>
                    )}

                    {onAdd && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={onAdd}
                            className="h-10 px-6 bg-black font-bold"
                        >
                            {addLabel}
                        </Button>
                    )}

                    {extra && <div className="flex flex-wrap items-center gap-3">{extra}</div>}
                </div>
            </div>
        </header>
    );
};

export default PageHeader;
