import React from "react";
import { Row, Col, Alert, Tag, Button, Table } from "antd";
import { History, ShieldAlert, FileText, CheckCircle2, List } from "lucide-react";
import dayjs from "dayjs";
import { useFrappeGetDoc } from "../../hooks/useFrappe";
import { DOCTYPE_INVENTORY_ENTRY } from "../../config/constants";
import PageLoader from "../../components/common/PageLoader";
import { getTagConfig } from "../../utils/tagUtils";
import DetailHeader from "../../components/common/DetailHeader";
import SectionCard from "../../components/common/SectionCard";
import FieldCell from "../../components/common/FieldCell";
import ViewContainer from "../../components/common/ViewContainer";
import ActivityLog from "../../components/common/ActivityLog";

const InventoryEntryView = ({ id, onBack, onEdit }) => {
    const { data: doc, loading, error } = useFrappeGetDoc(DOCTYPE_INVENTORY_ENTRY, id);

    if (loading) return <PageLoader />;

    if (error || !doc) {
        return (
            <div className="p-8">
                <Alert
                    message="Could not load stock entry details"
                    description={error?.message || "Stock entry not found"}
                    type="error"
                    showIcon
                    action={
                        <Button
                            onClick={onBack}
                            className="h-9 rounded-lg border-zinc-200 text-zinc-700 hover:!border-zinc-900 hover:!text-zinc-900"
                        >
                            Back
                        </Button>
                    }
                />
            </div>
        );
    }

    const typeTag = getTagConfig(doc.entry_type === "IN" ? "active" : "inactive");
    const refTag = getTagConfig(doc.reference_type || "Manual");

    const itemColumns = [
        {
            title: "Item",
            dataIndex: "item",
            key: "item",
            render: (text) => <span className="font-semibold text-zinc-800">{text}</span>
        },
        {
            title: "Quantity",
            dataIndex: "qty",
            key: "qty",
            align: "right",
            render: (qty) => <span className="font-bold text-zinc-900">{qty}</span>
        }
    ];

    return (
        <ViewContainer className="stock-entry-view-container">
            {/* ── TOP HERO HEADER ── */}
            <DetailHeader
                onBack={onBack}
                title={`Stock Entry: ${doc.name}`}
                subtitle={`Posting Date: ${doc.posting_date ? dayjs(doc.posting_date).format("DD-MM-YYYY HH:mm:ss") : "—"}`}
                initials={doc.entry_type || "S"}
                tags={[doc.entry_type]}
                actions={
                    <>
                        <Button
                            onClick={() => window.print()}
                            className="px-4 border border-zinc-200 text-zinc-700 font-medium hover:border-zinc-400 shadow-none text-sm transition-all flex items-center gap-1.5 bg-white"
                        >
                            Print
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => onEdit && onEdit(doc)}
                            className="px-4 bg-zinc-900 border-zinc-900 text-white font-medium hover:!bg-zinc-800 hover:!border-zinc-800 shadow-none text-sm transition-all flex items-center gap-1.5"
                        >
                            Edit
                        </Button>
                    </>
                }
            />

            {/* ── TWO COLUMN GRID WORKSURFACE ── */}
            <Row gutter={[24, 24]}>
                {/* Left Main View Columns */}
                <Col xs={24} lg={17}>
                    <div className="flex flex-col gap-6">
                        {/* Basic Info */}
                        <SectionCard title="Entry Details" icon={<History size={15} className="text-zinc-800" />}>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Entry Type">
                                        <Tag className={`tag-glass ${typeTag.glassClass} font-bold rounded-full !m-0`}>
                                            {doc.entry_type}
                                        </Tag>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Temple">
                                        <span className="text-zinc-800 font-semibold">{doc.temple || "Global"}</span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Reference Type">
                                        <Tag className={`tag-glass ${refTag.glassClass} font-bold rounded-full !m-0`}>
                                            {doc.reference_type || "Manual"}
                                        </Tag>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Reference Name">
                                        <span className="text-zinc-800 font-semibold">{doc.reference_name || "—"}</span>
                                    </FieldCell>
                                </Col>
                            </Row>
                        </SectionCard>

                        {/* Items Sub-table */}
                        <SectionCard title="Items Details" icon={<List size={15} className="text-zinc-800" />}>
                            <Table
                                dataSource={doc.items || []}
                                columns={itemColumns}
                                rowKey="name"
                                pagination={false}
                                size="small"
                                className="border border-zinc-100 rounded-lg overflow-hidden"
                            />
                        </SectionCard>
                    </div>
                </Col>

                {/* Right Meta Parameters Panel */}
                <Col xs={24} lg={7}>
                    <div className="sticky top-6 flex flex-col gap-6">
                        {/* Reference Summary Card */}
                        <SectionCard title="Reference Details" icon={<ShieldAlert size={15} className="text-zinc-800" />}>
                            <div className="flex flex-col gap-3 py-1">
                                {[
                                    {
                                        label: "Source Type", value: (
                                            <Tag className={`tag-glass ${refTag.glassClass} !m-0`}>
                                                {doc.reference_type || "Manual"}
                                            </Tag>
                                        )
                                    },
                                    {
                                        label: "Source Name", value: (
                                            <span className="text-xs font-mono font-semibold text-zinc-800">
                                                {doc.reference_name || "N/A"}
                                            </span>
                                        )
                                    }
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center gap-4 border-b border-zinc-50 pb-2 last:border-0 last:pb-0">
                                        <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">{label}</span>
                                        {value}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        {/* System Logs */}
                        <SectionCard title="System Logs" icon={<FileText size={15} className="text-zinc-800" />}>
                            <div className="flex flex-col gap-2 py-1">
                                {[
                                    { label: "Document ID", value: <span className="font-mono text-[11px] font-semibold text-zinc-500 bg-zinc-50 px-2.5 py-0.5 rounded border border-zinc-100">{id}</span> },
                                    { label: "Created By", value: <span className="text-xs font-semibold text-zinc-600">{doc.owner || "System"}</span> },
                                    { label: "Created At", value: <span className="text-xs font-semibold text-zinc-600">{doc.creation ? new Date(doc.creation).toLocaleDateString() : "—"}</span> },
                                    { label: "Last Modified", value: <span className="text-xs font-semibold text-zinc-600">{doc.modified ? new Date(doc.modified).toLocaleDateString() : "—"}</span> }
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center gap-4">
                                        <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">{label}</span>
                                        {value}
                                    </div>
                                ))}

                                <div className="w-full border-t border-zinc-100 pt-3 mt-1 text-center">
                                    <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1.5">
                                        <CheckCircle2 size={13} />
                                        Verified System Record
                                    </span>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </Col>
            </Row>
            <ActivityLog doctype={DOCTYPE_INVENTORY_ENTRY} docname={id} />
        </ViewContainer>
    );
};

export default InventoryEntryView;
