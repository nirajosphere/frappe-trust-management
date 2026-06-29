import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { formatDateTime } from '../utils/ledgerUtils';

export const getDonationColumns = (donations) => [
  {
    title: "Donation Id",
    dataIndex: "name",
    key: "name",
    sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
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
    sorter: (a, b) => (a.donor_name || "").localeCompare(b.donor_name || ""),
    filters: Array.from(new Set((donations || []).map(d => d.donor_name || "Anonymous"))).map(name => ({
      text: name,
      value: name
    })),
    onFilter: (value, record) => (record.donor_name || "Anonymous") === value,
    render: (text) => <span className="font-semibold text-sm text-zinc-800">{text || "Anonymous"}</span>
  },
  {
    title: "Trust",
    dataIndex: "temple_name",
    key: "temple_name",
    sorter: (a, b) => (a.temple_name || "").localeCompare(b.temple_name || ""),
    filters: Array.from(new Set((donations || []).map(d => d.temple_name).filter(Boolean))).map(name => ({
      text: name,
      value: name
    })),
    onFilter: (value, record) => record.temple_name === value,
    render: (text) => <span className="text-xs text-zinc-500 font-medium">{text}</span>
  },
  {
    title: "Date & Time",
    dataIndex: "creation",
    key: "creation",
    sorter: (a, b) => new Date(a.creation || 0) - new Date(b.creation || 0),
    render: (val) => <span className="text-xs text-zinc-500">{formatDateTime(val)}</span>
  },
  {
    title: "Amount",
    dataIndex: "total_amount",
    key: "total_amount",
    align: "right",
    sorter: (a, b) => (a.total_amount || 0) - (b.total_amount || 0),
    render: (val) => (
      <span className="font-bold text-zinc-900 pr-2">
        ₹{Number(val || 0).toLocaleString("en-IN")}
      </span>
    )
  }
];

export const getHandoverColumns = (handovers) => [
  {
    title: "Log Id",
    dataIndex: "name",
    key: "name",
    sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
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
    sorter: (a, b) => new Date(a.reset_date || 0) - new Date(b.reset_date || 0),
    render: (val) => <span className="text-sm font-medium text-zinc-600">{formatDateTime(val)}</span>
  },
  {
    title: "Collected By",
    dataIndex: "collector_name",
    key: "collector_name",
    sorter: (a, b) => (a.collector_name || "").localeCompare(b.collector_name || ""),
    filters: Array.from(new Set((handovers || []).map(h => h.collector_name).filter(Boolean))).map(name => ({
      text: name,
      value: name
    })),
    onFilter: (value, record) => record.collector_name === value,
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
    sorter: (a, b) => (a.opening_balance || 0) - (b.opening_balance || 0),
    render: (val) => (
      <span className="font-bold text-green-600 pr-2 text-sm">
        ₹{Number(val || 0).toLocaleString("en-IN")}
      </span>
    )
  }
];
