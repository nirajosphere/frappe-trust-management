import React from "react";
import { Typography, Tag } from "antd";
import { getTagConfig } from "../utils/tagUtils";

const { Text } = Typography;

export const roomBookingColumns = [
    {
        title: "Booking ID",
        dataIndex: "name",
        key: "name",
        width: 150,
        render: (text) => <Text copyable>{text}</Text>
    },
    {
        title: "Donor",
        dataIndex: "donor",
        key: "donor",
        render: (text) => <Text strong>{text}</Text>,
    },
    {
        title: "Room",
        dataIndex: "room",
        key: "room",
        width: 120,
    },
    {
        title: "Check In",
        dataIndex: "check_in",
        key: "check_in",
        width: 170,
    },
    {
        title: "Check Out",
        dataIndex: "check_out",
        key: "check_out",
        width: 170,
    },
    {
        title: "Amount",
        dataIndex: "total_amount",
        key: "total_amount",
        width: 120,
        render: (val) => <Text type="success" strong>₹{Number(val || 0).toLocaleString()}</Text>,
        sorter: (a, b) => (a.total_amount || 0) - (b.total_amount || 0),
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: (status) => {
            const matchedStatus = (status === "Booked" || status === "Checked In") ? "active" : status === "Cancelled" ? "inactive" : "default";
            const config = getTagConfig(matchedStatus);
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {status}
                </Tag>
            );
        },
    },
];
