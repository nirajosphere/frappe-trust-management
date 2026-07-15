// import React from "react";
// import { Select, Card } from "antd";
// import { useFrappeGetDocList } from "../../hooks/useFrappe";

// const TempleSelect = ({ selectedTemple, onTempleSelect }) => {
//     const { data, loading } = useFrappeGetDocList("Temple", {
//         fields: ["name", "temple_name"]
//     });

//     return (
//         <Card title="Select Temple" size="small">
//             <Select
//                 mode="multiple"
//                 style={{ width: "100%" }}
//                 placeholder="Select temples"
//                 value={selectedTemple || []}
//                 onChange={onTempleSelect}
//                 loading={loading}
//                 options={data?.map(t => ({
//                     value: t.name,
//                     label: t.temple_name
//                 }))}
//                 filterOption={(input, option) =>
//                     (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
//                 }
//                 allowClear
//             />
//         </Card>
//     );
// };

// export default TempleSelect;


import React, { useEffect } from "react";
import { Select, Card } from "antd";
import { useFrappeGetDocList } from "../../hooks/useFrappe";

const TempleSelect = ({ selectedTemple, onTempleSelect }) => {
    const { data, loading } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"]
    });

    // Auto-select if there is only 1 temple available and none is currently selected
    useEffect(() => {
        if (data && data.length === 1 && (!selectedTemple || selectedTemple.length === 0)) {
            onTempleSelect([data[0].name]);
        }
    }, [data, selectedTemple, onTempleSelect]);

    return (
        <Card 
            title={<span style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>Select Trust</span>}
            size="small"
            style={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: 'none' }}
            headStyle={{ borderBottom: '1px solid #f3f4f6', padding: '12px 16px', background: '#f9fafb' }}
            bodyStyle={{ padding: '16px' }}
        >
            <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Select trusts"
                value={selectedTemple || []}
                onChange={onTempleSelect}
                loading={loading}
                disabled={data && data.length === 1}
                options={data?.map(t => ({
                    value: t.name,
                    label: t.temple_name
                }))}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                allowClear={!(data && data.length === 1)}
                dropdownStyle={{ borderRadius: '6px' }}
            />
        </Card>
    );
};

export default TempleSelect;