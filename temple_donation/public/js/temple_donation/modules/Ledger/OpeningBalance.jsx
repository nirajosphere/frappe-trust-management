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
            title: 'Reset Balance',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Button
                    type="default"
                    icon={<SyncOutlined />}
                    className="rounded-lg font-bold bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-900 hover:text-white transition-all"
                    onClick={() => handleReset(record.user_name, record.opening_balance)}
                >
                    Reset Cash
                </Button>
            ),
        },
    ];

    return (
        <div className="animate-fadeIn">
            <PageHeader
                title="User Opening Balance"
                subtitle="Manage and Reset Hand-over Cash for each user."
                extra={[
                    <Button
                        key="refresh"
                        onClick={fetchData}
                        loading={loading}
                        className=" border-zinc-200 hover:border-zinc-900 flex items-center gap-2 p-5 font-bold"
                        icon={<SyncOutlined />}
                    >
                        Refresh
                    </Button>
                ]}
            />

            <div className="p-8">
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
