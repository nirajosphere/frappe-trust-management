import React from "react";
import { Row, Col, Alert, Tag, Button } from "antd";
import { User, ShieldAlert, FileText, CheckCircle2, Heart } from "lucide-react";
import { useFrappeGetDoc, useFrappeGetDocList } from "../../hooks/useFrappe";
import { DOCTYPE_TEMPLE } from "../../config/constants";
import { templeFormFields } from "../../formfield/templeFormFields";
import PageLoader from "../../components/common/PageLoader";
import { getTagConfig } from "../../utils/tagUtils";
import DetailHeader from "../../components/common/DetailHeader";
import SectionCard from "../../components/common/SectionCard";
import FieldCell from "../../components/common/FieldCell";
import ViewContainer from "../../components/common/ViewContainer";
import ActivityLog from "../../components/common/ActivityLog";

const TempleView = ({ id, onBack, onEdit }) => {
  const { data: doc, loading, error } = useFrappeGetDoc(DOCTYPE_TEMPLE, id);
  const { data: donationTypes } = useFrappeGetDocList("Donation Type", {
    fields: ["name", "donation_type", "donation_image", "default_amount"],
    limit: 1000
  });

  if (loading) return <PageLoader />;

  if (error || !doc) {
    return (
      <div className="p-8">
        <Alert
          message="Could not load trust details"
          description={error?.message || "Trust not found"}
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

  const visibleFields = (templeFormFields.fields || []).filter(field => {
    const val = doc[field.name];
    return val !== null && val !== undefined && val !== "" && !(Array.isArray(val) && val.length === 0);
  });

  const renderValue = (field, value) => {
    const empty = value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
    if (empty) return <span className="text-zinc-300 font-medium">—</span>;

    if (field.type === "image")
      return <img src={value} alt={field.label} className="w-14 h-14 object-cover rounded-lg border border-zinc-200" />;

    if (field.type === "textarea")
      return (
        <span className="text-zinc-800 font-semibold whitespace-pre-wrap block">
          {value}
        </span>
      );

    return <span className="text-zinc-800 font-semibold">{String(value)}</span>;
  };

  const title = doc.temple_name || doc.name;
  const initials = title.substring(0, 2).toUpperCase();

  return (
    <ViewContainer className="temple-view-container">
      {/* ── TOP HERO HEADER ── */}
      <DetailHeader
        onBack={onBack}
        title={title}
        subtitle={`Trust ID: ${doc.temple_id || id}`}
        initials={initials}
        tags={doc.custom_status || doc.status ? [doc.custom_status || doc.status] : []}
        actions={
          <>
            {/* <Button
              onClick={() => window.print()}
              className="px-4 border border-zinc-200 text-zinc-700 font-medium hover:border-zinc-400 shadow-none text-sm transition-all flex items-center gap-1.5 bg-white"
            >
              Print
            </Button> */}
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
            <SectionCard title="Basic Information" icon={<User size={15} className="text-zinc-800" />}>
              <Row gutter={[16, 8]}>
                {visibleFields.map((field) => {
                  const isFullWidth = field.type === "image" || field.type === "textarea";
                  return (
                    <Col xs={24} sm={isFullWidth ? 24 : 12} key={field.name}>
                      <FieldCell label={field.label}>
                        {renderValue(field, doc[field.name])}
                      </FieldCell>
                    </Col>
                  );
                })}
              </Row>
            </SectionCard>

            <SectionCard title="Associated Donation Types" icon={<Heart size={15} className="text-zinc-800" />}>
              {doc.donation_types && doc.donation_types.length > 0 ? (
                <Row gutter={[12, 12]}>
                  {doc.donation_types.map((dt) => {
                    const fullDt = donationTypes?.find(item => item.name === dt.donation_type);
                    if (!fullDt) return null;
                    return (
                      <Col xs={24} sm={12} md={8} key={dt.name}>
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 bg-zinc-50/50">
                          {fullDt.donation_image ? (
                            <img 
                              src={fullDt.donation_image} 
                              alt={fullDt.donation_type} 
                              className="w-10 h-10 object-cover rounded border border-zinc-200 bg-white flex-shrink-0" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded border border-zinc-200 bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-400 font-bold text-xs">
                              {fullDt.donation_type?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-zinc-800 truncate">
                              {fullDt.donation_type}
                            </div>
                            {fullDt.default_amount > 0 && (
                              <div className="text-xs text-zinc-500 mt-0.5">
                                Default: ₹{fullDt.default_amount.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <div className="text-center py-6 text-zinc-400 font-medium text-sm">
                  No donation types associated with this trust.
                </div>
              )}
            </SectionCard>
            
          </div>
        </Col>

        {/* Right Meta Parameters Panel */}
        <Col xs={24} lg={7}>
          <div className="sticky top-6 flex flex-col gap-6">
            
            {/* Status Meta Card */}
            <SectionCard title="Status & Meta" icon={<ShieldAlert size={15} className="text-zinc-800" />}>
              <div className="flex flex-col gap-3 py-1">
                {[
                  { label: "Account Status", value: (() => {
                    const statusVal = doc.custom_status || doc.status || "Active";
                    return <Tag className={`tag-glass ${getTagConfig(statusVal).glassClass} !m-0`}>{statusVal}</Tag>;
                  })() }
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
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    Verified System Record
                  </span>
                </div>
              </div>
            </SectionCard>

          </div>
        </Col>
      </Row>
      <ActivityLog doctype={DOCTYPE_TEMPLE} docname={id} />
    </ViewContainer>
  );
};

export default TempleView;
