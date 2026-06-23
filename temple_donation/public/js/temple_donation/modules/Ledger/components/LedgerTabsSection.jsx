// import React, { useState } from "react";
// import { Table } from "antd";
// import { WalletOutlined, HistoryOutlined } from "@ant-design/icons";
// import SectionCard from "../../../components/common/SectionCard";

// const LedgerTabsSection = ({ donations, handovers, donationColumns, handoverColumns }) => {
//   const [activeTab, setActiveTab] = useState("donations");

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
//       {/* Tab Selector Pill control */}
//       <div className="bg-zinc-100 p-1 rounded-lg flex items-center space-x-1 w-fit">
//         <button
//           onClick={() => setActiveTab("donations")}
//           style={{
//             background: activeTab === "donations" ? "#ffffff" : "transparent",
//             border: "none",
//             boxShadow: activeTab === "donations" ? "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)" : "none",
//           }}
//           className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 outline-none cursor-pointer ${
//             activeTab === "donations" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
//           }`}
//         >
//           <WalletOutlined className="text-sm" />
//           Collected Donations ({donations.length})
//         </button>
//         <button
//           onClick={() => setActiveTab("handovers")}
//           style={{
//             background: activeTab === "handovers" ? "#ffffff" : "transparent",
//             border: "none",
//             boxShadow: activeTab === "handovers" ? "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)" : "none",
//           }}
//           className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 outline-none cursor-pointer ${
//             activeTab === "handovers" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
//           }`}
//         >
//           <HistoryOutlined className="text-sm" />
//           Handover Sessions ({handovers.length})
//         </button>
//       </div>

//       {activeTab === "donations" ? (
//         <SectionCard 
//           title="Cash Donations Collected & Handed Over" 
//           right={
//             <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-md">
//               {donations.length} Donation{donations.length !== 1 ? 's' : ''} Found
//             </span>
//           }
//         >
//           <Table
//             dataSource={donations}
//             columns={donationColumns}
//             rowKey="name"
//             pagination={{
//               pageSize: 10,
//               showSizeChanger: true,
//               className: "!my-4"
//             }}
//             bordered
//             className="aavatto-premium-table"
//             scroll={{ x: 'max-content' }}
//           />
//         </SectionCard>
//       ) : (
//         <SectionCard 
//           title="Past Reset & Handover Logs" 
//           right={
//             <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-md">
//               {handovers.length} Session{handovers.length !== 1 ? 's' : ''} Found
//             </span>
//           }
//         >
//           <Table
//             dataSource={handovers}
//             columns={handoverColumns}
//             rowKey="name"
//             pagination={{
//               pageSize: 10,
//               showSizeChanger: true,
//               className: "!my-4"
//             }}
//             bordered
//             className="aavatto-premium-table"
//             scroll={{ x: 'max-content' }}
//           />
//         </SectionCard>
//       )}
//     </div>
//   );
// };

// export default LedgerTabsSection;


import React, { useState, useMemo } from "react";
import { Table, Input } from "antd";
import { WalletOutlined, HistoryOutlined, SearchOutlined } from "@ant-design/icons";

const LedgerTabsSection = ({ donations, handovers, donationColumns, handoverColumns }) => {
  const [activeTab, setActiveTab] = useState("donations");
  const [searchText, setSearchText] = useState("");

  const filteredDonations = useMemo(() => {
    if (!searchText) return donations || [];
    const q = searchText.toLowerCase();
    return (donations || []).filter(item => 
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.donor_name && item.donor_name.toLowerCase().includes(q)) ||
      (item.temple_name && item.temple_name.toLowerCase().includes(q)) ||
      (item.total_amount && String(item.total_amount).includes(q))
    );
  }, [donations, searchText]);

  const filteredHandovers = useMemo(() => {
    if (!searchText) return handovers || [];
    const q = searchText.toLowerCase();
    return (handovers || []).filter(item => 
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.collector_name && item.collector_name.toLowerCase().includes(q)) ||
      (item.owner && item.owner.toLowerCase().includes(q)) ||
      (item.opening_balance && String(item.opening_balance).includes(q))
    );
  }, [handovers, searchText]);

  return (
    <div className="ledger-merged-container">
      {/* Tab bar header */}
      <div className="ledger-tab-header" style={{
        justifyContent: "space-between",
        padding: "0 12px 0 0",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={() => {
              setActiveTab("donations");
              setSearchText("");
            }}
            style={{
              background: activeTab === "donations" ? "#ffffff" : "transparent",
              border: "none",
              borderBottom: activeTab === "donations" ? "2px solid #18181b" : "2px solid transparent",
              padding: "12px 20px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: activeTab === "donations" ? 700 : 600,
              color: activeTab === "donations" ? "#18181b" : "#71717a",
              outline: "none",
              marginBottom: "-1px"
            }}
            className="hover:text-zinc-800 hover:bg-zinc-50"
          >
            <WalletOutlined style={{ fontSize: "14px" }} />
            Collected Donations ({donations.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("handovers");
              setSearchText("");
            }}
            style={{
              background: activeTab === "handovers" ? "#ffffff" : "transparent",
              border: "none",
              borderBottom: activeTab === "handovers" ? "2px solid #18181b" : "2px solid transparent",
              padding: "12px 20px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: activeTab === "handovers" ? 700 : 600,
              color: activeTab === "handovers" ? "#18181b" : "#71717a",
              outline: "none",
              marginBottom: "-1px"
            }}
            className="hover:text-zinc-800 hover:bg-zinc-50"
          >
            <HistoryOutlined style={{ fontSize: "14px" }} />
            Handover Sessions ({handovers.length})
          </button>
        </div>

        {/* Search and Count badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "6px 0" }}>
          <Input
            placeholder={activeTab === "donations" ? "Search donations..." : "Search sessions..."}
            prefix={<SearchOutlined style={{ color: "#a1a1aa" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "220px", height: "32px", borderRadius: "6px" }}
            allowClear
            size="small"
          />
          <span
            className="text-xs font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-md"
          >
            {activeTab === "donations"
              ? `${filteredDonations.length} Donation${filteredDonations.length !== 1 ? 's' : ''} Found`
              : `${filteredHandovers.length} Session${filteredHandovers.length !== 1 ? 's' : ''} Found`
            }
          </span>
        </div>
      </div>

      {/* Table content directly below tabs — no gap */}
      <div className="ledger-merged-table">
        {activeTab === "donations" ? (
          <Table
            dataSource={filteredDonations}
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
        ) : (
          <Table
            dataSource={filteredHandovers}
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
        )}
      </div>
    </div>
  );
};

export default LedgerTabsSection;
