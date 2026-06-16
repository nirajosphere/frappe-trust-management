import React, { useState, useEffect } from 'react';
import { Button, message, Popconfirm } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { userBalanceColumns } from '../../tabelcolumn/userBalanceTable';
import PageHeader from '../../components/common/PageHeader';
import CommonTable from '../../components/common/CommonTable';

const OpeningBalance = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [searchText, setSearchText] = useState("");

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
                }
            }
        } catch (error) {
            message.error('Reset failed');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        ...userBalanceColumns,
        {
            title: 'ACTION',
            key: 'action',
            align: 'right',
            width: 160,
            render: (_, record) => (
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
                        className="text-zinc-600 hover:text-white hover:bg-zinc-900 rounded-md px-3 py-1.5 font-medium transition-all"
                    >
                        Reset
                    </Button>
                </Popconfirm>
            ),
        }
    ];

    return (
        <div className="animate-fadeIn py-6 space-y-6">
            <PageHeader
                title="User Opening Balance"
                description="Manage and reset hand-over cash for each user"
                onSearch={setSearchText}
                searchPlaceholder="Search users..."
                extra={[
                    <Button
                        key="refresh"
                        onClick={fetchData}
                        loading={loading}
                        icon={<SyncOutlined />}
                        className="flex items-center gap-2 h-9 px-4 border border-zinc-200 text-zinc-700 font-medium rounded-md bg-white hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all"
                    >
                        Refresh
                    </Button>
                ]}
            />
            <CommonTable
                columns={columns}
                dataSource={data}
                rowKey="user_name"
                loading={loading}
                searchText={searchText}
            />
        </div>
    );
};

export default OpeningBalance;

