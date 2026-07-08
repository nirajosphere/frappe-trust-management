import React, { useState, useEffect } from "react";
import { Row, Col, Alert } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Printer, FileDown } from "lucide-react";
import PageLoader from "../../components/common/PageLoader";
import DetailHeader from "../../components/common/DetailHeader";
import SectionCard from "../../components/common/SectionCard";
import FieldCell from "../../components/common/FieldCell";
import LedgerProfileCard from "./components/LedgerProfileCard";
import LedgerFinancialBox from "./components/LedgerFinancialBox";
import LedgerTabsSection from "./components/LedgerTabsSection";
import ViewContainer from "../../components/common/ViewContainer";
import { getDonationColumns, getHandoverColumns } from "./components/ledgerViewColumns";
import { formatDateTime } from "./utils/ledgerUtils";
import * as XLSX from "xlsx";

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

  const donationColumns = getDonationColumns(donations);
  const handoverColumns = getHandoverColumns(handovers);

  const fullName = user.full_name || user.name || "Cashier";
  const initials = `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase() || "C";

  const handleExportToExcel = () => {
    // 1. Prepare Donation Data
    const donationData = (donations || []).map((d) => ({
      "Donation ID": d.name,
      "Donor Name": d.donor_name || d.donor || "Anonymous",
      "Trust / Temple": d.temple_name || d.temple,
      "Date & Time": formatDateTime(d.creation),
      "Amount (₹)": Number(d.total_amount || 0)
    }));

    // 2. Prepare Handover Data
    const handoverData = (handovers || []).map((h) => ({
      "Handover ID": h.name,
      "Date & Time": formatDateTime(h.reset_date),
      "Collector Name": h.collector_name || h.owner,
      "Handed Over Amount (₹)": Number(h.opening_balance || 0)
    }));

    // 3. Prepare Summary Data
    const summaryData = [
      { "Parameter": "Cashier Name", "Value": fullName },
      { "Parameter": "Email Address", "Value": user.email },
      { "Parameter": "Total Handed Over Amount", "Value": `₹${Number(total_collected || 0).toLocaleString("en-IN")}` },
      { "Parameter": "Total Handover Sessions", "Value": handovers?.length || 0 },
      { "Parameter": "Total Collected Donations", "Value": donations?.length || 0 }
    ];

    // Create sheets
    const workbook = XLSX.utils.book_new();
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    const donationSheet = XLSX.utils.json_to_sheet(donationData);
    const handoverSheet = XLSX.utils.json_to_sheet(handoverData);

    // Append sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary Report");
    XLSX.utils.book_append_sheet(workbook, donationSheet, "Donations History");
    XLSX.utils.book_append_sheet(workbook, handoverSheet, "Handover Sessions");

    // Write file
    XLSX.writeFile(workbook, `${fullName.replace(/\s+/g, '_')}_Ledger_Report.xlsx`);
  };

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
          <div className="flex gap-2">
            <button
              onClick={handleExportToExcel}
              className="px-4 py-2 border border-zinc-200 text-zinc-700 font-medium hover:border-zinc-400 shadow-none text-sm transition-all flex items-center gap-1.5 bg-white rounded cursor-pointer"
            >
              <FileDown size={14} className="text-zinc-600" /> Export to Excel
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-zinc-200 text-zinc-700 font-medium hover:border-zinc-400 shadow-none text-sm transition-all flex items-center gap-1.5 bg-white rounded cursor-pointer"
            >
              <Printer size={14} className="text-zinc-600" /> Print History Report
            </button>
          </div>
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
              <div style={{ display: "flex", flexDirection: "column",}}>
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

      {/* ── PRINT-ONLY REPORT LAYOUT ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ledger-print-report {
          display: none !important;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          .ledger-print-report,
          .ledger-print-report * {
            visibility: visible !important;
          }
          .ledger-print-report {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
          }
        }
      `}} />
      <div className="ledger-print-report" style={{ padding: "20px", color: "#000" }}>
        <div style={{ textAlign: "center", marginBottom: "30px", borderBottom: "2px solid #000", paddingBottom: "10px" }}>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>Cashier Ledger & Handover Report</h1>
          <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "12px" }}>Generated on {formatDateTime(new Date())}</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", fontSize: "14px" }}>
          <div>
            <strong>Cashier Name:</strong> {fullName}<br />
            <strong>Email:</strong> {user.email}<br />
          </div>
          <div style={{ textAlign: "right" }}>
            <strong>Total Handed Over:</strong> ₹{Number(total_collected || 0).toLocaleString("en-IN")}<br />
            <strong>Total Handovers:</strong> {handovers?.length || 0} session(s)<br />
          </div>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", borderBottom: "1px solid #ccc", paddingBottom: "5px", marginBottom: "15px" }}>
            Collected Donations ({donations?.length || 0})
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #333", textAlign: "left" }}>
                <th style={{ padding: "8px 4px" }}>Donation ID</th>
                <th style={{ padding: "8px 4px" }}>Donor</th>
                <th style={{ padding: "8px 4px" }}>Trust</th>
                <th style={{ padding: "8px 4px" }}>Date & Time</th>
                <th style={{ padding: "8px 4px", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {donations && donations.length > 0 ? (
                donations.map((d, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px 4px", fontFamily: "monospace" }}>{d.name}</td>
                    <td style={{ padding: "8px 4px" }}>{d.donor_name || d.donor || "Anonymous"}</td>
                    <td style={{ padding: "8px 4px" }}>{d.temple_name || d.temple}</td>
                    <td style={{ padding: "8px 4px" }}>{formatDateTime(d.creation)}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: "bold" }}>
                      ₹{Number(d.total_amount || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "10px", textAlign: "center", color: "#666" }}>
                    No donations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h2 style={{ fontSize: "18px", borderBottom: "1px solid #ccc", paddingBottom: "5px", marginBottom: "15px" }}>
            Handover Sessions ({handovers?.length || 0})
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #333", textAlign: "left" }}>
                <th style={{ padding: "8px 4px" }}>Handover ID</th>
                <th style={{ padding: "8px 4px" }}>Date & Time</th>
                <th style={{ padding: "8px 4px" }}>Collector</th>
                <th style={{ padding: "8px 4px", textAlign: "right" }}>Amount Handed Over</th>
              </tr>
            </thead>
            <tbody>
              {handovers && handovers.length > 0 ? (
                handovers.map((h, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px 4px", fontFamily: "monospace" }}>{h.name}</td>
                    <td style={{ padding: "8px 4px" }}>{formatDateTime(h.reset_date)}</td>
                    <td style={{ padding: "8px 4px" }}>{h.collector_name || h.owner}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: "bold" }}>
                      ₹{Number(h.opening_balance || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: "10px", textAlign: "center", color: "#666" }}>
                    No handover sessions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ViewContainer>
  );
};

export default LedgerView;
