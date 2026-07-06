import React, { useState, useEffect } from "react";
import { Button, message, Select, Space, DatePicker, Radio, Table, Popover, Card, Typography, Row, Col, Tag } from "antd";
import { ReloadOutlined, AppstoreOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";
import { useFrappeGetDocList } from "../../hooks/useFrappe";

// Modular Dashboard Components
import InventorySummaryCards from "./InventorySummaryCards";
import InventoryCharts from "./InventoryCharts";
import InventoryDetailsSection from "./InventoryDetailsSection";

dayjs.extend(relativeTime);
const { Title, Text } = Typography;

const InventoryDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [selectedTemple, setSelectedTemple] = useState(undefined);
    const [periodType, setPeriodType] = useState("month"); // 'today', 'week', 'month', 'custom'
    const [customRange, setCustomRange] = useState([]); // [dayjs, dayjs]
    const [popoverVisible, setPopoverVisible] = useState(false);

    const { data: temples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    const getPeriodDates = () => {
        let fromDate = null;
        let toDate = null;
        const now = dayjs();
        
        if (periodType === "today") {
            fromDate = now.format("YYYY-MM-DD");
            toDate = now.format("YYYY-MM-DD");
        } else if (periodType === "week") {
            fromDate = now.subtract(7, "day").format("YYYY-MM-DD");
            toDate = now.format("YYYY-MM-DD");
        } else if (periodType === "month") {
            fromDate = now.subtract(30, "day").format("YYYY-MM-DD");
            toDate = now.format("YYYY-MM-DD");
        } else if (periodType === "custom" && customRange && customRange.length === 2) {
            fromDate = customRange[0].format("YYYY-MM-DD");
            toDate = customRange[1].format("YYYY-MM-DD");
        }
        
        return { fromDate, toDate };
    };

    const call = (method, args = {}) => {
        return new Promise((resolve, reject) => {
            if (typeof frappe === "undefined") {
                resolve(null);
                return;
            }
            frappe.call({
                method,
                args,
                callback: (r) => resolve(r.message || r),
                error: (err) => reject(err)
            });
        });
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            setError(null);
            const { fromDate, toDate } = getPeriodDates();
            const res = await call("temple_donation.api.get_inventory_dashboard_data", { 
                temple: selectedTemple,
                from_date: fromDate,
                to_date: toDate
            });
            if (res) {
                setData(res);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load inventory dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (periodType === "custom" && (!customRange || customRange.length < 2)) {
            return;
        }
        fetchStats();
    }, [selectedTemple, periodType, customRange]);

    if (loading && !data) return <PageLoader />;

    const summary = data?.summary || {};
    const charts = data?.charts || {};
    const activities = data?.activities || {};

    // Transform Category data for Pie chart
    const pieData = charts.category_wise_stock?.map(c => ({
        name: c.name,
        value: parseFloat(c.value) || 0
    })).filter(item => item.value > 0) || [];

    // Transform Monthly In/Out data for Bar Chart
    const barData = charts.monthly_stock_in_out?.map(m => ({
        name: m.month_name,
        "Stock In": parseFloat(m.stock_in) || 0,
        "Stock Out": parseFloat(m.stock_out) || 0
    })) || [];

    // Transform Top Consumed data
    const topConsumedData = charts.top_consumed_items?.map(item => ({
        name: item.name,
        qty: parseFloat(item.value) || 0
    })) || [];

    // Dynamic card title suffix
    const getPeriodSuffix = () => {
        if (periodType === "today") return "Today's";
        if (periodType === "week") return "Weekly";
        if (periodType === "month") return "Monthly";
        return "Period";
    };

    return (
        <ViewContainer className="inventory-dashboard-page">
            <PageHeader 
                title="Inventory Dashboard"
                description="Overview of store items, stock levels, and movements"
                extra={(
                    <Space wrap size="middle">
                        <Select 
                            showSearch 
                            placeholder="All Trusts"
                            style={{ width: "200px" }}
                            optionFilterProp="children"
                            allowClear
                            value={selectedTemple}
                            onChange={(val) => setSelectedTemple(val)}
                            options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                        />
                        <Radio.Group 
                            value={periodType} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val !== "custom") {
                                    setPeriodType(val);
                                }
                            }}
                            optionType="button"
                            buttonStyle="solid"
                        >
                            <Radio.Button value="today">Today</Radio.Button>
                            <Radio.Button value="week">Week</Radio.Button>
                            <Radio.Button value="month">Month</Radio.Button>
                            <Popover
                                content={(
                                    <div style={{ padding: "4px" }} onClick={(e) => e.stopPropagation()}>
                                        <DatePicker.RangePicker 
                                            value={customRange}
                                            onChange={(dates) => {
                                                setCustomRange(dates);
                                                if (dates && dates.length === 2) {
                                                    setPopoverVisible(false);
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                                title="Select Custom Range"
                                trigger="click"
                                open={popoverVisible}
                                onOpenChange={(visible) => {
                                    setPopoverVisible(visible);
                                    if (visible) {
                                        setPeriodType("custom");
                                    }
                                }}
                            >
                                <Radio.Button value="custom" style={{ borderLeftWidth: "1px", borderRadius: "0 6px 6px 0" }}>
                                    {periodType === "custom" && customRange && customRange.length === 2 
                                        ? `${customRange[0].format("DD MMM")} - ${customRange[1].format("DD MMM")}`
                                        : "Custom"}
                                </Radio.Button>
                            </Popover>
                        </Radio.Group>
                        <Button 
                            type="default" 
                            icon={<ReloadOutlined />} 
                            onClick={fetchStats}
                            loading={loading}
                        >
                            Refresh Data
                        </Button>
                    </Space>
                )}
            />

            {error && (
                <div style={{ marginBottom: 24 }}>
                    <Card className="card-glass border-red-200 bg-red-50/50">
                        <Text type="danger">{error}</Text>
                    </Card>
                </div>
            )}

            {/* ── SUMMARY STATS CARDS ── */}
            <InventorySummaryCards 
                summary={summary}
                periodSuffix={getPeriodSuffix()}
            />

            {/* ── CHARTS (BAR & PIE) ── */}
            <InventoryCharts 
                barData={barData}
                pieData={pieData}
            />

            {/* ── LOGS & ACTIVITIES SECTION ── */}
            <InventoryDetailsSection 
                topConsumedData={topConsumedData}
                activities={activities}
            />

            {/* ── HIGH STOCK ITEMS TABLE ── */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24}>
                    <SectionCard title="Highest Stocked Items" icon={<AppstoreOutlined size={15} />}>
                        <Table
                            dataSource={data?.top_most_stock || []}
                            columns={[
                                { title: "Item Name", dataIndex: "name", key: "name", render: (text) => <Text strong className="text-zinc-800">{text}</Text> },
                                { title: "Category", dataIndex: "category", key: "category", render: (cat) => <Tag color="blue">{cat || "Uncategorized"}</Tag> },
                                { title: "Current Stock", dataIndex: "qty", key: "qty", align: "right", render: (val, record) => <Text strong className={val <= 0 ? "text-red-600" : "text-zinc-900"}>{val} {record.unit || 'Nos'}</Text> }
                            ]}
                            pagination={{ pageSize: 5 }}
                            size="middle"
                            bordered={false}
                            className="clean-table"
                            rowKey="name"
                        />
                    </SectionCard>
                </Col>
            </Row>
        </ViewContainer>
    );
};

export default InventoryDashboard;
