import React, { useState, useEffect } from "react";
import { Row, Col, Alert, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Printer } from "lucide-react";
import PageLoader from "../../components/common/PageLoader";
import DetailHeader from "../../components/common/DetailHeader";
import SectionCard from "../../components/common/SectionCard";
import FieldCell from "../../components/common/FieldCell";
import LedgerProfileCard from "./components/LedgerProfileCard";
import LedgerFinancialBox from "./components/LedgerFinancialBox";
import LedgerTabsSection from "./components/LedgerTabsSection";
import ViewContainer from "../../components/common/ViewContainer";

const LedgerView = ({ id, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

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
      <div className="p-8">
        <Alert
          message="Could not load cashier handover details"
          description={error?.message || "User details not found"}
          type="error"
          showIcon
          action={
            <button 
              onClick={onBack} 
              className="px-4 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 font-medium hover:border-zinc-900 transition-all cursor-pointer"
            >
              Back
            </button>
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
      title: "Donation Id",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <a 
          onClick={() => {
            if (typeof frappe !== "undefined") {
              frappe.set_route("temple-donation", "donations", "view", text);
            }
          }}
          className="font-mono text-xs font-semibold text-zinc-600 hover:text-zinc-950 underline cursor-pointer"
        >
          {text}
        </a>
      )
    },
    {
      title: "Donor",
      dataIndex: "donor_name",
      key: "donor_name",
      render: (text) => <span className="font-semibold text-sm text-zinc-800">{text || "Anonymous"}</span>
    },
    {
      title: "Temple",
      dataIndex: "temple_name",
      key: "temple_name",
      render: (text) => <span className="text-xs text-zinc-500 font-medium">{text}</span>
    },
    {
      title: "Date & Time",
      dataIndex: "creation",
      key: "creation",
      render: (val) => <span className="text-xs text-zinc-500">{formatDateTime(val)}</span>
    },
    {
      title: "Amount",
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
      title: "Log Id",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="font-mono text-xs font-semibold text-zinc-500 bg-zinc-50 border border-zinc-200 px-2 py-1 rounded">
          {text}
        </span>
      )
    },
    {
      title: "Date & Time",
      dataIndex: "reset_date",
      key: "reset_date",
      render: (val) => <span className="text-sm font-medium text-zinc-600">{formatDateTime(val)}</span>
    },
    {
      title: "Collected By",
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
      title: "Amount Handed Over",
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

  const fullName = user.full_name || user.name || "Cashier";
  const initials = `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase() || "C";

  return (
    <ViewContainer className="user-view-container">
      {/* ── TOP HERO HEADER ── */}
      <DetailHeader
        onBack={onBack}
        title={fullName}
        subtitle={user.email}
        imageSrc={user.user_image}
        initials={initials}
        actions={
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-zinc-200 text-zinc-700 font-medium hover:border-zinc-400 shadow-none text-sm transition-all flex items-center gap-1.5 bg-white rounded-lg cursor-pointer"
          >
            <Printer size={14} className="text-zinc-600" /> Print History Report
          </button>
        }
      />

      {/* ── TWO COLUMN GRID WORKSURFACE ── */}
      <Row gutter={[24, 24]}>
        
        {/* Left Meta/Profile Panel (Span 7/24) */}
        <Col xs={24} lg={7}>
          <div className="sticky top-6 flex flex-col gap-6">
            
            {/* Profile Card */}
            <LedgerProfileCard user={user} />

            {/* Total Collected Financial summary */}
            <LedgerFinancialBox 
              title="Total Handed Over Amount" 
              amount={total_collected}
              description="Consolidated total from all handover sessions."
              colorTheme="green"
            />

            {/* Cashier Information Card */}
            <SectionCard title="Cashier Information" icon={<UserOutlined style={{ color: '#1f2937' }} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <FieldCell label="User Email">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{user.email}</span>
                </FieldCell>
                
                <FieldCell label="Full Name">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{fullName}</span>
                </FieldCell>

                <FieldCell label="Total Handovers">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{handovers.length} Handover Session{handovers.length !== 1 ? 's' : ''}</span>
                </FieldCell>
              </div>
            </SectionCard>

          </div>
        </Col>

        {/* Right Main Table/Tabs Panel (Span 17/24) */}
        <Col xs={24} lg={17}>
          <div className="flex flex-col gap-6">
            <LedgerTabsSection 
              donations={donations} 
              handovers={handovers}
              donationColumns={donationColumns}
              handoverColumns={handoverColumns}
            />
          </div>
        </Col>
      </Row>
    </ViewContainer>
  );
};

export default LedgerView;
