import React from "react";
import { Select, Card, Typography, Space } from "antd";
import { useFrappeGetDocList } from "../../hooks/useFrappe";
import { EnvironmentOutlined } from "@ant-design/icons";

const { Text } = Typography;

const TempleSelect = ({ selectedTemple, onTempleSelect }) => {
    const { data: temples, loading } = useFrappeGetDocList("Temple", { fields: ["name", "temple_name"] });

    return (
        <Card 
            title={
                <Space>
                    <EnvironmentOutlined className="text-zinc-900" />
                    <span className="font-bold tracking-tight text-zinc-800">Select Temple</span>
                </Space>
            } 
            size="small" 
            className="aavatto-card mb-6"
        >
            <div className="flex flex-col gap-2">
                <Text strong className="text-zinc-500 block mb-1">Target Temple</Text>
                <Select
                    placeholder="Search and select a temple"
                    className="w-full h-12 rounded-xl"
                    value={selectedTemple}
                    onChange={onTempleSelect}
                    loading={loading}
                    showSearch
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={temples?.map(t => ({
                        value: t.name,
                        label: t.temple_name
                    }))}
                />
                {temples?.length === 0 && !loading && (
                    <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <Text className="text-zinc-600 font-medium select-none">
                            ℹ️ No temples found in the system. Please add one in Frappe.
                        </Text>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default TempleSelect;
