import React, { useState } from "react";
import { Row, Col, Alert, Tag, Button, Modal, DatePicker, message } from "antd";
import { Calendar, FileText, CheckCircle2, DollarSign, LogOut, Clock, Users } from "lucide-react";
import dayjs from "dayjs";
import { useFrappeGetDoc, useFrappeGetDocList } from "../../hooks/useFrappe";
import { DOCTYPE_ROOM_BOOKING } from "../../config/constants";
import PageLoader from "../../components/common/PageLoader";
import { getTagConfig } from "../../utils/tagUtils";
import DetailHeader from "../../components/common/DetailHeader";
import SectionCard from "../../components/common/SectionCard";
import FieldCell from "../../components/common/FieldCell";
import ViewContainer from "../../components/common/ViewContainer";
import ActivityLog from "../../components/common/ActivityLog";

const RoomBookingView = ({ id, onBack, onEdit }) => {
    const { data: doc, loading, error, mutate } = useFrappeGetDoc(DOCTYPE_ROOM_BOOKING, id);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [extendModal, setExtendModal] = useState(false);
    const [newCheckout, setNewCheckout] = useState(null);
    const [extendLoading, setExtendLoading] = useState(false);

    const { data: temples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });
    const { data: donors } = useFrappeGetDocList("Donor", {
        fields: ["name", "donor_name"],
        limit: 1000
    });
    const { data: rooms } = useFrappeGetDocList("Room", {
        fields: ["name", "room_number"],
        limit: 1000
    });

    if (loading) return <PageLoader />;

    if (error || !doc) {
        return (
            <div className="p-8">
                <Alert
                    message="Could not load booking details"
                    description={error?.message || "Booking not found"}
                    type="error"
                    showIcon
                    action={
                        <Button onClick={onBack} className="h-9 rounded-lg border-zinc-200 text-zinc-700">
                            Back
                        </Button>
                    }
                />
            </div>
        );
    }

    const isActive = doc.status === "Reserved" || doc.status === "Checked In";
    const matchedStatus = isActive ? "active" : doc.status === "Cancelled" ? "inactive" : "default";
    const statusTag = getTagConfig(matchedStatus);

    const templeObj = temples?.find(t => t.name === doc.temple);
    const templeName = templeObj ? templeObj.temple_name : (doc.temple || "Global");

    const donorObj = donors?.find(d => d.name === doc.donor);
    const donorName = donorObj ? donorObj.donor_name : (doc.donor || "—");

    const roomObj = rooms?.find(r => r.name === doc.room);
    const roomName = roomObj ? `Room ${roomObj.room_number}` : (doc.room || "—");

    // Duration calculation
    const checkInDate = doc.check_in ? dayjs(doc.check_in) : null;
    const checkOutDate = doc.check_out ? dayjs(doc.check_out) : null;
    const durationHours = checkInDate && checkOutDate ? checkOutDate.diff(checkInDate, 'hour') : 0;
    const durationDays = Math.ceil(durationHours / 24);

    const handleEarlyCheckout = () => {
        Modal.confirm({
            title: "Early Checkout",
            content: "Are you sure you want to check out this guest now? This will mark the room as Available.",
            okText: "Check Out Now",
            okType: "danger",
            onOk: () => {
                setCheckoutLoading(true);
                frappe.call({
                    method: "temple_donation.api.room_booking.early_checkout",
                    args: { booking_name: doc.name },
                    callback: (r) => {
                        setCheckoutLoading(false);
                        if (r.message?.success) {
                            message.success("Guest checked out successfully!");
                            mutate(); // Refresh data
                        }
                    },
                    error: (err) => {
                        setCheckoutLoading(false);
                        message.error(err?.message || "Checkout failed");
                    }
                });
            }
        });
    };

    const handleExtendBooking = () => {
        if (!newCheckout) {
            message.warning("Please select a new check-out date/time");
            return;
        }
        setExtendLoading(true);
        frappe.call({
            method: "temple_donation.api.room_booking.extend_booking",
            args: {
                booking_name: doc.name,
                new_check_out: newCheckout.format("YYYY-MM-DD HH:mm:ss")
            },
            callback: (r) => {
                setExtendLoading(false);
                if (r.message?.success) {
                    message.success("Booking extended successfully!");
                    setExtendModal(false);
                    mutate();
                }
            },
            error: (err) => {
                setExtendLoading(false);
                message.error(err?.message || "Extension failed");
            }
        });
    };

    return (
        <ViewContainer className="room-booking-view-container">
            {/* ── TOP HERO HEADER ── */}
            <DetailHeader
                onBack={onBack}
                title={`Booking ${doc.name}`}
                subtitle={`Guest: ${doc.guest_name || donorName}`}
                initials="B"
                tags={[doc.status]}
                actions={
                    <>
                        {isActive && (
                            <>
                                <Button
                                    onClick={() => setExtendModal(true)}
                                    className="px-4 border border-blue-200 text-blue-700 font-medium hover:border-blue-400 shadow-none text-sm transition-all flex items-center gap-1.5 bg-white"
                                >
                                    <Clock size={14} />
                                    Extend Stay
                                </Button>
                                <Button
                                    danger
                                    onClick={handleEarlyCheckout}
                                    loading={checkoutLoading}
                                    className="px-4 font-medium shadow-none text-sm transition-all flex items-center gap-1.5"
                                >
                                    <LogOut size={14} />
                                    Check Out
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={() => window.print()}
                            className="px-4 border border-zinc-200 text-zinc-700 font-medium hover:border-zinc-400 shadow-none text-sm transition-all flex items-center gap-1.5 bg-white"
                        >
                            Print
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => onEdit && onEdit(doc)}
                            className="px-4 bg-zinc-900 border-zinc-900 text-white font-medium hover:!bg-zinc-800 hover:!border-zinc-800 shadow-none text-sm transition-all flex items-center gap-1.5"
                        >
                            Edit
                        </Button>
                    </>
                }
            />

            {/* ── TWO COLUMN GRID ── */}
            <Row gutter={[24, 24]}>
                {/* Left Main View */}
                <Col xs={24} lg={17}>
                    <div className="flex flex-col gap-6">
                        {/* Guest Information */}
                        <SectionCard title="Guest Information" icon={<Users size={15} className="text-zinc-800" />}>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Guest Name">
                                        <span className="text-zinc-800 font-semibold">{doc.guest_name || "—"}</span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Guest ID">
                                        <span className="text-zinc-800 font-semibold">{doc.guest_id || "—"}</span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Donor">
                                        <span className="text-zinc-800 font-semibold">{donorName}</span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Number of Guests">
                                        <span className="text-zinc-800 font-semibold">{doc.number_of_guests || 1}</span>
                                    </FieldCell>
                                </Col>
                            </Row>
                        </SectionCard>

                        {/* Booking Information */}
                        <SectionCard title="Booking Information" icon={<Calendar size={15} className="text-zinc-800" />}>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Trust">
                                        <span className="text-zinc-800 font-semibold">{templeName}</span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Room">
                                        <span className="text-zinc-800 font-semibold">{roomName}</span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Booking Status">
                                        <Tag className={`tag-glass ${statusTag.glassClass} font-bold rounded-full !m-0`}>
                                            {doc.status}
                                        </Tag>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Duration">
                                        <span className="text-zinc-800 font-semibold">{durationDays} day{durationDays !== 1 ? 's' : ''} ({durationHours} hrs)</span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Check-In Time">
                                        <span className="text-zinc-800 font-semibold">
                                            {doc.check_in ? dayjs(doc.check_in).format("ddd, DD MMM YYYY, hh:mm A") : "—"}
                                        </span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Check-Out Time">
                                        <span className="text-zinc-800 font-semibold">
                                            {doc.check_out ? dayjs(doc.check_out).format("ddd, DD MMM YYYY, hh:mm A") : "—"}
                                        </span>
                                    </FieldCell>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FieldCell label="Total Amount">
                                        <span className="text-xl font-bold text-zinc-900">₹{Number(doc.total_amount || 0).toLocaleString()}</span>
                                    </FieldCell>
                                </Col>
                                {doc.remarks && (
                                    <Col xs={24}>
                                        <FieldCell label="Remarks">
                                            <span className="text-zinc-600">{doc.remarks}</span>
                                        </FieldCell>
                                    </Col>
                                )}
                            </Row>
                        </SectionCard>
                    </div>
                </Col>

                {/* Right Sidebar */}
                <Col xs={24} lg={7}>
                    <div className="sticky top-6 flex flex-col gap-6">
                        {/* Finance Card */}
                        <SectionCard title="Booking Finance" icon={<DollarSign size={15} className="text-zinc-800" />}>
                            <div className="flex flex-col gap-3 py-1">
                                {[
                                    {
                                        label: "Current Status", value: (
                                            <Tag className={`tag-glass ${statusTag.glassClass} !m-0`}>
                                                {doc.status || "N/A"}
                                            </Tag>
                                        )
                                    },
                                    {
                                        label: "Duration", value: (
                                            <span className="text-xs font-semibold text-zinc-800">
                                                {durationDays} Day{durationDays !== 1 ? 's' : ''}
                                            </span>
                                        )
                                    },
                                    {
                                        label: "Total Paid", value: (
                                            <span className="text-xs font-bold text-emerald-600">
                                                ₹{Number(doc.total_amount || 0).toLocaleString()}
                                            </span>
                                        )
                                    }
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center gap-4 border-b border-zinc-50 pb-2 last:border-0 last:pb-0">
                                        <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">{label}</span>
                                        {value}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        {/* System Logs */}
                        <SectionCard title="System Logs" icon={<FileText size={15} className="text-zinc-800" />}>
                            <div className="flex flex-col gap-2 py-1">
                                {[
                                    { label: "Document ID", value: <span className="font-mono text-[11px] font-semibold text-zinc-500 bg-zinc-50 px-2.5 py-0.5 rounded border border-zinc-100">{id}</span> },
                                    { label: "Created By", value: <span className="text-xs font-semibold text-zinc-600">{doc.owner || "System"}</span> },
                                    { label: "Created At", value: <span className="text-xs font-semibold text-zinc-600">{doc.creation ? new Date(doc.creation).toLocaleDateString() : "—"}</span> },
                                    { label: "Last Modified", value: <span className="text-xs font-semibold text-zinc-600">{doc.modified ? new Date(doc.modified).toLocaleDateString() : "—"}</span> }
                                ].map(({ label, value }) => (
                                    <div key={label} className={label === "Document ID" ? "flex flex-col gap-1 w-full" : "flex justify-between items-center gap-4 w-full"}>
                                        <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">{label}</span>
                                        {label === "Document ID" ? (
                                            <div className="w-full flex justify-start">{value}</div>
                                        ) : (
                                            value
                                        )}
                                    </div>
                                ))}

                                <div className="w-full border-t border-zinc-100 pt-3 mt-1 text-center">
                                    <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1.5">
                                        <CheckCircle2 size={13} />
                                        Verified System Record
                                    </span>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </Col>
            </Row>

            <ActivityLog doctype={DOCTYPE_ROOM_BOOKING} docname={id} />

            {/* Extend Booking Modal */}
            <Modal
                title="Extend Stay"
                open={extendModal}
                onCancel={() => setExtendModal(false)}
                onOk={handleExtendBooking}
                confirmLoading={extendLoading}
                okText="Extend Booking"
            >
                <div style={{ padding: '16px 0' }}>
                    <p style={{ marginBottom: '12px', color: '#52525b' }}>
                        Current check-out: <strong>{doc.check_out ? dayjs(doc.check_out).format("DD MMM YYYY, hh:mm A") : "—"}</strong>
                    </p>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>New Check-out Date & Time:</p>
                    <DatePicker
                        showTime
                        format="DD-MM-YYYY HH:mm"
                        className="w-full"
                        value={newCheckout}
                        onChange={(val) => setNewCheckout(val)}
                        disabledDate={(current) => current && current < dayjs(doc.check_out)}
                    />
                </div>
            </Modal>
        </ViewContainer>
    );
};

export default RoomBookingView;
