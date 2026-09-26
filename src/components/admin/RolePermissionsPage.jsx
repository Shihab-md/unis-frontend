import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowAltCircleLeft,
  FaCheckCircle,
  FaDatabase,
  FaLock,
  FaSave,
  FaShieldAlt,
  FaUndoAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { PERMISSIONS } from "../../auth/permissions";
import { fetchRolePermissions, saveRolePermissions } from "../../api/rolePermissionApi";
import { getPrcessing, getSpinner, showSwalAlert } from "../../utils/CommonHelper";

const normalizePermissions = (permissions = []) =>
  [...new Set((Array.isArray(permissions) ? permissions : []).map(String))].sort();

const samePermissions = (left = [], right = []) => {
  const a = normalizePermissions(left);
  const b = normalizePermissions(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
};

const RolePermissionsPage = () => {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { tr, direction, fontFamily } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("supervisor");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [savedPermissions, setSavedPermissions] = useState([]);
  const [note, setNote] = useState("");

  const selectedRoleData = useMemo(
    () => roles.find((item) => (item.key || item.role) === selectedRole) || null,
    [roles, selectedRole]
  );

  const isLockedRole = selectedRole === "superadmin" || selectedRoleData?.editable === false;
  const hasChanges = !samePermissions(selectedPermissions, savedPermissions);

  const permissionLabelByKey = useMemo(
    () => new Map(catalog.map((item) => [item.key, item.label || item.key])),
    [catalog]
  );

  const availableCatalog = useMemo(() => {
    if (!selectedRoleData) return [];
    if (isLockedRole) return catalog;

    return catalog.filter((permission) => {
      if (permission.superadminOnly || permission.editable === false) return false;
      if (!Array.isArray(permission.allowedRoles)) return true;
      return permission.allowedRoles.includes(selectedRole);
    });
  }, [catalog, selectedRole, selectedRoleData, isLockedRole]);

  const groupedCatalog = useMemo(() => {
    const groups = new Map();
    for (const permission of availableCatalog) {
      const category = permission.category || "Other";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(permission);
    }
    return [...groups.entries()];
  }, [availableCatalog]);

  const applyRoleData = (roleData) => {
    const saved = normalizePermissions(roleData?.permissions || []);
    setSavedPermissions(saved);
    setSelectedPermissions(saved);
  };

  const loadData = async ({ keepRole = true } = {}) => {
    try {
      setLoading(true);
      const data = await fetchRolePermissions();
      const loadedRoles = Array.isArray(data.roles) ? data.roles : [];
      const loadedCatalog = Array.isArray(data.catalog) ? data.catalog : [];
      setRoles(loadedRoles);
      setCatalog(loadedCatalog);
      setNote(data.note || "");

      const preferredRole =
        keepRole && loadedRoles.some((item) => (item.key || item.role) === selectedRole)
          ? selectedRole
          : loadedRoles.find((item) => item.key === "supervisor")?.key ||
            loadedRoles.find((item) => item.editable)?.key ||
            loadedRoles[0]?.key ||
            "";

      setSelectedRole(preferredRole);
      const roleData = loadedRoles.find((item) => (item.key || item.role) === preferredRole);
      applyRoleData(roleData);
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Unable to load role permissions.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!can(PERMISSIONS.ROLE_PERMISSIONS_MANAGE)) {
      showSwalAlert("Error!", "Only SuperAdmin can manage role permissions.", "error");
      navigate("/dashboard", { replace: true });
      return;
    }
    loadData({ keepRole: false });
  }, []);

  useEffect(() => {
    if (selectedRoleData) applyRoleData(selectedRoleData);
  }, [selectedRole, roles]);

  const getDependents = (permissionKey) =>
    availableCatalog
      .filter((item) => Array.isArray(item.requires) && item.requires.includes(permissionKey))
      .map((item) => item.key);

  const removeWithDependents = (permissionKey, workingSet) => {
    workingSet.delete(permissionKey);
    for (const dependent of getDependents(permissionKey)) {
      if (workingSet.has(dependent)) removeWithDependents(dependent, workingSet);
    }
  };

  const addWithRequirements = (permissionKey, workingSet) => {
    const definition = availableCatalog.find((item) => item.key === permissionKey);
    for (const required of definition?.requires || []) {
      addWithRequirements(required, workingSet);
    }
    workingSet.add(permissionKey);
  };

  const togglePermission = (permission) => {
    if (isLockedRole || permission?.editable === false) return;

    setSelectedPermissions((current) => {
      const next = new Set(current);
      if (next.has(permission.key)) removeWithDependents(permission.key, next);
      else addWithRequirements(permission.key, next);
      return [...next].sort();
    });
  };

  const confirmDiscardUnsaved = async () => {
    if (!hasChanges) return true;
    const result = await Swal.fire({
      title: tr("Discard unsaved changes?"),
      text: tr("The changes on this screen have not been saved to the database."),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tr("Discard"),
      cancelButtonText: tr("Keep Editing"),
      background: "url(/bg_card.png)",
    });
    return result.isConfirmed;
  };

  const handleRoleChange = async (nextRole) => {
    if (nextRole === selectedRole) return;
    if (!(await confirmDiscardUnsaved())) return;
    setSelectedRole(nextRole);
  };

  const handleBack = async () => {
    if (!(await confirmDiscardUnsaved())) return;
    navigate("/dashboard/masters");
  };

  const handleDiscard = () => {
    setSelectedPermissions([...savedPermissions]);
  };

  const handleSave = async () => {
    if (isLockedRole || !hasChanges) return;

    const roleLabel = selectedRoleData?.label || selectedRole;
    const scopeLabel = selectedRoleData?.scopeLabel || "Server-controlled scope";
    const result = await Swal.fire({
      title: tr("Save Permission Changes?"),
      text: `${tr("Role")}: ${tr(roleLabel)} · ${tr("Scope")}: ${tr(scopeLabel)}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tr("Save Changes"),
      cancelButtonText: tr("Cancel"),
      background: "url(/bg_card.png)",
    });
    if (!result.isConfirmed) return;

    try {
      setProcessing(true);
      const data = await saveRolePermissions(
        selectedRole,
        selectedPermissions,
        Number(selectedRoleData?.revision || 0)
      );
      showSwalAlert("Success!", data.message || "Role permissions saved successfully.", "success");
      await loadData({ keepRole: true });
    } catch (error) {
      const message = error?.response?.data?.error || error.message || "Unable to update role permissions.";
      showSwalAlert("Error!", message, "error");
      if (Number(error?.response?.status || 0) === 409) await loadData({ keepRole: true });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return getSpinner();
  if (processing) return getPrcessing();

  const selectedCount = selectedPermissions.filter((key) =>
    availableCatalog.some((permission) => permission.key === key)
  ).length;

  return (
    <div className="min-h-[70vh] p-3 md:p-5" dir={direction} style={{ fontFamily }}>
      <div className="mb-4 grid grid-cols-[70px_1fr_70px] items-center">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex w-fit items-center rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-slate-200"
          title={tr("Back")}
          aria-label={tr("Back")}
        >
          <FaArrowAltCircleLeft className="mr-1" /> {tr("Back")}
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-slate-800 md:text-2xl">{tr("Role Permissions")}</h1>
          <p className="mt-1 text-[11px] text-slate-500">{tr("SuperAdmin permission management")}</p>
        </div>
        <div />
      </div>

      <div className="mx-auto max-w-5xl space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 shadow-sm">
          <div className="flex items-start gap-2">
            <FaDatabase className="mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">{tr("One source of truth: Database")}</div>
              <div className="mt-1">
                {tr("Saved role permissions are stored in MongoDB and are not reset from source-code defaults during normal operation.")}
              </div>
              <div className="mt-1">{tr(note || "Permissions and data scope are enforced separately by the server.")}</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-md">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-600">{tr("Role")}</label>
              <select
                value={selectedRole}
                onChange={(event) => handleRoleChange(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:max-w-md"
              >
                {roles.map((role) => (
                  <option key={role.key || role.role} value={role.key || role.role}>
                    {role.label || role.role}
                  </option>
                ))}
              </select>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                  {tr("Scope")}: {tr(selectedRoleData?.scopeLabel || "-")}
                </span>
                {isLockedRole ? (
                  <span className="rounded-full bg-slate-200 px-2 py-1 font-semibold text-slate-700">
                    <FaLock className="mr-1 inline" /> {tr("Locked system role")}
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                    <FaDatabase className="mr-1 inline" /> {tr("Saved in database")} · {tr("Revision")} {selectedRoleData?.revision || 0}
                  </span>
                )}
                {!isLockedRole ? (
                  <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                    {selectedCount}/{availableCatalog.length} {tr("enabled")}
                  </span>
                ) : null}
                {hasChanges ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 font-bold text-amber-800">
                    {tr("Unsaved changes")}
                  </span>
                ) : !isLockedRole ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-800">
                    <FaCheckCircle className="mr-1 inline" /> {tr("Saved")}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              {isLockedRole ? (
                <div className="inline-flex items-center rounded-md bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow">
                  <FaLock className="mr-1" /> {tr("Always Enabled")}
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={!hasChanges}
                    className={`inline-flex items-center rounded-md px-3 py-2 text-xs font-semibold text-white shadow ${
                      hasChanges ? "bg-slate-600 hover:bg-slate-700" : "cursor-not-allowed bg-slate-300"
                    }`}
                  >
                    <FaUndoAlt className="mr-1" /> {tr("Discard Changes")}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`inline-flex items-center rounded-md px-3 py-2 text-xs font-semibold text-white shadow ${
                      hasChanges ? "bg-blue-700 hover:bg-blue-800" : "cursor-not-allowed bg-slate-300"
                    }`}
                  >
                    <FaSave className="mr-1" /> {tr("Save Changes")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {isLockedRole ? (
          <div className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs text-slate-700 shadow-sm">
            <div className="flex items-start gap-2">
              <FaShieldAlt className="mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">{tr("SuperAdmin is permanently locked with all available permissions.")}</div>
                <div className="mt-1">{tr("Its permissions cannot be removed or delegated from this screen.")}</div>
              </div>
            </div>
          </div>
        ) : hasChanges ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-900 shadow-sm">
            {tr("You have unsaved permission changes. They will not affect users until you click Save Changes.")}
          </div>
        ) : null}

        {groupedCatalog.length === 0 ? (
          <div className="rounded-lg border bg-white p-6 text-center text-sm text-slate-500 shadow-md">
            {tr("No configurable permissions are currently available for this role.")}
          </div>
        ) : (
          groupedCatalog.map(([category, permissions]) => (
            <div key={category} className="rounded-lg border bg-white p-4 shadow-md">
              <h2 className="mb-3 text-sm font-bold text-slate-700">{tr(category)}</h2>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {permissions.map((permission) => {
                  const checked = selectedPermissions.includes(permission.key);
                  const locked = isLockedRole || permission.editable === false;
                  const requirementLabels = (permission.requires || []).map(
                    (key) => permissionLabelByKey.get(key) || key
                  );

                  return (
                    <label
                      key={permission.key}
                      className={`flex items-start gap-3 rounded-md border p-3 ${
                        checked ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
                      } ${locked ? "cursor-default" : "cursor-pointer hover:border-blue-200"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={locked}
                        onChange={() => togglePermission(permission)}
                        className="mt-1 h-4 w-4"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
                          <span>{tr(permission.label)}</span>
                          {isLockedRole ? (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                              <FaLock className="mr-1 inline" /> {tr("Always enabled")}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 text-[11px] leading-4 text-slate-500">{tr(permission.description)}</div>
                        {requirementLabels.length > 0 ? (
                          <div className="mt-1 text-[10px] font-medium text-blue-700">
                            {tr("Automatically requires")}: {requirementLabels.map((label) => tr(label)).join(", ")}
                          </div>
                        ) : null}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))
        )}

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-900">
          <b>{tr("Important")}</b>: {tr("Changing a permission never expands the role's data scope. For example, Supervisor remains limited to assigned Niswans and Niswan Admin remains limited to the own Niswan.")}
          <br />
          {tr("Server authorization uses the saved database permissions immediately. Other signed-in users should refresh or sign in again so their menus reflect the latest permissions.")}
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsPage;
