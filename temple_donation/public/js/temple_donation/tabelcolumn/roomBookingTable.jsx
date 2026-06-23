import React from "react";
import { Typography, Tag } from "antd";
import dayjs from "dayjs";
import { getTagConfig } from "../utils/tagUtils";

const { Text } = Typography;

export const roomBookingColumns = [
    {
        title: "Booking ID",
        dataIndex: "name",
        key: "name",
        width: 180,
        render: (text) => (
            <span style={{ whiteSpace: "nowrap" }}>
                <Text copyable>{text}</Text>
            </span>
        )
    },
    {
        title: "Donor",
        dataIndex: "donor",
        key: "donor",
        filterField: "donor.donor_name",
        render: (text) => <Text strong>{text}</Text>,
    },
    {
        title: "Room",
        dataIndex: "room",
        key: "room",
        filterField: "room.room_number",
        width: 120,
    },
    {
        title: "Check In",
        dataIndex: "check_in",
        key: "check_in",
        width: 220,
        render: (date) => (
            <span style={{ whiteSpace: "nowrap" }}>
                {date ? dayjs(date).format("ddd, DD MMM YYYY, hh:mm A") : "—"}
            </span>
        )
    },
    {
        title: "Check Out",
        dataIndex: "check_out",
        key: "check_out",
        width: 220,
        render: (date) => (
            <span style={{ whiteSpace: "nowrap" }}>
                {date ? dayjs(date).format("ddd, DD MMM YYYY, hh:mm A") : "—"}
            </span>
        )
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
