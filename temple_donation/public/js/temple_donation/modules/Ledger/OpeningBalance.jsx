import React, { useState, useEffect } from 'react';
import { Button, message, Popconfirm, Avatar, Typography, Modal, Input, Space, Tag } from 'antd';
import { SyncOutlined, WalletOutlined, HistoryOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { userBalanceColumns } from '../../tabelcolumn/userBalanceTable';
import PageHeader from '../../components/common/PageHeader';
import CommonTable from '../../components/common/CommonTable';
import ActiveDonationsModal from './components/ActiveDonationsModal';
import ViewContainer from '../../components/common/ViewContainer';
import SavedViewsBar from '../../components/common/SavedViewsBar';

const { Text } = Typography;

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

// Define baseline columns for Active Balances (enriching them with render functions locally)
const originalBalanceColsBase = [
    {
        title: 'User',
        dataIndex: 'full_name',
        key: 'full_name',
        width: 250,
        filterType: 'string'
    },
    {
        title: "Role",
        dataIndex: "custom_user_role",
        key: "custom_user_role",
        width: 140,
        filterType: 'select',
        filterOptions: [
            { value: "cashier", label: "Cashier" },
            { value: "temple admin", label: "Temple Admin" },
            { value: "trust admin", label: "Trust Admin" }
        ]
    },
    {
        title: "Temples",
        dataIndex: "custom_select_temple",
        key: "custom_select_temple",
        width: 180,
        filterType: 'string'
    },
    {
        title: 'Opening Balance',
        dataIndex: 'opening_balance',
        key: 'opening_balance',
        align: 'right',
        width: 180,
        filterType: 'number'
    }
];

// Define baseline columns for Handover History Logs
const originalLogColsBase = [
    {
        title: 'Cashier',
        dataIndex: 'user_name',
        key: 'user_name',
        width: 250,
        filterType: 'string',
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
        filterType: 'number',
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
        filterType: 'date',
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
        filterType: 'string',
        render: (text, record) => (
            <div className="flex items-center gap-2">
                <Avatar size="small" icon={<UserOutlined />} className="bg-zinc-800" />
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-800">{text}</span>
                    <span className="text-[10px] text-zinc-400">{record.owner}</span>
                </div>
            </div>
        )
    }
];

// Helper to apply client-side text searches
const applyClientSideSearch = (items, searchText, fieldsToSearch) => {
    if (!searchText) return items;
    const query = searchText.toLowerCase();
    return items.filter(item => {
        return fieldsToSearch.some(field => {
            let val = item[field];
            if (field === "custom_select_temple" && Array.isArray(val)) {
                val = val.map(t => t.temple_name || t.temple || "").join(", ");
            }
            return String(val || "").toLowerCase().includes(query);
        });
    });
};

// Helper to apply client-side filters
const applyClientSideFilters = (items, filterRules) => {
    if (!filterRules || filterRules.length === 0) return items;
    return items.filter(item => {
        return filterRules.every(rule => {
            const { field, operator, value } = rule;
            if (!field || !operator) return true;

            let itemVal = item[field];
            if (itemVal === undefined || itemVal === null) {
                itemVal = "";
            }

            if (field === "custom_select_temple" && Array.isArray(itemVal)) {
                itemVal = itemVal.map(t => t.temple_name || t.temple || "").join(", ");
            }

            const itemStr = String(itemVal).toLowerCase();
            const filterStr = String(value).toLowerCase();

            const itemNum = Number(itemVal);
            const filterNum = Number(value);
            const isNumericCompare = !isNaN(itemNum) && !isNaN(filterNum) && typeof itemVal !== 'string';

            switch (operator) {
                case "=":
                    if (isNumericCompare) return itemNum === filterNum;
                    return itemStr === filterStr;
                case "!=":
                    if (isNumericCompare) return itemNum !== filterNum;
                    return itemStr !== filterStr;
                case "like":
                    return itemStr.includes(filterStr);
                case "not like":
                    return !itemStr.includes(filterStr);
                case ">":
                    if (isNumericCompare) return itemNum > filterNum;
                    return itemStr > filterStr;
                case "<":
                    if (isNumericCompare) return itemNum < filterNum;
                    return itemStr < filterStr;
                case ">=":
                    if (isNumericCompare) return itemNum >= filterNum;
                    return itemStr >= filterStr;
                case "<=":
                    if (isNumericCompare) return itemNum <= filterNum;
                    return itemStr <= filterStr;
                case "in":
                    const inList = Array.isArray(value) ? value : String(value).split(",").map(s => s.trim().toLowerCase());
                    return inList.includes(itemStr);
                case "not in":
                    const notInList = Array.isArray(value) ? value : String(value).split(",").map(s => s.trim().toLowerCase());
                    return !notInList.includes(itemStr);
                default:
                    return true;
            }
        });
    });
};

// Helper to apply client-side multi-column sorting
const applyClientSideSorters = (items, sortRules) => {
    if (!sortRules || sortRules.length === 0) return items;
    const sorted = [...items];
    sorted.sort((a, b) => {
        for (const sorter of sortRules) {
            const { field, order } = sorter;
            let valA = a[field];
            let valB = b[field];

            if (field === "custom_select_temple" && Array.isArray(valA)) {
                valA = valA.map(t => t.temple_name || t.temple || "").join(", ");
            }
            if (field === "custom_select_temple" && Array.isArray(valB)) {
                valB = valB.map(t => t.temple_name || t.temple || "").join(", ");
            }

            if (valA === undefined || valA === null) valA = "";
            if (valB === undefined || valB === null) valB = "";

            const numA = Number(valA);
            const numB = Number(valB);
            const isNumeric = !isNaN(numA) && !isNaN(numB) && typeof valA !== 'string' && typeof valB !== 'string';

            if (isNumeric) {
                if (numA !== numB) {
                    return order === "ascend" ? numA - numB : numB - numA;
                }
            } else {
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                if (strA !== strB) {
                    return order === "ascend"
                        ? strA.localeCompare(strB)
                        : strB.localeCompare(strA);
                }
            }
        }
        return 0;
    });
    return sorted;
};

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
    }, [visibleBalancesColumns]);

    const finalLogsColumns = React.useMemo(() => {
        return [
            ...visibleLogsColumns,
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
    }, [visibleLogsColumns]);

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
                    destroyOnClose
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
