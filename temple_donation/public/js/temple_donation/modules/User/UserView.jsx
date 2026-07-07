import React, { useEffect, useState } from "react";
import { Row, Col, Alert, Tag, Button, Empty, Spin, Modal, Checkbox, Space, message } from "antd";
import { User, ShieldAlert, FileText, Wallet, CheckCircle2, Shield, Check, X } from "lucide-react";
import { useFrappeGetDoc, useFrappeGetDocList } from "../../hooks/useFrappe";
import { DOCTYPE_USER } from "../../config/constants";
import { userFormFields } from "../../formfield/userFormFields";
import PageLoader from "../../components/common/PageLoader";
import { getTagConfig } from "../../utils/tagUtils";
import DetailHeader from "../../components/common/DetailHeader";
import SectionCard from "../../components/common/SectionCard";
import FieldCell from "../../components/common/FieldCell";
import ViewContainer from "../../components/common/ViewContainer";
import ActivityLog from "../../components/common/ActivityLog";

const ACCESS_LEVEL_ORDER = { full: 0, partial: 1, read_only: 2, none: 3 };

const sortPermissions = (permissions = []) =>
  [...permissions].sort((a, b) => {
    const levelDiff =
      (ACCESS_LEVEL_ORDER[a.access_level] ?? 99) - (ACCESS_LEVEL_ORDER[b.access_level] ?? 99);
    if (levelDiff !== 0) return levelDiff;
    return a.doctype.localeCompare(b.doctype);
  });

const ACCESS_LEVEL_CONFIG = {
  full: { label: "Full Access", className: "tag-glass-green" },
  partial: { label: "Partial", className: "tag-glass-volcano" },
  read_only: { label: "Read Only", className: "tag-glass-cyan" },
  none: { label: "No Access", className: "tag-glass-gray" },
};

const PermIcon = ({ allowed }) =>
  allowed ? (
    <Check size={14} className="text-emerald-600 mx-auto" strokeWidth={2.5} />
  ) : (
    <X size={14} className="text-zinc-300 mx-auto" strokeWidth={2} />
  );

const UserView = ({ id, onBack, onEdit }) => {
  const { data: doc, loading, error } = useFrappeGetDoc(DOCTYPE_USER, id);
  const { data: temples } = useFrappeGetDocList("Temple", {
    fields: ["name", "temple_name"], limit: 1000,
  });
  const [modulePerms, setModulePerms] = useState(null);
  const [loadingPerms, setLoadingPerms] = useState(true);

  const [extraPermsModalOpen, setExtraPermsModalOpen] = useState(false);
  const [extraPermissions, setExtraPermissions] = useState([]);
  const [loadingExtraPerms, setLoadingExtraPerms] = useState(false);
  const [savingExtraPerms, setSavingExtraPerms] = useState(false);

  const fetchMainPermissions = () => {
    if (!id || typeof frappe === "undefined") {
      setLoadingPerms(false);
      return;
    }
    setLoadingPerms(true);
    frappe.call({
      method: "temple_donation.api.get_user_module_permissions",
      args: { user_name: id },
      callback: (r) => {
        setLoadingPerms(false);
        if (r.message) setModulePerms(r.message);
      },
      error: () => setLoadingPerms(false),
    });
  };

  useEffect(() => {
    fetchMainPermissions();
  }, [id]);

  const fetchExtraPermissions = () => {
    if (!id || typeof frappe === "undefined") return;
    setLoadingExtraPerms(true);
    frappe.call({
      method: "temple_donation.api.get_user_extra_permissions",
      args: { user_name: id },
      callback: (r) => {
        setLoadingExtraPerms(false);
        if (r.message) setExtraPermissions(r.message);
      },
      error: () => setLoadingExtraPerms(false),
    });
  };

  useEffect(() => {
    if (extraPermsModalOpen) {
      fetchExtraPermissions();
    }
  }, [extraPermsModalOpen]);

  const handlePermissionChange = (doctype, field, checked) => {
    setExtraPermissions((prev) =>
      prev.map((row) =>
        row.doctype === doctype ? { ...row, [field]: checked ? 1 : 0 } : row
      )
    );
  };

  const handleToggleAll = (doctype, checked) => {
    const val = checked ? 1 : 0;
    setExtraPermissions((prev) =>
      prev.map((row) =>
        row.doctype === doctype
          ? {
              ...row,
              read: row.role_read ? row.read : val,
              write: row.role_write ? row.write : val,
              create: row.role_create ? row.create : val,
              delete: row.role_delete ? row.delete : val,
            }
          : row
      )
    );
  };

  const handleSaveExtraPermissions = () => {
    if (typeof frappe === "undefined") return;
    setSavingExtraPerms(true);
    frappe.call({
      method: "temple_donation.api.save_user_extra_permissions",
      args: {
        user_name: id,
        permissions: JSON.stringify(extraPermissions),
      },
      callback: (r) => {
        setSavingExtraPerms(false);
        if (r.message) {
          message.success("User extra permissions saved successfully.");
          setExtraPermsModalOpen(false);
          fetchMainPermissions();
        }
      },
      error: () => setSavingExtraPerms(false),
    });
  };

  const handleResetExtraPermissions = () => {
    if (typeof frappe === "undefined") return;
    setSavingExtraPerms(true);
    frappe.call({
      method: "temple_donation.api.reset_user_extra_permissions",
      args: { user_name: id },
      callback: (r) => {
        setSavingExtraPerms(false);
        if (r.message) {
          message.success("User permissions reset to role defaults.");
          setExtraPermsModalOpen(false);
          fetchMainPermissions();
        }
      },
      error: () => setSavingExtraPerms(false),
    });
  };

  if (loading) return <PageLoader />;

  if (error || !doc) {
    return (
      <div className="p-8">
        <Alert
          message="Could not load user details"
          description={error?.message || "User not found"}
          type="error"
          showIcon
          action={
            <Button
              onClick={onBack}
              className="h-9 rounded-lg border-zinc-200 text-zinc-700 hover:!border-zinc-900 hover:!text-zinc-900"
            >
              Back
            </Button>
          }
        />
      </div>
    );
  }

  const isSystemAdmin = typeof frappe !== "undefined" && (frappe.user_roles.includes("System Manager") || frappe.user_roles.includes("Super Admin"));
  const canManageExtraPerms = isSystemAdmin && doc.name !== "Administrator" && doc.custom_user_role !== "Super Admin";

  const visibleFields = (userFormFields.fields || []).filter(field => {
    if (field.name === "new_password" || field.name === "confirm_password" || field.name === "password") return false;
    if (field.name === "enabled" || field.name === "custom_status") return false;
    const val = doc[field.name];
    return val !== null && val !== undefined && val !== "" && !(Array.isArray(val) && val.length === 0);
  });

  const renderValue = (field, value) => {
    const empty = value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
    if (empty) return <span className="text-zinc-300 font-medium">—</span>;

    if (field.type === "image")
      return <img src={value} alt={field.label} className="w-14 h-14 object-cover rounded-lg border border-zinc-200" />;

    if (field.type === "textarea")
      return (
        <span className="text-zinc-800 font-semibold whitespace-pre-wrap block">
          {value}
        </span>
      );

    if ((field.name === "custom_select_temple" || field.name === "roles") && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => {
            const tid = item.temple || item.role || String(item);
            const t = temples?.find(t => t.name === tid);
            const name = t ? t.temple_name : tid;
            const tagInfo = getTagConfig(field.name === "roles" ? tid : "trust admin");
            return (
              <Tag className={`tag-glass ${tagInfo.glassClass} !m-0`} key={item.name || tid}>
                {name}
              </Tag>
            );
          })}
        </div>
      );
    }

    if (field.name === "custom_user_role") {
      const tagInfo = getTagConfig(String(value));
      return <Tag className={`tag-glass ${tagInfo.glassClass} !m-0`}>{String(value)}</Tag>;
    }

    return <span className="text-zinc-800 font-semibold">{String(value)}</span>;
  };

  const fullName = doc.full_name || `${doc.first_name || ""} ${doc.last_name || ""}`.trim() || doc.name;
  const initials = `${doc.first_name?.charAt(0) || ""}${doc.last_name?.charAt(0) || ""}`.toUpperCase() || "U";

  return (
    <ViewContainer className="user-view-container">
      {/* ── TOP HERO HEADER ── */}
      <DetailHeader
        onBack={onBack}
        title={fullName}
        subtitle={doc.email}
        imageSrc={doc.user_image}
        initials={initials}
        tags={doc.custom_user_role ? [doc.custom_user_role] : []}
        actions={
          <>
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

      {/* ── TWO COLUMN GRID WORKSURFACE ── */}
      <Row gutter={[24, 24]}>

        {/* Left Main View Columns */}
        <Col xs={24} lg={17}>
          <div className="flex flex-col gap-6">
            <SectionCard title="Basic Information" icon={<User size={15} className="text-zinc-800" />}>
              <Row gutter={[16, 8]}>
                {visibleFields.map((field) => {
                  const isFullWidth = field.type === "image" || field.type === "textarea" || field.name === "custom_select_temple" || field.name === "roles";
                  return (
                    <Col xs={24} sm={isFullWidth ? 24 : 12} md={isFullWidth ? 24 : 8} key={field.name}>
                      <FieldCell label={field.label}>
                        {renderValue(field, doc[field.name])}
                      </FieldCell>
                    </Col>
                  );
                })}
              </Row>
            </SectionCard>

            <SectionCard
              title="Module Permissions"
              icon={<Shield size={15} className="text-zinc-800" />}
              right={
                <Space wrap>
                  {modulePerms?.role_label && (
                    <Tag className="tag-glass tag-glass-gray !m-0 text-[11px] font-semibold">
                      Role: {modulePerms.role_label}
                    </Tag>
                  )}
                  {canManageExtraPerms && (
                    <Button
                      size="small"
                      onClick={() => setExtraPermsModalOpen(true)}
                      className="text-xs rounded border-zinc-200 text-zinc-700 hover:!border-zinc-900 hover:!text-zinc-900"
                    >
                      Edit Extra Permissions
                    </Button>
                  )}
                </Space>
              }
            >
              {loadingPerms ? (
                <div className="py-12 text-center">
                  <Spin />
                </div>
              ) : !modulePerms?.role ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No role assigned — module permissions are unavailable."
                />
              ) : (
                <div className="flex flex-col gap-5">
                  {modulePerms.summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Total Modules", value: modulePerms.summary.total_modules, tone: "text-zinc-800" },
                        { label: "Accessible", value: modulePerms.summary.accessible_modules, tone: "text-emerald-600" },
                        { label: "Full Access", value: modulePerms.summary.full_access_modules, tone: "text-emerald-700" },
                        { label: "Read Only", value: modulePerms.summary.read_only_modules, tone: "text-blue-600" },
                      ].map(({ label, value, tone }) => (
                        <div
                          key={label}
                          className="rounded-lg border border-zinc-100 bg-zinc-50/60 px-3 py-2.5 text-center"
                        >
                          <div className={`text-lg font-bold leading-none ${tone}`}>{value}</div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1.5">
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {modulePerms.permissions?.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No modules configured for this role."
                    />
                  ) : (
                    <div className="overflow-x-auto border border-zinc-100 rounded-lg bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50/70 border-b border-zinc-100">
                            <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                              Module
                            </th>
                            <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                              Read
                            </th>
                            <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                              Write
                            </th>
                            <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                              Create
                            </th>
                            <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                              Delete
                            </th>
                            <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                              Access
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {sortPermissions(modulePerms.permissions).map((row) => {
                            const accessCfg = ACCESS_LEVEL_CONFIG[row.access_level] || ACCESS_LEVEL_CONFIG.none;
                            return (
                              <tr key={row.doctype} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="p-3 text-sm font-medium text-zinc-700 flex items-center">
                                  {row.doctype}
                                  {row.source === "extra" && (
                                    <Tag color="blue" className="text-[9px] !m-0 ml-2 py-0 px-1 font-semibold leading-none border-blue-200">
                                      Customized
                                    </Tag>
                                  )}
                                </td>
                                <td className="p-3 text-center"><PermIcon allowed={!!row.read} /></td>
                                <td className="p-3 text-center"><PermIcon allowed={!!row.write} /></td>
                                <td className="p-3 text-center"><PermIcon allowed={!!row.create} /></td>
                                <td className="p-3 text-center"><PermIcon allowed={!!row.delete} /></td>
                                <td className="p-3 text-center">
                                  <Tag className={`tag-glass ${accessCfg.className} !m-0 text-[10px]`}>
                                    {accessCfg.label}
                                  </Tag>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

          </div>
        </Col>

        {/* Right Meta Parameters Panel */}
        <Col xs={24} lg={7}>
          <div className="sticky top-6 flex flex-col gap-6">

            {/* Role Matrix Status Card */}
            <SectionCard title="Role & Access Meta" icon={<ShieldAlert size={15} className="text-zinc-800" />}>
              <div className="flex flex-col gap-3
              
               py-1">
                {[
                  {
                    label: "Account Status", value: (() => {
                      const statusVal = doc.custom_status || doc.status || (doc.enabled ? "Active" : "Inactive");
                      return <Tag className={`tag-glass ${getTagConfig(statusVal).glassClass} !m-0`}>{statusVal}</Tag>;
                    })()
                  },
                  {
                    label: "Opening Balance", value: (
                      <span className="text-xs font-semibold text-zinc-800 flex items-center gap-1">
                        <Wallet size={12} className="text-zinc-400" />
                        ₹{doc.custom_opening_balance ? parseFloat(doc.custom_opening_balance).toFixed(2) : "0.00"}
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

            {/* System Security Tracking Logs */}
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
      <ActivityLog doctype={DOCTYPE_USER} docname={id} />

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-zinc-800" />
            <span>Customize User Permissions — {fullName}</span>
          </div>
        }
        open={extraPermsModalOpen}
        onCancel={() => setExtraPermsModalOpen(false)}
        footer={null}
        width={720}
        destroyOnClose
      >
        <div className="mt-4 flex flex-col gap-4">
          <Alert
            message="Configure custom overrides for this user. Any checked box overrides the role-based default. Clicking 'Reset' will revert all permissions to the role defaults."
            type="info"
            showIcon
          />

          {loadingExtraPerms ? (
            <div className="py-12 text-center">
              <Spin />
            </div>
          ) : (
            <>
              <div className="max-h-[450px] overflow-y-auto border border-zinc-100 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/70 border-b border-zinc-100 sticky top-0 z-10">
                      <th className="p-2.5 text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50">
                        DocType
                      </th>
                      <th className="p-2.5 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center bg-zinc-50 w-16">
                        Read
                      </th>
                      <th className="p-2.5 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center bg-zinc-50 w-16">
                        Write
                      </th>
                      <th className="p-2.5 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center bg-zinc-50 w-16">
                        Create
                      </th>
                      <th className="p-2.5 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center bg-zinc-50 w-16">
                        Delete
                      </th>
                      <th className="p-2.5 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center bg-zinc-50 w-16">
                        All
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {extraPermissions.map((row) => {
                      const isAllChecked = (!!row.role_read || !!row.read) &&
                                           (!!row.role_write || !!row.write) &&
                                           (!!row.role_create || !!row.create) &&
                                           (!!row.role_delete || !!row.delete);
                      const isAllDisabled = !!row.role_read && !!row.role_write && !!row.role_create && !!row.role_delete;
                      return (
                        <tr key={row.doctype} className="hover:bg-zinc-50/30 transition-colors">
                          <td className="p-2 text-xs font-medium text-zinc-700 flex items-center animate-fade-in">
                            {row.doctype}
                            {row.is_extra && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-2 animate-pulse" title="Has active override" />
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <Checkbox
                              checked={!!row.role_read || !!row.read}
                              disabled={!!row.role_read}
                              onChange={(e) => handlePermissionChange(row.doctype, "read", e.target.checked)}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Checkbox
                              checked={!!row.role_write || !!row.write}
                              disabled={!!row.role_write}
                              onChange={(e) => handlePermissionChange(row.doctype, "write", e.target.checked)}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Checkbox
                              checked={!!row.role_create || !!row.create}
                              disabled={!!row.role_create}
                              onChange={(e) => handlePermissionChange(row.doctype, "create", e.target.checked)}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Checkbox
                              checked={!!row.role_delete || !!row.delete}
                              disabled={!!row.role_delete}
                              onChange={(e) => handlePermissionChange(row.doctype, "delete", e.target.checked)}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Checkbox
                              checked={!!isAllChecked}
                              disabled={!!isAllDisabled}
                              onChange={(e) => handleToggleAll(row.doctype, e.target.checked)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-2">
                <Button
                  danger
                  type="dashed"
                  loading={savingExtraPerms}
                  onClick={handleResetExtraPermissions}
                >
                  Reset to Role Defaults
                </Button>
                <Space>
                  <Button onClick={() => setExtraPermsModalOpen(false)}>Cancel</Button>
                  <Button
                    type="primary"
                    loading={savingExtraPerms}
                    onClick={handleSaveExtraPermissions}
                    className="bg-zinc-900 border-zinc-900 text-white hover:!bg-zinc-800 hover:!border-zinc-800"
                  >
                    Save Overrides
                  </Button>
                </Space>
              </div>
            </>
          )}
        </div>
      </Modal>
    </ViewContainer>
  );
};

export default UserView;