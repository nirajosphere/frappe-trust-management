import React from "react";
import { Row, Col, Typography, Empty, Timeline, Tag, List } from "antd";
import { RiseOutlined, HistoryOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import SectionCard from "../../components/common/SectionCard";
import { getTagConfig } from "../../utils/tagUtils";

const { Text } = Typography;

const COLORS = [
    "hsl(220, 90%, 56%)", // Royal Blue
    "hsl(142, 71%, 45%)", // Emerald Green
    "hsl(38, 92%, 50%)",  // Amber
    "hsl(0, 84%, 60%)",   // Coral
    "hsl(262, 83%, 58%)", // Violet
    "hsl(180, 70%, 45%)", // Teal
];

const InventoryDetailsSection = ({ topConsumedData, activities }) => {
    return (
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            {/* Top Consumed Items */}
            <Col xs={24} lg={8}>
                <SectionCard title="Top Consumed Items" icon={<RiseOutlined size={15} />}>
                    {topConsumedData.length > 0 ? (
                        <div className="flex flex-col gap-4 py-2">
                            {topConsumedData.map((item, index) => {
                                const maxVal = Math.max(...topConsumedData.map(d => d.qty), 1);
                                const pct = (item.qty / maxVal) * 100;
                                return (
                                    <div key={item.name} className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <Text strong className="text-zinc-700">{item.name}</Text>
                                            <Text className="font-bold text-zinc-950">{item.qty} Units</Text>
                                        </div>
                                        <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                                            <div 
                                                style={{ width: `${pct}%`, backgroundColor: COLORS[index % COLORS.length] }} 
                                                className="h-full rounded-full transition-all duration-500" 
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <Empty description="No item consumption logs found" />
                    )}
                </SectionCard>
            </Col>

            {/* Latest Stock Movements Timeline */}
            <Col xs={24} lg={8}>
                <SectionCard title="Latest Stock Movements" icon={<HistoryOutlined size={15} />}>
                    {activities.latest_stock_entries?.length > 0 ? (
                        <Timeline 
                            className="custom-timeline pt-2"
                            items={activities.latest_stock_entries.map(entry => {
                                const typeTag = getTagConfig(entry.purpose === "Receipt" ? "active" : entry.purpose === "Issue" ? "inactive" : "manager");
                                return {
                                    color: entry.purpose === "Receipt" ? "green" : entry.purpose === "Issue" ? "red" : "blue",
                                    children: (
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex justify-between items-center">
                                                <Text strong className="text-xs">{entry.temple_name || entry.name}</Text>
                                                <Tag className={`tag-glass ${typeTag.glassClass} font-bold rounded-full !m-0 !py-0 !px-1.5`}>
                                                    {entry.purpose}
                                                </Tag>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-zinc-400">
                                                <span>By: {entry.owner_name} | Entry: {entry.name}</span>
                                                <span>{dayjs(entry.posting_date).fromNow()}</span>
                                            </div>
                                        </div>
                                    )
                                };
                            })}
                        />
                    ) : (
                        <Empty description="No recent stock entries" />
                    )}
                </SectionCard>
            </Col>

            {/* Recent Item Donations */}
            <Col xs={24} lg={8}>
                <SectionCard title="Latest Item Donations" icon={<HistoryOutlined size={15} />}>
                    {activities.latest_donations?.length > 0 ? (
                        <List
                            size="small"
                            dataSource={activities.latest_donations}
                            renderItem={(item) => (
                                <List.Item className="px-0 py-2 border-b border-zinc-50 last:border-0 last:pb-0">
                                    <div className="flex flex-col w-full gap-0.5">
                                        <div className="flex justify-between items-center">
                                            <Text strong className="text-xs text-zinc-800">{item.donor_name}</Text>
                                            <span className="font-semibold text-xs text-emerald-600">₹{parseFloat(item.amount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-zinc-400">
                                            <span>Entry: {item.name}</span>
                                            <span>{dayjs(item.posting_date).fromNow()}</span>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description="No recent item donations registered" />
                    )}
                </SectionCard>
            </Col>
        </Row>
    );
};

export default InventoryDetailsSection;
