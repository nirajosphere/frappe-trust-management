import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Card, Typography, Tag } from 'antd';
import { SyncOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons';
import { userBalanceColumns } from '../../tabelcolumn/userBalanceTable';
import PageHeader from '../../components/common/PageHeader';

const { Title, Text } = Typography;

const OpeningBalance = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

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
                <Button
                    type="text"
                    icon={<SyncOutlined />}
                    className="text-zinc-600 hover:text-white hover:bg-zinc-900 rounded-md px-3 py-1.5 font-medium transition-all"
                    onClick={() => handleReset(record.user_name, record.opening_balance)}
                >
                    Reset
                </Button>
            ),
        }
    ];

    return (
        <div className="animate-fadeIn py-6 space-y-6">
            <PageHeader
                title={
                    <div className="flex flex-col">
                        <span className="text-[32px] font-bold text-zinc-900">
                            User Opening Balance
                        </span>
                        <span className="text-sm mt-1 text-zinc-500 font-medium">
                            Manage and reset hand-over cash for each user
                        </span>
                    </div>
                }
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
            <div className="">
                {/* <Card className="rounded-[32px] border-zinc-100 shadow-sm overflow-hidden"> */}
                {/* <div className="p-2"> */}
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="user_name"
                    loading={loading}
                    pagination={false}
                    className="aavatto-premium-table"
                />
                {/* </div> */}
                {/* </Card> */}
            </div>
        </div>
    );
};

export default OpeningBalance;
