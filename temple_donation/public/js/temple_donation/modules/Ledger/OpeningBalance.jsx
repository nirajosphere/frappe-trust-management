import React, { useState, useEffect } from 'react';
import { Button, message, Popconfirm, Avatar, Typography, Table } from 'antd';
import { SyncOutlined, WalletOutlined, HistoryOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { userBalanceColumns } from '../../tabelcolumn/userBalanceTable';
import PageHeader from '../../components/common/PageHeader';
import CommonTable from '../../components/common/CommonTable';
import ActiveDonationsModal from './components/ActiveDonationsModal';

const { Text } = Typography;

const OpeningBalance = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useState("balances"); // "balances" or "logs"
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Active donations modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [activeDonations, setActiveDonations] = useState([]);
    const [loadingActiveDonations, setLoadingActiveDonations] = useState(false);

    const handleViewActiveDonations = async (user, userName) => {
        setSelectedUser(user);
        setSelectedUserName(userName);
        setIsModalOpen(true);
        setLoadingActiveDonations(true);
        try {
            if (typeof frappe !== 'undefined') {
                const response = await frappe.call({
                    method: 'temple_donation.api.get_active_user_donations',
                    args: { user }
                });
                if (response.message) {
                    setActiveDonations(response.message);
                } else {
                    setActiveDonations([]);
                }
            }
        } catch (e) {
            console.error(e);
            message.error("Failed to fetch active donations");
        } finally {
            setLoadingActiveDonations(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (typeof frappe !== 'undefined') {
                const response = await frappe.call({
                    method: 'temple_donation.api.get_user_balances'
                });
                if (response.message) {
                    setData(response.message);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            message.error('Failed to load user balances');
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
            if (typeof frappe !== 'undefined') {
                const response = await frappe.call({
                    method: 'temple_donation.api.get_handover_logs'
                });
                if (response.message) {
                    setLogs(response.message);
                }
            }
        } catch (error) {
            console.error('Fetch logs error:', error);
            message.error('Failed to load handover logs');
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleReset = async (userName, currentBalance) => {
        try {
            if (typeof frappe !== 'undefined') {
                const response = await frappe.call({
                    method: 'temple_donation.api.reset_user_balance',
                    args: {
                        user_name: userName,
                        amount: currentBalance
                    }
                });
                if (response.message) {
                    message.success(`Successfully handed over ₹${currentBalance.toLocaleString()}`);
                    // Immediately update local state to 0 for this user
                    setData(prev => prev.map(user =>
                        user.user_name === userName
                            ? { ...user, opening_balance: 0 }
                            : user
                    ));
                    // Refresh logs history
                    fetchLogs();
                }
            }
        } catch (error) {
            message.error('Reset failed');
        }
    };

    const handleRefresh = () => {
        if (activeTab === "balances") {
            fetchData();
        } else {
            fetchLogs();
        }
    };

    useEffect(() => {
        fetchData();
        fetchLogs();
    }, []);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
        } catch (e) {
            return dateStr;
        }
    };

    const columns = [
        ...userBalanceColumns,
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            width: 220,
            render: (_, record) => (
                <div className="flex gap-2 justify-end">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewActiveDonations(record.user_name, record.full_name)}
                        className="text-zinc-600 hover:text-white hover:bg-zinc-900 rounded-md px-3 py-1.5 font-medium transition-all"
                    >
                        View
                    </Button>
                    <Popconfirm
                        placement="leftTop"
                        title="Hand Over Cash"
                        description={`Reset ₹${Number(record.opening_balance || 0).toLocaleString()} to zero? This will record the cash as handed over.`}
                        onConfirm={() => handleReset(record.user_name, record.opening_balance)}
                        okText="Confirm"
                        cancelText="Cancel"
                        okButtonProps={{ className: "bg-zinc-900 border-zinc-900 hover:!bg-zinc-800" }}
                    >
                        <Button
                            type="text"
                            icon={<SyncOutlined />}
                            disabled={Number(record.opening_balance || 0) === 0}
                            className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                                Number(record.opening_balance || 0) === 0 
                                    ? "text-zinc-300 cursor-not-allowed" 
                                    : "text-zinc-600 hover:text-white hover:bg-zinc-900"
                            }`}
                        >
                            Reset
                        </Button>
                    </Popconfirm>
                </div>
            ),
        }
    ];

    const activeDonationColumns = [
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

    const logColumns = [
        {
            title: 'Cashier',
            dataIndex: 'user_name',
            key: 'user_name',
            width: 250,
            render: (text, record) => {
                const name = text || record.user || "Unknown";
                const initials = name.substring(0, 2).toUpperCase();

                return (
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={record.user_image}
                            size={26}
                            className="bg-zinc-100 text-zinc-500 font-semibold text-[11px] border border-zinc-200 shrink-0"
                        >
                            {initials}
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-gray-800 text-sm">
                                {name}
                            </span>
                            <span className="text-xs text-gray-400 truncate">
                                {record.user}
                            </span>
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Amount Handed Over',
            dataIndex: 'opening_balance',
            key: 'opening_balance',
            align: 'right',
            width: 240,
            render: (value) => (
                <div className="flex items-center justify-end gap-2 pr-4">
                    <Text strong className="text-green-600 text-base">
                        ₹{Number(value || 0).toLocaleString()}
                    </Text>
                </div>
            )
        },
        {
            title: 'Latest Hand Over',
            dataIndex: 'reset_date',
            key: 'reset_date',
            width: 200,
            render: (value) => (
                <span className="text-sm font-medium text-gray-600">
                    {formatDateTime(value)}
                </span>
            )
        },
        {
            title: 'Latest Collector',
            dataIndex: 'collector_name',
            key: 'collector_name',
            width: 220,
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
            title: 'Action',
            key: 'action',
            align: 'right',
            width: 120,
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        if (typeof frappe !== "undefined") {
                            frappe.set_route("temple-donation", "ledger", "view", record.user);
                        }
                    }}
                    className="text-zinc-600 hover:text-white hover:bg-zinc-900 rounded-md px-3 py-1.5 font-medium transition-all"
                >
                    View History
                </Button>
            )
        }
    ];

    return (
        <div className="animate-fadeIn py-6 space-y-6">
            <PageHeader
                title="Ledger & Cash Handovers"
                description="Manage and track opening balance resets and cash handovers"
                onSearch={setSearchText}
                searchPlaceholder={activeTab === "balances" ? "Search users..." : "Search logs..."}
                extra={[
                    <Button
                        key="refresh"
                        onClick={handleRefresh}
                        loading={activeTab === "balances" ? loading : loadingLogs}
                        icon={<SyncOutlined />}
                        className="flex items-center gap-2 px-4 border border-zinc-200 text-zinc-700 font-medium rounded-md bg-white hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all"
                    >
                        Refresh
                    </Button>
                ]}
            />

            {/* Tab Selector */}
            <div className="bg-zinc-100 p-1 rounded-lg flex items-center space-x-1 w-fit">
                <button
                    onClick={() => {
                        setActiveTab("balances");
                        setSearchText("");
                    }}
                    style={{
                        background: activeTab === "balances" ? "#ffffff" : "transparent",
                        border: "none",
                        boxShadow: activeTab === "balances" ? "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)" : "none",
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 outline-none cursor-pointer ${
                        activeTab === "balances"
                            ? "text-zinc-900"
                            : "text-zinc-500 hover:text-zinc-800"
                    }`}
                >
                    <WalletOutlined className="text-sm" />
                    Active Balances
                </button>
                <button
                    onClick={() => {
                        setActiveTab("logs");
                        setSearchText("");
                    }}
                    style={{
                        background: activeTab === "logs" ? "#ffffff" : "transparent",
                        border: "none",
                        boxShadow: activeTab === "logs" ? "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)" : "none",
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 outline-none cursor-pointer ${
                        activeTab === "logs"
                            ? "text-zinc-900"
                            : "text-zinc-500 hover:text-zinc-800"
                    }`}
                >
                    <HistoryOutlined className="text-sm" />
                    Handover History Logs
                </button>
            </div>

            {activeTab === "balances" ? (
                <CommonTable
                    columns={columns}
                    dataSource={data}
                    rowKey="user_name"
                    loading={loading}
                    searchText={searchText}
                />
            ) : (
                <CommonTable
                    columns={logColumns}
                    dataSource={logs}
                    rowKey="name"
                    loading={loadingLogs}
                    searchText={searchText}
                />
            )}

            <ActiveDonationsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedUser={selectedUser}
                selectedUserName={selectedUserName}
                activeDonations={activeDonations}
                loading={loadingActiveDonations}
                columns={activeDonationColumns}
            />
        </div>
    );
};

export default OpeningBalance;
