import React from "react";
import { Row, Col, Button, Table, Alert, Tag } from "antd";
import { ArrowLeftOutlined, PrinterOutlined, EditOutlined } from "@ant-design/icons";
import { useFrappeGetDoc, useFrappeGetDocList } from "../../hooks/useFrappe";
import PageHeader from "./PageHeader";
import DonationPrint from "../Donation/DonationPrint";
import { formConfigs } from "../../config/formConfig";
import PageLoader from "./PageLoader";
import { getTagConfig } from "../../utils/tagUtils";

/* ─────────────────────────────────────────
   TOKENS — slate-cool, premium SaaS design
   ───────────────────────────────────────── */
const C = {
  white:       "#FFFFFF",
  bg:          "#F8FAFC",        // cool slate background
  surface:     "#FFFFFF",        // card surface
  border:      "#E2E8F0",        // default border
  borderHover: "#94A3B8",        // hover border
  ink:         "#0F172A",        // primary text
  inkMid:      "#475569",        // secondary text
  inkLight:    "#64748B",        // labels
  inkXLight:   "#CBD5E1",        // empty state
  black:       "#0F172A",        // main dark accents
  blackHover:  "#1E293B",
  green:       "#16A34A",
  greenBg:     "#F0FDF4",
  greenBorder: "#BBF7D0",
};

/* ─────────────────────────────────────────
   FONTS / OVERRIDES
   ───────────────────────────────────────── */
const fontStyle = `
  .common-view-root, 
  .common-view-root *, 
  .common-view-root .ant-typography, 
  .common-view-root .ant-tag {
    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
  }
`;

/* ─────────────────────────────────────────
   HOVER BUTTON
   ───────────────────────────────────────── */
function HoverButton({ style, hoverStyle, children, onClick, title }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      style={{ ...style, ...(hov ? hoverStyle : {}) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────
   FIELD CELL — sidebar accent bar style
   ───────────────────────────────────────── */
function FieldCell({ label, children }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 14px",
        borderRadius: "0 10px 10px 0",
        borderLeft: `3px solid ${hov ? C.black : C.border}`,
        background: hov ? "rgba(15, 23, 42, 0.02)" : "transparent",
        transition: "all 0.2s ease",
      }}
    >
      <span style={{
        display: "block",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: C.inkLight,
        marginBottom: 4,
      }}>
        {label}
      </span>
      <div style={{ minHeight: 20, fontSize: 13, fontWeight: 600, color: C.ink }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SECTION CARD
   ───────────────────────────────────────── */
function SectionCard({ title, right, children }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
    }}>
      {/* head */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px",
        background: "#FAFBFD",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em" }}>
          {title}
        </span>
        {right}
      </div>
      {/* body */}
      <div style={{ padding: "24px" }}>
        {children}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════
   MAIN COMPONENT
   ═════════════════════════════════════════ */
const CommonView = ({ doctype, id, onBack, onEdit }) => {
  const { data: doc, loading, error } = useFrappeGetDoc(doctype, id);
  const config = formConfigs[doctype];
  const { data: temples } = useFrappeGetDocList("Temple", {
    fields: ["name", "temple_name"], limit: 1000,
  });

  if (loading) return <PageLoader />;

  if (error || !doc) {
    return (
      <div style={{ padding: 32 }}>
        <Alert
          message="Could not load document"
          description={error?.message || "Document not found"}
          type="error" showIcon
          action={<Button onClick={onBack} icon={<ArrowLeftOutlined />}>Back</Button>}
        />
      </div>
    );
  }

  /* Filter out password fields and empty fields to keep view mode clean */
  const visibleFields = (config?.fields || []).filter(field => {
    if (field.name === "new_password" || field.name === "confirm_password" || field.name === "password") return false;
    
    // Also skip meta/system fields that will go into the sidebar
    if (field.name === "enabled" || field.name === "custom_status") return false;

    const val = doc[field.name];
    const empty = val === null || val === undefined || val === "" ||
      (Array.isArray(val) && val.length === 0);
    return !empty;
  });

  /* ── value renderer ── */
  const renderValue = (field, value) => {
    const empty = value === null || value === undefined || value === "" ||
      (Array.isArray(value) && value.length === 0);
    if (empty) return <span style={{ color: C.inkXLight, fontSize: 13, fontWeight: 500 }}>—</span>;

    if (field.type === "image")
      return <img src={value} alt={field.label} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10, border: `1px solid ${C.border}` }} />;

    if (field.type === "textarea")
      return (
        <div style={{ background: "#F8FAFC", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px",
          fontSize: 12, color: C.inkMid, whiteSpace: "pre-wrap", lineHeight: 1.6, fontWeight: 400 }}>
          {value}
        </div>
      );

    if (field.name === "custom_select_temple" && Array.isArray(value))
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {value.map((item) => {
            const tid = item.temple || String(item);
            const t = temples?.find(t => t.name === tid);
            const name = t ? t.temple_name : tid;
            const tagInfo = getTagConfig("temple admin");
            return (
              <Tag className={`tag-glass ${tagInfo.glassClass}`} key={item.name || tid}>
                {name}
              </Tag>
            );
          })}
        </div>
      );

    if (field.name === "roles" && Array.isArray(value))
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {value.map((item) => {
            const roleName = item.role || String(item);
            const tagInfo = getTagConfig(roleName);
            return (
              <Tag className={`tag-glass ${tagInfo.glassClass}`} key={item.name || roleName}>
                {roleName}
              </Tag>
            );
          })}
        </div>
      );

    if (field.name === "custom_user_role") {
      const tagInfo = getTagConfig(String(value));
      return (
        <Tag className={`tag-glass ${tagInfo.glassClass}`}>
          {String(value)}
        </Tag>
      );
    }

    if (Array.isArray(value))
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {value.map((item, i) => {
            const s = typeof item === "object" ? item.name || JSON.stringify(item) : String(item);
            const tagInfo = getTagConfig(s);
            return (
              <Tag className={`tag-glass ${tagInfo.glassClass}`} key={i}>
                {s}
              </Tag>
            );
          })}
        </div>
      );

    if (typeof value === "object")
      return (
        <pre style={{ fontSize: 11, background: "#F8FAFC", padding: "8px 10px", borderRadius: 8,
          border: `1px solid ${C.border}`, fontFamily: "ui-monospace,monospace", color: C.inkMid, margin: 0 }}>
          {JSON.stringify(value, null, 2)}
        </pre>
      );

    return <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{String(value)}</span>;
  };

  /* ── Header Avatar Renderer ── */
  const renderHeaderAvatar = () => {
    const getInitials = (name) => {
      if (!name) return "?";
      const parts = name.trim().split(" ").filter(Boolean);
      if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
      }
      return parts.map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const bgStyle = {
      width: 56,
      height: 56,
      borderRadius: "50%",
      background: C.black,
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      fontWeight: 700,
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
      flexShrink: 0
    };

    if (doctype === "User") {
      if (doc.user_image) {
        return (
          <img 
            src={doc.user_image} 
            alt={doc.full_name} 
            style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)", flexShrink: 0 }} 
          />
        );
      }
      return <div style={bgStyle}>{getInitials(doc.full_name || doc.name)}</div>;
    }

    if (doctype === "Donor") {
      return <div style={bgStyle}>{getInitials(doc.donor_name || doc.name)}</div>;
    }

    if (doctype === "Temple") {
      return <div style={bgStyle}>{getInitials(doc.temple_name || doc.name)}</div>;
    }

    if (doctype === "Donation Type") {
      if (doc.donation_image) {
        return (
          <img 
            src={doc.donation_image} 
            alt={doc.donation_type} 
            style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)", flexShrink: 0 }} 
          />
        );
      }
      return <div style={bgStyle}>{getInitials(doc.donation_type || doc.name)}</div>;
    }

    // Fallback icon for general records (e.g. Donations)
    return (
      <div style={bgStyle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
    );
  };

  /* ── Header Text Details Renderer ── */
  const renderHeaderDetails = () => {
    let title = doc.name;
    let subtitleElements = [];

    if (doctype === "User") {
      title = doc.full_name || doc.name;
      if (doc.email) subtitleElements.push(<span key="email" style={{ color: C.inkMid, fontWeight: 500 }}>{doc.email}</span>);
      if (doc.custom_user_role) {
        const tagInfo = getTagConfig(doc.custom_user_role);
        subtitleElements.push(
          <Tag key="role" className={`tag-glass ${tagInfo.glassClass}`} style={{ marginLeft: 4 }}>
            {doc.custom_user_role}
          </Tag>
        );
      }
    } else if (doctype === "Donor") {
      title = doc.donor_name || doc.name;
      if (doc.email) subtitleElements.push(<span key="email" style={{ color: C.inkMid, fontWeight: 500 }}>{doc.email}</span>);
      if (doc.phone) subtitleElements.push(<span key="phone" style={{ color: C.inkLight }}>• {doc.phone}</span>);
    } else if (doctype === "Temple") {
      title = doc.temple_name || doc.name;
      if (doc.custom_status) {
        const tagInfo = getTagConfig(doc.custom_status);
        subtitleElements.push(
          <Tag key="status" className={`tag-glass ${tagInfo.glassClass}`}>
            {doc.custom_status}
          </Tag>
        );
      }
    } else if (doctype === "Donation") {
      title = `Donation ${doc.name}`;
      subtitleElements.push(
        <span key="date" style={{ color: C.inkMid, fontWeight: 500 }}>
          {doc.creation ? new Date(doc.creation).toLocaleDateString() : ""}
        </span>
      );
    } else if (doctype === "Donation Type") {
      title = doc.donation_type || doc.name;
      if (doc.donation_type_code) {
        subtitleElements.push(
          <span key="code" style={{ color: C.inkMid, fontWeight: 500 }}>
            {doc.donation_type_code}
          </span>
        );
      }
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, flexWrap: "wrap" }}>
          {subtitleElements}
        </div>
      </div>
    );
  };

  return (
    <div className="temple-donation-app common-view-root" style={{ background: C.bg, minHeight: "100vh", padding: "32px 24px 120px 24px" }}>
      <style>{fontStyle}</style>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── TOP HERO HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <HoverButton
              style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${C.border}`,
                background: C.white, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: C.inkMid, transition: "all 0.15s" }}
              hoverStyle={{ borderColor: C.black, background: C.black, color: "#fff" }}
              onClick={onBack} title="Go back"
            >
              <ArrowLeftOutlined style={{ fontSize: 14 }} />
            </HoverButton>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {renderHeaderAvatar()}
              {renderHeaderDetails()}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <HoverButton
              style={{ height: 40, padding: "0 20px", borderRadius: 10, border: `1px solid ${C.border}`,
                background: C.white, color: C.inkMid, fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "all 0.15s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              hoverStyle={{ borderColor: C.black, color: C.ink }}
              onClick={() => window.print()}
            >
              <PrinterOutlined style={{ fontSize: 14 }} /> Print
            </HoverButton>
            <HoverButton
              style={{ height: 40, padding: "0 22px", borderRadius: 10, border: "none",
                background: C.black, color: "#fff", fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "all 0.15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }}
              hoverStyle={{ background: "#1E293B" }}
              onClick={() => onEdit && onEdit(doc)}
            >
              <EditOutlined style={{ fontSize: 14 }} /> Edit
            </HoverButton>
          </div>
        </div>

        {/* ── SPLIT-PANE TWO COLUMN GRID ── */}
        <Row gutter={[24, 24]}>
          {/* Main Pane (Left) */}
          <Col xs={24} lg={16}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Field details */}
              <SectionCard title="Details">
                <Row gutter={[16, 16]}>
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

              {/* Donation Items Grid */}
              {doctype === "Donation" && (
                <SectionCard
                  title="Financial Summary"
                  right={
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6,
                      background: C.greenBg, border: `1px solid ${C.greenBorder}`,
                      borderRadius: 10, padding: "5px 14px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.green,
                        letterSpacing: "0.08em", textTransform: "uppercase" }}>Total</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: C.green,
                        fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                        ₹{Number(doc.total_amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  }
                >
                  <Row gutter={[10, 10]} style={{ marginBottom: 20 }}>
                    {[
                      { label: "Payment Mode", value: (() => {
                        const tagInfo = getTagConfig(doc.payment_mode);
                        return <Tag className={`tag-glass ${tagInfo.glassClass}`}>{doc.payment_mode}</Tag>;
                      })() },
                      { label: "Handled By",   value: <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{doc.cashier || "System"}</span> },
                      { label: "Reference",    value: <span style={{ fontSize: 12, fontWeight: 600, color: C.inkMid, fontFamily: "ui-monospace,monospace" }}>{doc.reference_no || "N/A"}</span> },
                    ].map(({ label, value }) => (
                      <Col xs={24} sm={8} key={label}>
                        <div style={{ padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: C.inkLight, marginBottom: 6 }}>
                            {label}
                          </div>
                          {value}
                        </div>
                      </Col>
                    ))}
                  </Row>

                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <Table
                      dataSource={doc.donation_items || []}
                      pagination={false}
                      rowKey="name"
                      size="middle"
                      columns={[
                        {
                          title: <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: C.inkLight }}>Donation Type</span>,
                          dataIndex: "donation_type",
                          render: v => <span style={{ fontWeight: 600, color: C.ink, fontSize: 13 }}>{v}</span>,
                        },
                        {
                          title: <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: C.inkLight }}>Amount</span>,
                          dataIndex: "amount",
                          align: "right",
                          render: v => <span style={{ fontWeight: 700, color: C.green, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>₹{Number(v).toLocaleString("en-IN")}</span>,
                        },
                      ]}
                    />
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <DonationPrint donation={doc} />
                  </div>
                </SectionCard>
              )}

            </div>
          </Col>

          {/* Sidebar Pane (Right) */}
          <Col xs={24} lg={8}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Metadata Info Box */}
              <SectionCard title="System Information">
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { label: "Document ID", value: <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, fontWeight: 600, color: C.inkMid }}>{id}</span> },
                    { label: "Status", value: (() => {
                      const statusVal = doc.custom_status || doc.status || (Number(doc.enabled) === 1 || doc.enabled === "Active" || doc.enabled === true ? "Active" : "Inactive");
                      const tagInfo = getTagConfig(statusVal);
                      return <Tag className={`tag-glass ${tagInfo.glassClass}`}>{statusVal}</Tag>;
                    })() },
                    { label: "Created By", value: <span style={{ fontSize: 12, fontWeight: 600, color: C.inkMid }}>{doc.owner || "System"}</span> },
                    { label: "Created At", value: <span style={{ fontSize: 12, fontWeight: 600, color: C.inkMid }}>{doc.creation ? new Date(doc.creation).toLocaleString() : "—"}</span> },
                    { label: "Last Modified", value: <span style={{ fontSize: 12, fontWeight: 600, color: C.inkMid }}>{doc.modified ? new Date(doc.modified).toLocaleString() : "—"}</span> }
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: C.inkLight }}>{label}</span>
                      {value}
                    </div>
                  ))}
                </div>
              </SectionCard>

            </div>
          </Col>
        </Row>

      </div>
    </div>
  );
};

export default CommonView;