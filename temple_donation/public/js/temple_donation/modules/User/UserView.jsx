import React from "react";
import { Row, Col, Alert, Tag, Button } from "antd";
import { User, ShieldAlert, FileText, Wallet, CheckCircle2 } from "lucide-react";
import { useFrappeGetDoc, useFrappeGetDocList } from "../../hooks/useFrappe";
import { DOCTYPE_USER } from "../../config/constants";
import { userFormFields } from "../../formfield/userFormFields";
import PageLoader from "../../components/common/PageLoader";
import { getTagConfig } from "../../utils/tagUtils";
import DetailHeader from "../../components/common/DetailHeader";
import SectionCard from "../../components/common/SectionCard";
import FieldCell from "../../components/common/FieldCell";
import ViewContainer from "../../components/common/ViewContainer";
import ActivityLog from "../../components/common/ActivityLog";

const UserView = ({ id, onBack, onEdit }) => {
  const { data: doc, loading, error } = useFrappeGetDoc(DOCTYPE_USER, id);
  const { data: temples } = useFrappeGetDocList("Temple", {
    fields: ["name", "temple_name"], limit: 1000,
  });

  if (loading) return <PageLoader />;

  if (error || !doc) {
    return (
      <div className="p-8">
        <Alert
          message="Could not load user details"
          description={error?.message || "User not found"}
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

  const visibleFields = (userFormFields.fields || []).filter(field => {
    if (field.name === "new_password" || field.name === "confirm_password" || field.name === "password") return false;
    if (field.name === "enabled" || field.name === "custom_status") return false;
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
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-600 white-space-pre-wrap leading-relaxed font-normal">
          {value}
        </div>
      );

    if ((field.name === "custom_select_temple" || field.name === "roles") && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => {
            const tid = item.temple || item.role || String(item);
            const t = temples?.find(t => t.name === tid);
            const name = t ? t.temple_name : tid;
            const tagInfo = getTagConfig(field.name === "roles" ? tid : "temple admin");
            return (
              <Tag className={`tag-glass ${tagInfo.glassClass} !m-0`} key={item.name || tid}>
                {name}
              </Tag>
            );
          })}
        </div>
      );
    }

    if (field.name === "custom_user_role") {
      const tagInfo = getTagConfig(String(value));
      return <Tag className={`tag-glass ${tagInfo.glassClass} !m-0`}>{String(value)}</Tag>;
    }

    return <span className="text-zinc-800 font-semibold">{String(value)}</span>;
  };

  const fullName = doc.full_name || `${doc.first_name || ""} ${doc.last_name || ""}`.trim() || doc.name;
  const initials = `${doc.first_name?.charAt(0) || ""}${doc.last_name?.charAt(0) || ""}`.toUpperCase() || "U";

  return (
    <ViewContainer className="user-view-container">
      {/* ── TOP HERO HEADER ── */}
      <DetailHeader
        onBack={onBack}
        title={fullName}
        subtitle={doc.email}
        imageSrc={doc.user_image}
        initials={initials}
        tags={doc.custom_user_role ? [doc.custom_user_role] : []}
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
            <SectionCard title="Basic Information" icon={<User size={15} className="text-zinc-800" />}>
              <Row gutter={[16, 8]}>
                {visibleFields.map((field) => {
                  const isFullWidth = field.type === "image" || field.type === "textarea" || field.name === "custom_select_temple" || field.name === "roles";
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


          </div>
        </Col>

        {/* Right Meta Parameters Panel */}
        <Col xs={24} lg={7}>
          <div className="sticky top-6 flex flex-col gap-6">

            {/* Role Matrix Status Card */}
            <SectionCard title="Role & Access Meta" icon={<ShieldAlert size={15} className="text-zinc-800" />}>
              <div className="flex flex-col gap-3
              
               py-1">
                {[
                  {
                    label: "Account Status", value: (() => {
                      const statusVal = doc.custom_status || doc.status || (doc.enabled ? "Active" : "Inactive");
                      return <Tag className={`tag-glass ${getTagConfig(statusVal).glassClass} !m-0`}>{statusVal}</Tag>;
                    })()
                  },
                  {
                    label: "Opening Balance", value: (
                      <span className="text-xs font-semibold text-zinc-800 flex items-center gap-1">
                        <Wallet size={12} className="text-zinc-400" />
                        ₹{doc.custom_opening_balance ? parseFloat(doc.custom_opening_balance).toFixed(2) : "0.00"}
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
      <ActivityLog doctype={DOCTYPE_USER} docname={id} />
    </ViewContainer>
  );
};

export default UserView;