// import React from "react";
// import { Card, Typography, Spin, Timeline, Avatar, Tag, Alert } from "antd";
// import { ClockCircleOutlined, UserOutlined, ArrowLeftOutlined } from "@ant-design/icons";
// import { useFrappeGetVersions } from "../../hooks/useFrappe";

// const { Title, Text } = Typography;

// const ChangeHistory = ({ doctype, docname }) => {
//     const { data: versions, loading: versionLoading } = useFrappeGetVersions(doctype, docname);

//     if (!docname) return null;

//     return (
//         <Card size="small" className="aavatto-card mt-6">
//             <div className="p-4 border-b border-zinc-100">
//                 <Title level={5} className="!m-0 flex items-center gap-2">
//                     <ClockCircleOutlined className="text-zinc-400" />
//                     Change History
//                 </Title>
//             </div>
//             {versionLoading ? (
//                 <div className="p-10 text-center"><Spin /></div>
//             ) : versions && versions.length > 0 ? (
//                 <Timeline className="p-6 mt-4" mode="left">
//                     {versions.map((v) => {
//                         let changes = {};
//                         try {
//                             changes = JSON.parse(v.data || "{}");
//                         } catch (e) { }

//                         return (
//                             <Timeline.Item
//                                 key={v.name}
//                                 dot={<Avatar size="small" icon={<UserOutlined />} className="bg-zinc-800" />}
//                                 color="gray"
//                             >
//                                 <div className="mb-2">
//                                     <Text strong>{v.owner}</Text>
//                                     <Text type="secondary" className="text-xs ml-2">
//                                         {new Date(v.creation).toLocaleString()}
//                                     </Text>
//                                 </div>
//                                 {changes.changed && changes.changed.length > 0 ? (
//                                     <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-md mt-2">
//                                         {changes.changed.map(([field, oldVal, newVal]) => (
//                                             <div key={field} className="text-sm mb-1 last:mb-0 flex items-center gap-2 flex-wrap">
//                                                 <Tag className="m-0 border-zinc-200 bg-white capitalize text-zinc-600">
//                                                     {field.replace(/_/g, ' ')}
//                                                 </Tag>
//                                                 <Text delete className="text-red-400 break-all">{oldVal || 'None'}</Text>
//                                                 <ArrowLeftOutlined className="text-[10px] text-zinc-400 rotate-180" />
//                                                 <Text className="text-green-500 font-medium break-all">{newVal || 'None'}</Text>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <Text type="secondary" className="text-sm italic">Modified document</Text>
//                                 )}
//                             </Timeline.Item>
//                         );
//                     })}
//                 </Timeline>
//             ) : (
//                 <Alert message="No change history found." type="info" showIcon className="m-6 bg-zinc-50 border-zinc-200 text-zinc-600" />
//             )}
//         </Card>
//     );
// };

// export default ActivityLog;


import React from "react";
import { Card, Typography, Spin, Timeline, Avatar, Tag, Alert, Button } from "antd";
import {
    ClockCircleOutlined,
    UserOutlined,
    ArrowRightOutlined,
} from "@ant-design/icons";
import { useFrappeGetVersions } from "../../hooks/useFrappe";

const { Title, Text } = Typography;

const ActivityLog = ({ doctype, docname }) => {
    const { data: versions, loading: versionLoading, fetchMore } =
        useFrappeGetVersions(doctype, docname);

    if (!docname) return null;

    return (
        // <Card
        //     size="small"
        //     className="aavatto-card mt-6 !rounded-xl shadow-sm border border-zinc-100"
        // >
        //     {/* Header */}
        //     <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
        //         <ClockCircleOutlined className="text-zinc-400 text-lg" />
        //         <Title level={5} className="!m-0 text-zinc-700">
        //             Change History
        //         </Title>
        //     </div>

        //     {/* Loading */}
        //     {versionLoading ? (
        //         <div className="p-10 flex justify-center">
        //             <Spin size="large" />
        //         </div>
        //     ) : versions && versions.length > 0 ? (
        //         <Timeline className="p-6" mode="left">
        //             {versions.map((v) => {
        //                 let changes = {};
        //                 try {
        //                     changes = JSON.parse(v.data || "{}");
        //                 } catch (e) { }

        //                 return (
        //                     <Timeline.Item
        //                         key={v.name}
        //                         dot={
        //                             <Avatar
        //                                 size="small"
        //                                 icon={<UserOutlined />}
        //                                 className="bg-zinc-700"
        //                             />
        //                         }
        //                     >
        //                         {/* User + Time */}
        //                         <div className="flex items-center justify-between flex-wrap gap-2">
        //                             <Text strong className="text-zinc-800">
        //                                 {v.owner}
        //                             </Text>
        //                             <Text type="secondary" className="text-xs">
        //                                 {new Date(v.creation).toLocaleString()}
        //                             </Text>
        //                         </div>

        //                         {/* Changes */}
        //                         {changes.changed && changes.changed.length > 0 ? (
        //                             <div className="mt-3 space-y-2">
        //                                 {changes.changed.map(([field, oldVal, newVal]) => (
        //                                     <div
        //                                         key={field}
        //                                         className="flex items-center gap-2 flex-wrap bg-white border border-zinc-100 rounded-md px-3 py-2"
        //                                     >
        //                                         <Tag className="capitalize text-xs border-zinc-200 bg-zinc-50 text-zinc-600">
        //                                             {field.replace(/_/g, " ")}
        //                                         </Tag>

        //                                         <Text delete className="text-red-400 break-all text-xs">
        //                                             {oldVal || "None"}
        //                                         </Text>

        //                                         <ArrowRightOutlined className="text-[10px] text-zinc-400" />

        //                                         <Text className="text-green-600 font-medium break-all text-xs">
        //                                             {newVal || "None"}
        //                                         </Text>
        //                                     </div>
        //                                 ))}
        //                             </div>
        //                         ) : (
        //                             <Text
        //                                 type="secondary"
        //                                 className="text-sm italic mt-2 block"
        //                             >
        //                                 Document updated (no tracked field changes)
        //                             </Text>
        //                         )}
        //                     </Timeline.Item>
        //                 );
        //             })}
        //         </Timeline>
        //     ) : (
        //         <Alert
        //             message="No change history found"
        //             type="info"
        //             showIcon
        //             className="m-6 rounded-md"
        //         />
        //     )}
        // </Card>
        <div>

            <div className="flex items-center justify-between px-5 py-3 border-b bg-zinc-50/50">
                <Text strong className="text-zinc-500 uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <ClockCircleOutlined className="text-zinc-400" />
                    Activity Timeline
                </Text>
            </div>

            <div className="p-4 space-y-4">
                {versionLoading ? (
                    <div className="py-10 flex flex-col items-center justify-center gap-2">
                        <Spin size="small" />
                        <Text className="text-[10px] text-zinc-400 uppercase tracking-widest">Fetching history...</Text>
                    </div>
                ) : versions && versions.length > 0 ? (
                    versions.map((v) => {
                    let changes = {};
                    try {
                        changes = JSON.parse(v.data || "{}");
                    } catch { }

                    return (
                        <div key={v.name} className="flex gap-3 mb-3">

                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold">
                                    {v.owner?.charAt(0)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">

                                <div className="flex justify-between items-center mb-1">
                                    <Text strong className="text-sm">{v.owner}</Text>
                                    <Text type="secondary" className="text-xs">
                                        {new Date(v.creation).toLocaleString()}
                                    </Text>
                                </div>

                                {changes.changed?.length ? (
                                    <div className="bg-zinc-50 border rounded px-3 py-2 space-y-1">

                                        {changes.changed.map(([field, oldVal, newVal]) => (
                                            <div key={field} className="text-xs flex flex-wrap gap-2 items-center">

                                                <span className="px-2 py-[2px] bg-white border rounded text-zinc-500 capitalize">
                                                    {field.replace(/_/g, " ")}
                                                </span>

                                                <span className="text-red-400 line-through">
                                                    {oldVal || "None"}
                                                </span>

                                                <span>→</span>

                                                <span className="text-green-500 font-medium">
                                                    {newVal || "None"}
                                                </span>

                                            </div>
                                        ))}

                                    </div>
                                ) : (
                                    <Text type="secondary" className="text-xs">
                                        Modified document
                                    </Text>
                                )}

                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="py-8 text-center bg-zinc-50/50 rounded-lg border border-dashed border-zinc-200 mx-4">
                    <Text className="text-zinc-400 text-xs italic">Audit trail empty for this document</Text>
                </div>
            )}

                {/* Load More */}
                {versions?.length >= 5 && (
                    <div className="flex justify-center pt-2">
                        <Button type="primary" onClick={() => fetchMore && fetchMore()} loading={versionLoading}>
                            Load More
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ActivityLog;