import React, { useState, useEffect } from "react";
import { Row, Col, Alert, Table, Avatar, Typography } from "antd";
import { ArrowLeftOutlined, PrinterOutlined, UserOutlined, FileTextOutlined, HistoryOutlined, WalletOutlined } from "@ant-design/icons";
import PageLoader from "../../components/common/PageLoader";

const { Text } = Typography;

/* ─────────────────────────────────────────
   TOKENS — slate-cool, premium SaaS design
   ───────────────────────────────────────── */
const C = {
  white:       "#FFFFFF",
  bg:          "#F8FAFC",        // cool slate background
  surface:     "#FFFFFF",        // card surface
  border:      "#E2E8F0",        // default border
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

const fontStyle = `
  .ledger-view-root, 
  .ledger-view-root *, 
  .ledger-view-root .ant-typography {
    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
  }
`;

function HoverButton({ style, hoverStyle, children, onClick, title }) {
  const [hov, setHov] = useState(false);
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

function FieldCell({ label, children }) {
  const [hov, setHov] = useState(false);
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

function SectionCard({ title, right, children }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
    }}>
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
      <div style={{ padding: "24px" }}>
        {children}
      </div>
    </div>
  );
}

const LedgerView = ({ id, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("donations"); // "donations" or "handovers"

  const fetchLedgerDetails = async () => {
    setLoading(true);
    try {
      if (typeof frappe !== "undefined") {
        const response = await frappe.call({
          method: "temple_donation.api.get_user_handover_details",
          args: { user_id: id }
        });
        if (response.message) {
          setData(response.message);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerDetails();
  }, [id]);

  if (loading) return <PageLoader />;

  if (error || !data) {
    return (
      <div style={{ padding: 32 }}>
        <Alert
          message="Could not load cashier handover details"
          description={error?.message || "User details not found"}
          type="error"
          showIcon
          action={
            <HoverButton 
              onClick={onBack} 
              style={{ padding: "8px 16px", borderRadius: 8, background: "#fff", border: `1px solid ${C.border}`, cursor: "pointer" }} 
              hoverStyle={{ borderColor: C.black }}
            >
              <ArrowLeftOutlined /> Back
            </HoverButton>
          }
        />
      </div>
    );
  }

  const { user, handovers, donations, total_collected } = data;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    } catch (e) {
      return dateStr;
    }
  };

  const donationColumns = [
    {
      title: "DONATION ID",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <a 
          onClick={() => {
            if (typeof frappe !== "undefined") {
              frappe.set_route("temple-donation", "donations", "view", text);
            }
          }}
          className="font-mono text-xs font-semibold text-zinc-600 hover:text-zinc-950 underline"
        >
          {text}
        </a>
      )
    },
    {
      title: "DONOR",
      dataIndex: "donor_name",
      key: "donor_name",
      render: (text) => <span className="font-semibold text-sm text-zinc-800">{text || "Anonymous"}</span>
    },
    {
      title: "TEMPLE",
      dataIndex: "temple_name",
      key: "temple_name",
      render: (text) => <span className="text-xs text-zinc-500 font-medium">{text}</span>
    },
    {
      title: "DATE & TIME",
      dataIndex: "creation",
      key: "creation",
      render: (val) => <span className="text-xs text-zinc-500">{formatDateTime(val)}</span>
    },
    {
      title: "AMOUNT",
      dataIndex: "total_amount",
      key: "total_amount",
      align: "right",
      render: (val) => (
        <span className="font-bold text-zinc-900 pr-2">
          ₹{Number(val || 0).toLocaleString("en-IN")}
        </span>
      )
    }
  ];

  const handoverColumns = [
    {
      title: "LOG ID",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="font-mono text-xs font-semibold text-zinc-500 bg-zinc-50 border border-zinc-200 px-2 py-1 rounded">
          {text}
        </span>
      )
    },
    {
      title: "HANDOVER DATE & TIME",
      dataIndex: "reset_date",
      key: "reset_date",
      render: (val) => <span className="text-sm font-medium text-zinc-600">{formatDateTime(val)}</span>
    },
    {
      title: "COLLECTED BY",
      dataIndex: "collector_name",
      key: "collector_name",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} className="bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-800">{text}</span>
            <span className="text-[10px] text-zinc-400">{record.owner}</span>
          </div>
        </div>
      )
    },
    {
      title: "AMOUNT HANDED OVER",
      dataIndex: "opening_balance",
      key: "opening_balance",
      align: "right",
      render: (val) => (
        <span className="font-bold text-green-600 pr-2 text-sm">
          ₹{Number(val || 0).toLocaleString("en-IN")}
        </span>
      )
    }
  ];

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return parts.map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="temple-donation-app ledger-view-root" style={{ background: C.bg, minHeight: "100vh", padding: "32px 24px 120px 24px" }}>
      <style>{fontStyle}</style>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Hero Header */}
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
              {user.user_image ? (
                <img 
                  src={user.user_image} 
                  alt={user.full_name} 
                  style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `1px solid ${C.border}` }} 
                />
              ) : (
                <div style={{
                  width: 52, height: 52, borderRadius: "50%", background: C.black, color: "#ffffff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700
                }}>
                  {getInitials(user.full_name || user.name)}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  {user.full_name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.inkMid }}>
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <HoverButton
              style={{ height: 40, padding: "0 20px", borderRadius: 10, border: `1px solid ${C.border}`,
                background: C.white, color: C.inkMid, fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "all 0.15s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              hoverStyle={{ borderColor: C.black, color: C.ink }}
              onClick={() => window.print()}
            >
              <PrinterOutlined style={{ fontSize: 14 }} /> Print History Report
            </HoverButton>
          </div>
        </div>

        {/* Main Content Layout */}
        <Row gutter={[24, 24]}>
          {/* Main Pane (Left) */}
          <Col xs={24} lg={16}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Tab Selector Pill control */}
              <div className="bg-zinc-100 p-1 rounded-lg flex items-center space-x-1 w-fit">
                <button
                  onClick={() => setActiveTab("donations")}
                  style={{
                    background: activeTab === "donations" ? "#ffffff" : "transparent",
                    border: "none",
                    boxShadow: activeTab === "donations" ? "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)" : "none",
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 outline-none cursor-pointer ${
                    activeTab === "donations" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <WalletOutlined className="text-sm" />
                  Collected Donations ({donations.length})
                </button>
                <button
                  onClick={() => setActiveTab("handovers")}
                  style={{
                    background: activeTab === "handovers" ? "#ffffff" : "transparent",
                    border: "none",
                    boxShadow: activeTab === "handovers" ? "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)" : "none",
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 outline-none cursor-pointer ${
                    activeTab === "handovers" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <HistoryOutlined className="text-sm" />
                  Handover Sessions ({handovers.length})
                </button>
              </div>

              {activeTab === "donations" ? (
                <SectionCard 
                  title="Cash Donations Collected & Handed Over" 
                  right={
                    <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-md">
                      {donations.length} Donation{donations.length !== 1 ? 's' : ''} Found
                    </span>
                  }
                >
                  <Table
                    dataSource={donations}
                    columns={donationColumns}
                    rowKey="name"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      className: "!my-4"
                    }}
                    bordered
                    className="aavatto-premium-table"
                    scroll={{ x: 'max-content' }}
                  />
                </SectionCard>
              ) : (
                <SectionCard 
                  title="Past Reset & Handover Logs" 
                  right={
                    <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-md">
                      {handovers.length} Session{handovers.length !== 1 ? 's' : ''} Found
                    </span>
                  }
                >
                  <Table
                    dataSource={handovers}
                    columns={handoverColumns}
                    rowKey="name"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      className: "!my-4"
                    }}
                    bordered
                    className="aavatto-premium-table"
                    scroll={{ x: 'max-content' }}
                  />
                </SectionCard>
              )}
            </div>
          </Col>

          {/* Sidebar (Right) */}
          <Col xs={24} lg={8}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Financial Box */}
              <div style={{
                background: C.greenBg,
                border: `1px solid ${C.greenBorder}`,
                borderRadius: 16,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: "0.09em", textTransform: "uppercase" }}>
                  Total Handed Over Amount
                </span>
                <span style={{ fontSize: 28, fontWeight: 800, color: C.green, letterSpacing: "-0.03em" }}>
                  ₹{Number(total_collected || 0).toLocaleString("en-IN")}
                </span>
                <span style={{ fontSize: 11, color: C.green, opacity: 0.8, fontWeight: 500 }}>
                  Consolidated total from all handover sessions.
                </span>
              </div>

              {/* Cashier Profile Meta */}
              <SectionCard title="Cashier Information">
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <FieldCell label="User Email">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{user.email}</span>
                  </FieldCell>
                  
                  <FieldCell label="Full Name">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{user.full_name}</span>
                  </FieldCell>

                  <FieldCell label="Total Handovers">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{handovers.length} Handover Reset{handovers.length !== 1 ? 's' : ''}</span>
                  </FieldCell>
                </div>
              </SectionCard>

            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LedgerView;
