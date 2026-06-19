import React from "react";
import { Row, Col, Alert, Tag, Table, Button } from "antd";
import { User, ShieldAlert, FileText, CheckCircle2,Wallet } from "lucide-react";
import { useFrappeGetDoc, useFrappeGetDocList } from "../../hooks/useFrappe";
import { DOCTYPE_DONATION } from "../../config/constants";
import { donationFormFields } from "../../formfield/donationFormFields";
import PageLoader from "../../components/common/PageLoader";
import DonationPrint from "../../components/Donation/DonationPrint";
import { getTagConfig } from "../../utils/tagUtils";
import DetailHeader from "../../components/common/DetailHeader";
import SectionCard from "../../components/common/SectionCard";
import FieldCell from "../../components/common/FieldCell";

const DonationView = ({ id, onBack, onEdit }) => {
  const { data: doc, loading, error } = useFrappeGetDoc(DOCTYPE_DONATION, id);
  const { data: temples } = useFrappeGetDocList("Temple", {
    fields: ["name", "temple_name"], limit: 1000,
  });
  const { data: donationTypes } = useFrappeGetDocList("Donation Type", {
    fields: ["name", "donation_type"], limit: 1000,
  });

  if (loading) return <PageLoader />;

  if (error || !doc) {
    return (
      <div className="p-8">
        <Alert
          message="Could not load donation details"
          description={error?.message || "Donation not found"}
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

  const visibleFields = (donationFormFields.fields || []).filter(field => {
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

    if (field.name === "temple") {
      const t = temples?.find(t => t.name === value);
      return <span className="text-zinc-800 font-semibold">{t ? t.temple_name : String(value)}</span>;
    }

    if (field.name === "total_amount") {
      return <span className="text-zinc-800 font-semibold">₹{Number(value).toLocaleString("en-IN")}</span>;
    }

    return <span className="text-zinc-800 font-semibold">{String(value)}</span>;
  };

  const title = `Donation ${doc.name}`;
  const initials = "DN";

  return (
    <div className="donation-view-container min-h-screen py-6 bg-[#f8f9fa]" style={{ padding: '24px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ── TOP HERO HEADER ── */}
        <DetailHeader
          onBack={onBack}
          title={title}
          subtitle={doc.creation ? new Date(doc.creation).toLocaleDateString() : ""}
          initials={initials}
          tags={doc.custom_status || doc.status ? [doc.custom_status || doc.status] : []}
          actions={
            <>
              <Button
                onClick={() => window.print()}
                className="px-4 border border-zinc-200 text-zinc-700 font-medium hover:border-zinc-400 shadow-none text-sm transition-all flex items-center gap-1.5 bg-white"
              >
                Print Receipt
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
              
              {/* Basic Information details */}
              <SectionCard title="Receipt Details" icon={<User size={15} className="text-zinc-800" />}>
                <Row gutter={[16, 16]}>
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

              {/* Financial Summary */}
              <SectionCard
                title="Financial Summary"
                icon={<Wallet size={15} className="text-zinc-800" />}
                right={
                  <div className="flex items-baseline gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1">
                    <span className="text-[10px] font-bold text-green-600 tracking-wider uppercase">Total</span>
                    <span className="text-lg font-extrabold text-green-600 font-mono">
                      ₹{Number(doc.total_amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                }
              >
                <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                  {[
                    { label: "Payment Mode", value: (() => {
                      const tagInfo = getTagConfig(doc.payment_mode);
                      return <Tag className={`tag-glass ${tagInfo.glassClass} !m-0`}>{doc.payment_mode}</Tag>;
                    })() },
                    { label: "Handled By", value: <span className="text-xs font-semibold text-zinc-800">{doc.cashier || "System"}</span> },
                    { label: "Reference", value: <span className="text-xs font-mono font-semibold text-zinc-500 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded">{doc.transaction_ref_no || doc.reference_no || "N/A"}</span> },
                  ].map(({ label, value }) => (
                    <Col xs={24} sm={8} key={label}>
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col gap-1">
                        <span className="text-[9px] font-bold tracking-wider uppercase text-zinc-400">{label}</span>
                        {value}
                      </div>
                    </Col>
                  ))}
                </Row>

                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <Table
                    dataSource={doc.donation_items || []}
                    pagination={false}
                    rowKey="name"
                    size="middle"
                    columns={[
                      {
                        title: "DONATION TYPE",
                        dataIndex: "donation_type",
                        render: v => {
                          const dt = donationTypes?.find(t => t.name === v);
                          return <span className="font-semibold text-zinc-800 text-xs">{dt ? dt.donation_type : v}</span>;
                        },
                      },
                      {
                        title: "AMOUNT",
                        dataIndex: "amount",
                        align: "right",
                        render: v => <span className="font-bold text-zinc-900 text-xs">₹{Number(v).toLocaleString("en-IN")}</span>,
                      },
                    ]}
                  />
                </div>

                {/* <div className="mt-4">
                  <DonationPrint donation={doc} />
                </div> */}
              </SectionCard>

            </div>
          </Col>

          {/* Right Meta Parameters Panel */}
          <Col xs={24} lg={7}>
            <div className="sticky top-6 flex flex-col gap-6">
              
              {/* Status Meta Card */}
              <SectionCard title="Status & Meta" icon={<ShieldAlert size={15} className="text-zinc-800" />}>
                <div className="flex flex-col gap-4 py-1">
                  {[
                    { label: "Payment Status", value: (() => {
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

              {/* System Logs */}
              <SectionCard title="System Logs" icon={<FileText size={15} className="text-zinc-800" />}>
                <div className="flex flex-col gap-3.5 py-1">
                  {[
                    { label: "Document ID", value: <span className="font-mono text-[11px] font-semibold text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">{id}</span> },
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
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      Verified System Record
                    </span>
                  </div>
                </div>
              </SectionCard>

            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DonationView;
