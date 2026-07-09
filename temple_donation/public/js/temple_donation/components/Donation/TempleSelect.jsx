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


import React, { useState, useEffect } from "react";
import { Select, Card } from "antd";
import { useFrappeGetDocList } from "../../hooks/useFrappe";
import { useUser } from "../../context/UserContext";

const TempleSelect = ({ selectedTemple, onTempleSelect }) => {
    const { isSystemManager, isSuperAdmin, user } = useUser();
    const [filters, setFilters] = useState({});
    const [fetchingAssigned, setFetchingAssigned] = useState(false);

    useEffect(() => {
        const fetchAssignedTemples = async () => {
            const isManager = isSystemManager || isSuperAdmin;
            if (typeof frappe !== "undefined" && !isManager && user?.email) {
                setFetchingAssigned(true);
                try {
                    const userRes = await frappe.call({
                        method: "frappe.client.get",
                        args: {
                            doctype: "User",
                            name: user.email
                        }
                    });
                    const myTemples = userRes.message?.custom_select_temple?.map(t => t.temple) || [];
                    if (myTemples.length > 0) {
                        setFilters({ name: ["in", myTemples] });
                    } else {
                        // User has no assigned temples, show none
                        setFilters({ name: "NO_TEMPLE_ASSIGNED" });
                    }
                } catch (err) {
                    console.error("Error fetching user assigned temples:", err);
                } finally {
                    setFetchingAssigned(false);
                }
            }
        };

        fetchAssignedTemples();
    }, [isSystemManager, isSuperAdmin, user?.email]);

    const { data, loading } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        filters: filters
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
            headStyle={{ borderBottom: '1px solid #f3f4f6', padding: '12px 16px' }}
            bodyStyle={{ padding: '16px' }}
        >
            <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Select trusts"
                value={selectedTemple || []}
                onChange={onTempleSelect}
                loading={loading || fetchingAssigned}
                options={data?.map(t => ({
                    value: t.name,
                    label: t.temple_name
                }))}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                allowClear
                dropdownStyle={{ borderRadius: '6px' }}
            />
        </Card>
    );
};

export default TempleSelect;