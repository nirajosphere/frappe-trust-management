import React from "react";
import { Row, Col, Alert, Tag } from "antd";
import { ArrowLeftOutlined, PrinterOutlined, EditOutlined } from "@ant-design/icons";
import { useFrappeGetDoc } from "../../hooks/useFrappe";
import { DOCTYPE_TEMPLE } from "../../config/constants";
import { templeFormFields } from "../../formfield/templeFormFields";
import PageLoader from "../../components/common/PageLoader";
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
};

/* ─────────────────────────────────────────
   FONTS / OVERRIDES
   ───────────────────────────────────────── */
const fontStyle = `
  .temple-view-root, 
  .temple-view-root *, 
  .temple-view-root .ant-typography, 
  .temple-view-root .ant-tag {
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

const TempleView = ({ id, onBack, onEdit }) => {
  const { data: doc, loading, error } = useFrappeGetDoc(DOCTYPE_TEMPLE, id);

  if (loading) return <PageLoader />;

  if (error || !doc) {
    return (
      <div style={{ padding: 32 }}>
        <Alert
          message="Could not load temple details"
          description={error?.message || "Temple not found"}
          type="error"
          showIcon
          action={<HoverButton onClick={onBack} style={{ padding: "8px 16px", borderRadius: 8, background: "#fff", border: `1px solid ${C.border}`, cursor: "pointer" }} hoverStyle={{ borderColor: C.black }}><ArrowLeftOutlined /> Back</HoverButton>}
        />
      </div>
    );
  }

  // Filter out empty fields to keep view mode clean
  const visibleFields = (templeFormFields.fields || []).filter(field => {
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

    return <div style={bgStyle}>{getInitials(doc.temple_name || doc.name)}</div>;
  };

  /* ── Header Text Details Renderer ── */
  const renderHeaderDetails = () => {
    const title = doc.temple_name || doc.name;
    const subtitleElements = [];

    const statusVal = doc.custom_status || doc.status;
    if (statusVal) {
      const tagInfo = getTagConfig(statusVal);
      subtitleElements.push(
        <Tag key="status" className={`tag-glass ${tagInfo.glassClass}`}>
          {statusVal}
        </Tag>
      );
    }

    if (doc.temple_id) {
      subtitleElements.push(
        <span key="temple_id" style={{ color: C.inkMid, fontWeight: 500 }}>
          ID: {doc.temple_id}
        </span>
      );
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
    <div className="temple-donation-app temple-view-root" style={{ background: C.bg, minHeight: "100vh", padding: "32px 24px 120px 24px" }}>
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
              <SectionCard title="Temple Details">
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
                      const statusVal = doc.custom_status || doc.status || "Active";
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

export default TempleView;
