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


import React, { useState } from "react";
import { Table } from "antd";
import { WalletOutlined, HistoryOutlined } from "@ant-design/icons";

const LedgerTabsSection = ({ donations, handovers, donationColumns, handoverColumns }) => {
  const [activeTab, setActiveTab] = useState("donations");

  return (
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Simple Header without Card Wrapper */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" }}>
              Cash Donations Collected & Handed Over
            </span>
            <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-md">
              {donations.length} Donation{donations.length !== 1 ? 's' : ''} Found
            </span>
          </div>
          
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
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Simple Header without Card Wrapper */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" }}>
              Past Reset & Handover Logs
            </span>
            <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-md">
              {handovers.length} Session{handovers.length !== 1 ? 's' : ''} Found
            </span>
          </div>

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
        </div>
      )}
    </div>
  );
};

export default LedgerTabsSection;
