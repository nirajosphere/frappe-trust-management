import React, { useState, useEffect } from 'react';
import { Button, message, Popconfirm, Avatar, Typography, Modal, Input, Tag, Dropdown } from 'antd';
import { SyncOutlined, WalletOutlined, HistoryOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { userBalanceColumns } from '../../tabelcolumn/userBalanceTable';
import PageHeader from '../../components/common/PageHeader';
import CommonTable from '../../components/common/CommonTable';
import ActiveDonationsModal from './components/ActiveDonationsModal';
import ViewContainer from '../../components/common/ViewContainer';
import SavedViewsBar from '../../components/common/SavedViewsBar';
import ActiveFiltersBar from '../../components/common/ActiveFiltersBar';
import { formatDateTime, applyClientSideSearch, applyClientSideFilters, applyClientSideSorters } from './utils/ledgerUtils';
import { originalBalanceColsBase, originalLogColsBase, activeDonationColumns } from './components/openingBalanceColumns';

const { Text } = Typography;


const OpeningBalance = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // Saved views rename/edit modal states
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renamingView, setRenamingView] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const [editModalFilters, setEditModalFilters] = useState([]);

    // Custom filtering, sorting, and column customization states for Active Balances
    const [balancesFilters, setBalancesFilters] = useState([]);
    const [balancesSorters, setBalancesSorters] = useState([]);
    const [customizedBalancesColumns, setCustomizedBalancesColumns] = useState([]);
    const [balancesSavedViews, setBalancesSavedViews] = useState([]);

    // Custom filtering, sorting, and column customization states for Handover History Logs
    const [logsFilters, setLogsFilters] = useState([]);
    const [logsSorters, setLogsSorters] = useState([]);
    const [customizedLogsColumns, setCustomizedLogsColumns] = useState([]);
    const [logsSavedViews, setLogsSavedViews] = useState([]);

    // Enrich the original columns using userBalanceColumns (to preserve its custom renders)
    const originalBalanceColsEnriched = React.useMemo(() => {
        return originalBalanceColsBase.map(col => {
            const match = userBalanceColumns.find(c => (c.dataIndex || c.key) === (col.dataIndex || col.key));
            if (match) {
                return { ...match, ...col };
            }
            return col;
        });
    }, []);

    const originalLogColsEnriched = originalLogColsBase;

    // Helper to load saved views from database
    const fetchSavedViews = (doctype, setSavedViews) => {
        if (typeof frappe !== "undefined") {
            frappe.call({
                method: "temple_donation.api.get_filter_views",
                args: { reference_doctype: doctype },
                callback: (r) => {
                    if (r.message) {
                        setSavedViews(r.message.map(v => {
                            let parsedFilters = [];
                            let parsedSorters = [];
                            try {
                                const data = JSON.parse(v.filters_json);
                                if (Array.isArray(data)) {
                                    parsedFilters = data;
                                } else if (data && typeof data === "object") {
                                    parsedFilters = data.filters || [];
                                    parsedSorters = data.sorters || [];
                                }
                            } catch (e) {}
                            return {
                                name: v.view_name,
                                rawRows: parsedFilters,
                                sorters: parsedSorters
                            };
                        }));
                    } else {
                        setSavedViews([]);
                    }
                }
            });
        }
    };

    const refreshBalancesViews = () => {
        fetchSavedViews("LedgerBalances", setBalancesSavedViews);
    };

    const refreshLogsViews = () => {
        fetchSavedViews("LedgerLogs", setLogsSavedViews);
    };

    // Helper to initialize/restore customized columns
    const initializeColumns = (originalCols, doctype, setCustomized) => {
        let initialCols = originalCols.map(c => ({ ...c, visible: true }));
        const savedLocal = localStorage.getItem(`columns_order_${doctype}`);
        if (savedLocal) {
            try {
                const parsed = JSON.parse(savedLocal);
                const reordered = [];
                parsed.forEach(savedCol => {
                    const match = originalCols.find(c => (c.dataIndex || c.key) === savedCol.dataIndex);
                    if (match) {
                        reordered.push({ ...match, visible: savedCol.visible !== false });
                    }
                });
                originalCols.forEach(c => {
                    const key = c.dataIndex || c.key;
                    if (key && !reordered.find(r => (r.dataIndex || r.key) === key)) {
                        reordered.push({ ...c, visible: true });
                    }
                });
                initialCols = reordered;
            } catch (e) {
                console.error(e);
            }
        }
        setCustomized(initialCols);

        if (typeof frappe !== "undefined") {
            frappe.call({
                method: "temple_donation.api.get_column_order",
                args: { reference_doctype: doctype },
                callback: (r) => {
                    if (r.message && Array.isArray(r.message) && r.message.length > 0) {
                        const parsed = r.message;
                        const reordered = [];
                        parsed.forEach(savedCol => {
                            const match = originalCols.find(c => (c.dataIndex || c.key) === savedCol.dataIndex);
                            if (match) {
                                reordered.push({ ...match, visible: savedCol.visible !== false });
                            }
                        });
                        originalCols.forEach(c => {
                            const key = c.dataIndex || c.key;
                            if (key && !reordered.find(r => (r.dataIndex || r.key) === key)) {
                                reordered.push({ ...c, visible: true });
                            }
                        });
                        setCustomized(reordered);
                        localStorage.setItem(`columns_order_${doctype}`, JSON.stringify(
                            reordered.map(c => ({ dataIndex: c.dataIndex || c.key, visible: c.visible !== false }))
                        ));
                    }
                }
            });
        }
    };

    const handleSaveBalancesColumns = (newCols) => {
        setCustomizedBalancesColumns(newCols);
        const storageData = newCols.map(c => ({
            dataIndex: c.dataIndex || c.key,
            visible: c.visible !== false
        }));
        localStorage.setItem("columns_order_LedgerBalances", JSON.stringify(storageData));

        if (typeof frappe !== "undefined") {
            frappe.call({
                method: "temple_donation.api.save_column_order",
                args: {
                    reference_doctype: "LedgerBalances",
                    columns_json: JSON.stringify(storageData)
                }
            });
        }
    };

    const handleSaveLogsColumns = (newCols) => {
        setCustomizedLogsColumns(newCols);
        const storageData = newCols.map(c => ({
            dataIndex: c.dataIndex || c.key,
            visible: c.visible !== false
        }));
        localStorage.setItem("columns_order_LedgerLogs", JSON.stringify(storageData));

        if (typeof frappe !== "undefined") {
            frappe.call({
                method: "temple_donation.api.save_column_order",
                args: {
                    reference_doctype: "LedgerLogs",
                    columns_json: JSON.stringify(storageData)
                }
            });
        }
    };

    // Sorting saving helpers
    const handleSaveBalancesSorters = (newSorters) => {
        setBalancesSorters(newSorters);
        localStorage.setItem("sort_order_LedgerBalances", JSON.stringify(newSorters));
    };

    const handleSaveLogsSorters = (newSorters) => {
        setLogsSorters(newSorters);
        localStorage.setItem("sort_order_LedgerLogs", JSON.stringify(newSorters));
    };

    // Load initial states
    useEffect(() => {
        fetchData();
        fetchLogs();

        // Restore customized columns & views
        initializeColumns(originalBalanceColsEnriched, "LedgerBalances", setCustomizedBalancesColumns);
        refreshBalancesViews();

        initializeColumns(originalLogColsEnriched, "LedgerLogs", setCustomizedLogsColumns);
        refreshLogsViews();

        // Restore sorters
        const savedBalancesSort = localStorage.getItem("sort_order_LedgerBalances");
        if (savedBalancesSort) {
            try {
                setBalancesSorters(JSON.parse(savedBalancesSort));
            } catch (e) {}
        }
        const savedLogsSort = localStorage.getItem("sort_order_LedgerLogs");
        if (savedLogsSort) {
            try {
                setLogsSorters(JSON.parse(savedLogsSort));
            } catch (e) {}
        }
    }, []);

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
                    setData(prev => prev.map(user =>
                        user.user_name === userName
                            ? { ...user, opening_balance: 0 }
                            : user
                    ));
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

    // Client-side search, filter, and sorting applications
    const processedBalancesData = React.useMemo(() => {
        let result = applyClientSideSearch(data, searchText, ["full_name", "user_name", "custom_user_role", "custom_select_temple"]);
        result = applyClientSideFilters(result, balancesFilters);
        result = applyClientSideSorters(result, balancesSorters);
        return result;
    }, [data, searchText, balancesFilters, balancesSorters]);

    const processedLogsData = React.useMemo(() => {
        let result = applyClientSideSearch(logs, searchText, ["user_name", "user", "collector_name"]);
        result = applyClientSideFilters(result, logsFilters);
        result = applyClientSideSorters(result, logsSorters);
        return result;
    }, [logs, searchText, logsFilters, logsSorters]);

    // Active Visible Columns mapping
    const visibleBalancesColumns = customizedBalancesColumns.length > 0
        ? customizedBalancesColumns.filter(c => c.visible !== false)
        : originalBalanceColsEnriched;

    const visibleLogsColumns = customizedLogsColumns.length > 0
        ? customizedLogsColumns.filter(c => c.visible !== false)
        : originalLogColsEnriched;

    // Table processed columns (with manual Action column appended)
    const finalBalancesColumns = React.useMemo(() => {
        return [
            ...visibleBalancesColumns,
            {
                title: 'Action',
                key: 'action',
                align: 'right',
                width: isMobile ? 80 : 220,
                fixed: 'right',
                render: (_, record) => {
                    const menuItems = [
                        {
                            key: 'view',
                            label: 'View',
                            icon: <EyeOutlined />,
                            onClick: () => handleViewActiveDonations(record.user_name, record.full_name)
                        },
                        {
                            key: 'reset',
                            label: 'Reset',
                            icon: <SyncOutlined />,
                            disabled: Number(record.opening_balance || 0) === 0,
                            onClick: () => {
                                Modal.confirm({
                                    title: 'Hand Over Cash',
                                    content: `Reset ₹${Number(record.opening_balance || 0).toLocaleString()} to zero? This will record the cash as handed over.`,
                                    okText: 'Confirm',
                                    cancelText: 'Cancel',
                                    okButtonProps: { className: "bg-zinc-900 border-zinc-900 hover:!bg-zinc-800" },
                                    onOk() {
                                        handleReset(record.user_name, record.opening_balance);
                                    }
                                });
                            }
                        }
                    ];

                    return (
                        <div className="flex justify-end items-center">
                            {!isMobile ? (
                                /* Desktop View */
                                <div className="flex gap-2">
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
                            ) : (
                                /* Mobile View */
                                <div className="flex">
                                    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                                        <Button 
                                            type="text"
                                            icon={<MoreOutlined style={{ fontSize: '18px' }} />} 
                                            className="text-zinc-600 hover:text-white hover:bg-zinc-900 rounded-md h-9 w-9 p-0 flex items-center justify-center transition-all"
                                        />
                                    </Dropdown>
                                </div>
                            )}
                        </div>
                    );
                }
            }
        ];
    }, [visibleBalancesColumns, isMobile]);

    const finalLogsColumns = React.useMemo(() => {
        return [
            ...visibleLogsColumns,
            {
                title: 'Action',
                key: 'action',
                align: 'right',
                width: isMobile ? 80 : 120,
                fixed: 'right',
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
                        {isMobile ? "View" : "View History"}
                    </Button>
                )
            }
        ];
    }, [visibleLogsColumns, isMobile]);

    // Mapped variables for PageHeader depending on activeTab
    const currentDoctype = activeTab === "balances" ? "LedgerBalances" : "LedgerLogs";
    const currentColumns = activeTab === "balances" ? originalBalanceColsEnriched : originalLogColsEnriched;
    const currentAppliedFilters = activeTab === "balances" ? balancesFilters : logsFilters;
    const setCurrentAppliedFilters = activeTab === "balances" ? setBalancesFilters : setLogsFilters;
    const currentAppliedSorters = activeTab === "balances" ? balancesSorters : logsSorters;
    const setCurrentAppliedSorters = activeTab === "balances" ? handleSaveBalancesSorters : handleSaveLogsSorters;
    const currentCustomizedColumns = activeTab === "balances" ? customizedBalancesColumns : customizedLogsColumns;
    const currentSaveColumns = activeTab === "balances" ? handleSaveBalancesColumns : handleSaveLogsColumns;
    const currentSavedViews = activeTab === "balances" ? balancesSavedViews : logsSavedViews;
    const currentRefreshViews = activeTab === "balances" ? refreshBalancesViews : refreshLogsViews;

    const handleSelectView = (view) => {
        setCurrentAppliedFilters(view.rawRows || []);
        setCurrentAppliedSorters(view.sorters || []);
    };

    const handleRenameView = () => {
        if (!renameValue.trim() || !renamingView) {
            message.warning("Please enter a valid view name");
            return;
        }

        const validRows = editModalFilters.filter(row => row.field && row.operator && row.value !== "");
        if (validRows.length === 0) {
            message.warning("At least one valid filter row is required");
            return;
        }

        const saveData = {
            filters: validRows,
            sorters: renamingView.sorters || []
        };

        if (typeof frappe !== "undefined") {
            frappe.call({
                method: "temple_donation.api.update_filter_view",
                args: {
                    old_view_name: renamingView.name,
                    new_view_name: renameValue.trim(),
                    reference_doctype: currentDoctype,
                    filters_json: JSON.stringify(saveData)
                },
                callback: () => {
                    message.success("View updated successfully!");
                    currentRefreshViews();
                    setIsRenameModalOpen(false);
                    setRenamingView(null);
                    setRenameValue("");
                    setEditModalFilters([]);
                }
            });
        }
    };

    const updateEditFilterRow = (index, key, val) => {
        const newRows = [...editModalFilters];
        newRows[index] = { ...newRows[index], [key]: val };
        setEditModalFilters(newRows);
    };

    return (
        <ViewContainer>
            <div className="animate-fadeIn space-y-6">
                <PageHeader
                    key={currentDoctype}
                    title="Ledger & Cash Handovers"
                    description="Manage and track opening balance resets and cash handovers"
                    onSearch={setSearchText}
                    searchPlaceholder={activeTab === "balances" ? "Search users..." : "Search logs..."}
                    columns={currentColumns}
                    doctype={currentDoctype}
                    appliedFilters={currentAppliedFilters}
                    onApplyFilters={setCurrentAppliedFilters}
                    appliedSorters={currentAppliedSorters}
                    onApplySorters={setCurrentAppliedSorters}
                    customizedColumns={currentCustomizedColumns}
                    onSaveColumns={currentSaveColumns}
                    savedViews={currentSavedViews}
                    onRefreshViews={currentRefreshViews}
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

                {/* Saved Views Bar */}
                {currentSavedViews.length > 0 && (
                    <SavedViewsBar
                        views={currentSavedViews}
                        appliedFilters={currentAppliedFilters}
                        onSelectView={handleSelectView}
                        onEditView={(view) => {
                            setRenamingView(view);
                            setRenameValue(view.name);
                            setEditModalFilters(JSON.parse(JSON.stringify(view.rawRows || [])));
                            setIsRenameModalOpen(true);
                        }}
                        onDeleteView={(viewName) => {
                            Modal.confirm({
                                title: 'Delete Filter View',
                                content: `Are you sure you want to delete the saved view "${viewName}"?`,
                                okText: 'Delete',
                                okType: 'danger',
                                cancelText: 'Cancel',
                                okButtonProps: { style: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' } },
                                onOk() {
                                    if (typeof frappe !== "undefined") {
                                        frappe.call({
                                            method: "temple_donation.api.delete_filter_view",
                                            args: {
                                                view_name: viewName,
                                                reference_doctype: currentDoctype
                                            },
                                            callback: () => {
                                                message.success("View deleted!");
                                                currentRefreshViews();
                                            }
                                        });
                                    }
                                }
                            });
                        }}
                    />
                )}

                <ActiveFiltersBar
                    appliedFilters={currentAppliedFilters}
                    columns={currentColumns}
                    onApplyFilters={setCurrentAppliedFilters}
                />

                {/* Tab + Table merged container */}
                <div className="ledger-merged-container">
                    {/* Tab bar header */}
                    <div className="ledger-tab-header">
                        <button
                            onClick={() => {
                                setActiveTab("balances");
                                setSearchText("");
                            }}
                            style={{
                                background: activeTab === "balances" ? "#ffffff" : "transparent",
                                border: "none",
                                borderBottom: activeTab === "balances" ? "2px solid #18181b" : "2px solid transparent",
                                padding: "12px 20px",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "13px",
                                fontWeight: activeTab === "balances" ? 700 : 600,
                                color: activeTab === "balances" ? "#18181b" : "#71717a",
                                outline: "none",
                                marginBottom: "-1px"
                            }}
                            className="hover:text-zinc-800 hover:bg-zinc-50"
                        >
                            <WalletOutlined style={{ fontSize: "14px" }} />
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
                                borderBottom: activeTab === "logs" ? "2px solid #18181b" : "2px solid transparent",
                                padding: "12px 20px",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "13px",
                                fontWeight: activeTab === "logs" ? 700 : 600,
                                color: activeTab === "logs" ? "#18181b" : "#71717a",
                                outline: "none",
                                marginBottom: "-1px"
                            }}
                            className="hover:text-zinc-800 hover:bg-zinc-50"
                        >
                            <HistoryOutlined style={{ fontSize: "14px" }} />
                            Handover History Logs
                        </button>
                    </div>

                    {/* Table content directly below tabs — no gap */}
                    <div className="ledger-merged-table">
                        {activeTab === "balances" ? (
                            <CommonTable
                                columns={finalBalancesColumns}
                                dataSource={processedBalancesData}
                                rowKey="user_name"
                                loading={loading}
                                searchText={searchText}
                            />
                        ) : (
                            <CommonTable
                                columns={finalLogsColumns}
                                dataSource={processedLogsData}
                                rowKey="name"
                                loading={loadingLogs}
                                searchText={searchText}
                            />
                        )}
                    </div>
                </div>

                <ActiveDonationsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    selectedUser={selectedUser}
                    selectedUserName={selectedUserName}
                    activeDonations={activeDonations}
                    loading={loadingActiveDonations}
                    columns={activeDonationColumns}
                />

                {/* Edit Saved View Modal */}
                <Modal
                    title="Edit Saved View"
                    open={isRenameModalOpen}
                    onOk={handleRenameView}
                    onCancel={() => {
                        setIsRenameModalOpen(false);
                        setRenamingView(null);
                        setRenameValue("");
                        setEditModalFilters([]);
                    }}
                    okText="Save Changes"
                    cancelText="Cancel"
                    okButtonProps={{ style: { backgroundColor: "#000", borderColor: "#000" } }}
                    width={680}
                    destroyOnHidden
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "12px" }}>
                        <div>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#8c8c8c", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
                                View Name:
                            </div>
                            <Input
                                placeholder="e.g. Active Cashiers..."
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                style={{ height: "40px" }}
                                className="font-medium"
                                autoFocus
                            />
                        </div>

                        <div>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#8c8c8c", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
                                Applied Filters Preview:
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                                {editModalFilters.filter(row => row.field && row.operator && row.value !== "").map((row, idx) => {
                                    const col = currentColumns?.find(c => (c.dataIndex || c.key) === row.field);
                                    const fieldLabel = col ? col.title : row.field;
                                    let displayVal = row.value;
                                    if (col && col.filterType === "select" && col.filterOptions) {
                                        const match = col.filterOptions.find(o => o.value === row.value);
                                        if (match) {
                                            displayVal = match.label;
                                        }
                                    }
                                    return (
                                        <Tag
                                            key={idx}
                                            style={{
                                                padding: "4px 12px",
                                                borderRadius: "16px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                backgroundColor: "#f4f4f5",
                                                color: "#27272a",
                                                border: "1px solid #e4e4e7",
                                                display: "inline-flex",
                                                alignItems: "center"
                                            }}
                                        >
                                            <span style={{ color: "#71717a", marginRight: "4px" }}>{fieldLabel}</span>
                                            <span style={{ color: "#a1a1aa", marginRight: "4px", fontSize: "11px" }}>{row.operator}</span>
                                            <strong style={{ color: "#09090b" }}>{displayVal}</strong>
                                        </Tag>
                                    );
                                })}
                                {editModalFilters.filter(row => row.field && row.operator && row.value !== "").length === 0 && (
                                    <span style={{ fontSize: "13px", color: "#a1a1aa", fontStyle: "italic" }}>No filters configured</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </ViewContainer>
    );
};

export default OpeningBalance;
