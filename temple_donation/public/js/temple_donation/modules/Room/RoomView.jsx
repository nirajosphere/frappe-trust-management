import React from "react";
import { Row, Col, Alert, Tag, Button } from "antd";
import { Home, ShieldAlert, FileText, CheckCircle2, Bed } from "lucide-react";
import { useFrappeGetDoc, useFrappeGetDocList } from "../../hooks/useFrappe";
import { DOCTYPE_ROOM } from "../../config/constants";
import PageLoader from "../../components/common/PageLoader";
import { getTagConfig } from "../../utils/tagUtils";
import DetailHeader from "../../components/common/DetailHeader";
import SectionCard from "../../components/common/SectionCard";
import FieldCell from "../../components/common/FieldCell";
import ViewContainer from "../../components/common/ViewContainer";
import ActivityLog from "../../components/common/ActivityLog";

const RoomView = ({ id, onBack, onEdit }) => {
    const { data: doc, loading, error } = useFrappeGetDoc(DOCTYPE_ROOM, id);
    const { data: temples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    if (loading) return <PageLoader />;

    if (error || !doc) {
        return (
            <div className="p-8">
                <Alert
                    message="Could not load room details"
                    description={error?.message || "Room not found"}
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

    const typeTag = getTagConfig(doc.room_type === "AC" ? "super admin" : doc.room_type === "Non-AC" ? "default" : "manager");
    const statusTag = getTagConfig(doc.status === "Available" ? "active" : doc.status === "Occupied" ? "inactive" : "default");

    const templeObj = temples?.find(t => t.name === doc.temple);
    const templeName = templeObj ? templeObj.temple_name : (doc.temple || "Global");

    return (
        <ViewContainer className="room-view-container">
            {/* ── TOP HERO HEADER ── */}
            <DetailHeader
                onBack={onBack}
                title={`Room ${doc.room_number}`}
                subtitle={`Temple: ${templeName}`}
                initials="R"
                tags={[doc.room_type]}
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
                        <SectionCard title="Room Information" icon={<Home size={15} className="text-zinc-800" />}>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Room Number">
                                        <span className="text-zinc-800 font-semibold">{doc.room_number}</span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Temple">
                                        <span className="text-zinc-800 font-semibold">{templeName}</span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Room Type">
                                        <Tag className={`tag-glass ${typeTag.glassClass} font-bold rounded-full !m-0`}>
                                            {doc.room_type || "—"}
                                        </Tag>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Capacity (Beds / Persons)">
                                        <span className="text-zinc-800 font-semibold">{doc.capacity || "—"}</span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Price / Day">
                                        <span className="text-xl font-bold text-zinc-900">₹{Number(doc.price_per_day || 0).toLocaleString()}</span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Current Status">
                                        <Tag className={`tag-glass ${statusTag.glassClass} font-bold rounded-full !m-0`}>
                                            {doc.status || "—"}
                                        </Tag>
                                    </FieldCell>
                                </Col>
                            </Row>
                        </SectionCard>
                    </div>
                </Col>

                {/* Right Meta Parameters Panel */}
                <Col xs={24} lg={7}>
                    <div className="sticky top-6 flex flex-col gap-6">
                        {/* Summary Card */}
                        <SectionCard title="Room Summary" icon={<Bed size={15} className="text-zinc-800" />}>
                            <div className="flex flex-col gap-3 py-1">
                                {[
                                    {
                                        label: "Current Status", value: (
                                            <Tag className={`tag-glass ${statusTag.glassClass} !m-0`}>
                                                {doc.status || "N/A"}
                                            </Tag>
                                        )
                                    },
                                    {
                                        label: "Capacity", value: (
                                            <span className="text-xs font-semibold text-zinc-800">
                                                {doc.capacity || 0} Persons
                                            </span>
                                        )
                                    },
                                    {
                                        label: "Rate / Day", value: (
                                            <span className="text-xs font-bold text-emerald-600">
                                                ₹{Number(doc.price_per_day || 0).toLocaleString()}
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

                        {/* System Security Tracking Logs */}
                        <SectionCard title="System Logs" icon={<FileText size={15} className="text-zinc-800" />}>
                            <div className="flex flex-col gap-2 py-1">
                                 {[
                                    { label: "Document ID", value: <span className="font-mono text-[11px] font-semibold text-zinc-500 bg-zinc-50 px-2.5 py-0.5 rounded border border-zinc-100">{id}</span> },
                                    { label: "Created By", value: <span className="text-xs font-semibold text-zinc-600">{doc.owner || "System"}</span> },
                                    { label: "Created At", value: <span className="text-xs font-semibold text-zinc-600">{doc.creation ? new Date(doc.creation).toLocaleDateString() : "—"}</span> },
                                    { label: "Last Modified", value: <span className="text-xs font-semibold text-zinc-600">{doc.modified ? new Date(doc.modified).toLocaleDateString() : "—"}</span> }
                                ].map(({ label, value }) => (
                                    <div key={label} className={label === "Document ID" ? "flex flex-col gap-1 w-full" : "flex justify-between items-center gap-4 w-full"}>
                                        <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">{label}</span>
                                        {label === "Document ID" ? (
                                            <div className="w-full flex justify-start">{value}</div>
                                        ) : (
                                            value
                                        )}
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
            <ActivityLog doctype={DOCTYPE_ROOM} docname={id} />
        </ViewContainer>
    );
};

export default RoomView;
