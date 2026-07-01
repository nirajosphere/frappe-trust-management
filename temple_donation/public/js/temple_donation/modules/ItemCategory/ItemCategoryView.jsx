import React from "react";
import { Row, Col, Alert, Tag, Button } from "antd";
import { Folder, FileText } from "lucide-react";
import { useFrappeGetDoc } from "../../hooks/useFrappe";
import { DOCTYPE_ITEM_CATEGORY } from "../../config/constants";
import PageLoader from "../../components/common/PageLoader";
import { getTagConfig } from "../../utils/tagUtils";
import DetailHeader from "../../components/common/DetailHeader";
import SectionCard from "../../components/common/SectionCard";
import FieldCell from "../../components/common/FieldCell";
import ViewContainer from "../../components/common/ViewContainer";

const ItemCategoryView = ({ id, onBack, onEdit }) => {
    const { data: doc, loading, error } = useFrappeGetDoc(DOCTYPE_ITEM_CATEGORY, id);

    if (loading) return <PageLoader />;

    if (error || !doc) {
        return (
            <div className="p-8">
                <Alert
                    message="Could not load item category details"
                    description={error?.message || "Item category not found"}
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

    const activeConfig = getTagConfig(doc.active ? "active" : "inactive");

    return (
        <ViewContainer className="item-category-view-container">
            {/* ── TOP HERO HEADER ── */}
            <DetailHeader
                onBack={onBack}
                title={doc.category_name}
                subtitle={`Document ID: ${doc.name}`}
                initials={doc.category_name?.charAt(0).toUpperCase() || "C"}
                tags={[doc.active ? "Active" : "Inactive"]}
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
                        <SectionCard title="Category Information" icon={<Folder size={15} className="text-zinc-800" />}>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Category Name">
                                        <span className="text-zinc-800 font-semibold">{doc.category_name}</span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Status">
                                        <Tag className={`tag-glass ${activeConfig.glassClass} font-bold rounded-full !m-0`}>
                                            {doc.active ? "Active" : "Inactive"}
                                        </Tag>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={24}>
                                    <FieldCell label="Description">
                                        <span className="text-zinc-600" style={{ whiteSpace: "pre-wrap" }}>
                                            {doc.description || "No description provided."}
                                        </span>
                                    </FieldCell>
                                </Col>
                            </Row>
                        </SectionCard>
                    </div>
                </Col>

                {/* Right Metadata Sidebar */}
                <Col xs={24} lg={7}>
                    <div className="flex flex-col gap-6">
                        <SectionCard title="System Information" icon={<FileText size={15} className="text-zinc-800" />}>
                            <div className="flex flex-col gap-4 text-xs">
                                <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                                    <span className="text-zinc-400 font-medium uppercase tracking-wider text-[10px]">Owner</span>
                                    <span className="text-zinc-700 font-semibold">{doc.owner}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                                    <span className="text-zinc-400 font-medium uppercase tracking-wider text-[10px]">Created At</span>
                                    <span className="text-zinc-700 font-semibold">
                                        {new Date(doc.creation).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-zinc-400 font-medium uppercase tracking-wider text-[10px]">Last Modified</span>
                                    <span className="text-zinc-700 font-semibold">
                                        {new Date(doc.modified).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </Col>
            </Row>
        </ViewContainer>
    );
};

export default ItemCategoryView;
