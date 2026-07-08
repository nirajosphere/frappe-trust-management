import React, { useState, useEffect } from 'react';
import { Button, Modal, Table } from 'antd';

const ActiveDonationsModal = ({
    isOpen,
    onClose,
    selectedUser,
    selectedUserName,
    activeDonations,
    loading,
    columns
}) => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    useEffect(() => {
        setPage(1);
    }, [selectedUser, activeDonations?.length, isOpen]);
    return (
        <Modal
            title={
                <div style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                        Active Cash Donations for {selectedUserName}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, fontFamily: "monospace", marginTop: "2px" }}>
                        {selectedUser}
                    </span>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            // footer={[
            //     <Button 
            //         key="close" 
            //         onClick={onClose}
            //         className="bg-zinc-900 border-zinc-900 hover:!bg-zinc-800 text-white hover:!text-white rounded-md font-semibold"
            //     >
            //         Close
            //     </Button>
            // ]}
            width={800}
            className="aavatto-premium-modal"
        >
            <div className="pt-4">
                <Table
                    dataSource={activeDonations}
                    columns={columns}
                    rowKey="name"
                    loading={loading}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        showSizeChanger: true,
                        className: "!my-2",
                        onChange: (p, s) => {
                            setPage(p);
                            setPageSize(s);
                        }
                    }}
                    bordered
                    className="aavatto-premium-table"
                    // size='small'
                    scroll={{ x: 'max-content' }}
                />
            </div>
        </Modal>
    );
};

export default ActiveDonationsModal;
