import React, { useEffect, useMemo, useState } from "react";
import { FaArrowAltCircleLeft, FaLock, FaRedo, FaSave, FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { PERMISSIONS } from "../../auth/permissions";
import {
  fetchRolePermissions,
  resetRolePermissions,
  saveRolePermissions,
} from "../../api/rolePermissionApi";
import { getPrcessing, getSpinner, showSwalAlert } from "../../utils/CommonHelper";

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
  const [note, setNote] = useState("");

  const selectedRoleData = useMemo(
    () => roles.find((item) => item.key === selectedRole || item.role === selectedRole) || null,
    [roles, selectedRole]
  );

  const groupedCatalog = useMemo(() => {
    const groups = new Map();
    for (const permission of catalog) {
      const category = permission.category || "Other";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(permission);
    }
    return [...groups.entries()];
  }, [catalog]);

  const visibleRoles = useMemo(
    () =>
      roles.filter((role) => {
        const roleKey = role.key || role.role;
        if (roleKey === "superadmin") return true;
        return catalog.some(
          (permission) =>
            permission.editable !== false &&
            (!Array.isArray(permission.allowedRoles) || permission.allowedRoles.includes(roleKey))
        );
      }),
    [roles, catalog]
  );

  const applyRoleData = (roleData) => {
    if (!roleData) return;
    setSelectedPermissions(Array.isArray(roleData.permissions) ? [...roleData.permissions] : []);
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
    applyRoleData(selectedRoleData);
  }, [selectedRole]);

  const getDependents = (permissionKey) =>
    catalog
      .filter((item) => Array.isArray(item.requires) && item.requires.includes(permissionKey))
      .map((item) => item.key);

  const removeWithDependents = (permissionKey, workingSet) => {
    workingSet.delete(permissionKey);
    for (const dependent of getDependents(permissionKey)) {
      if (workingSet.has(dependent)) removeWithDependents(dependent, workingSet);
    }
  };

  const addWithRequirements = (permissionKey, workingSet) => {
    const definition = catalog.find((item) => item.key === permissionKey);
    for (const required of definition?.requires || []) {
      addWithRequirements(required, workingSet);
    }
    workingSet.add(permissionKey);
  };

  const togglePermission = (permission) => {
    const roleKey = selectedRoleData?.key || selectedRoleData?.role || selectedRole;
    const availableForRole = !Array.isArray(permission?.allowedRoles) || permission.allowedRoles.includes(roleKey);
    if (!selectedRoleData?.editable || permission?.editable === false || !availableForRole) return;

    setSelectedPermissions((current) => {
      const next = new Set(current);
      if (next.has(permission.key)) removeWithDependents(permission.key, next);
      else addWithRequirements(permission.key, next);
      return [...next].sort();
    });
  };

  const handleSave = async () => {
    if (!selectedRoleData?.editable) return;

    const result = await Swal.fire({
      title: tr("Save Role Permissions?"),
      text: tr("The server will enforce these permissions for this role. Niswan scope rules will not change."),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tr("Save"),
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
      showSwalAlert("Success!", data.message || "Role permissions updated successfully.", "success");
      await loadData({ keepRole: true });
    } catch (error) {
      const message = error?.response?.data?.error || error.message || "Unable to update role permissions.";
      showSwalAlert("Error!", message, "error");
      if (Number(error?.response?.status || 0) === 409) await loadData({ keepRole: true });
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = async () => {
    if (!selectedRoleData?.editable) return;

    const result = await Swal.fire({
      title: tr("Reset to Production Defaults?"),
      text: tr("Custom permissions for this role will be removed and the source-controlled defaults will apply."),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tr("Reset"),
      cancelButtonText: tr("Cancel"),
      background: "url(/bg_card.png)",
    });
    if (!result.isConfirmed) return;

    try {
      setProcessing(true);
      const data = await resetRolePermissions(selectedRole, Number(selectedRoleData?.revision || 0));
      showSwalAlert("Success!", data.message || "Role permissions reset successfully.", "success");
      await loadData({ keepRole: true });
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Unable to reset role permissions.", "error");
      if (Number(error?.response?.status || 0) === 409) await loadData({ keepRole: true });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return getSpinner();
  if (processing) return getPrcessing();

  return (
    <div className="min-h-[70vh] p-3 md:p-5" dir={direction} style={{ fontFamily }}>
      <div className="mb-4 grid grid-cols-[70px_1fr_70px] items-center">
        <button
          type="button"
          onClick={() => navigate("/dashboard/masters")}
          className="inline-flex w-fit items-center rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-slate-200"
          title={tr("Back")}
          aria-label={tr("Back")}
        >
          <FaArrowAltCircleLeft className="mr-1" /> {tr("Back")}
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-slate-800 md:text-2xl">{tr("Role Permissions")}</h1>
          <p className="mt-1 text-[11px] text-slate-500">{tr("SuperAdmin controlled business permissions")}</p>
        </div>
        <div />
      </div>

      <div className="mx-auto max-w-5xl space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 shadow-sm">
          <div className="flex items-start gap-2">
            <FaShieldAlt className="mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">{tr("Permission and scope are separate.")}</div>
              <div className="mt-1">{tr(note || "Permissions control business actions; Niswan/HQ/Self scope remains enforced separately by the server.")}</div>
              <div className="mt-1 text-blue-700">
                {tr("Server permission changes apply immediately. Signed-in users should refresh or sign in again so menus reflect the latest permissions.")}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-md">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-600">{tr("Role")}</label>
              <select
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:max-w-md"
              >
                {visibleRoles.map((role) => (
                  <option key={role.key || role.role} value={role.key || role.role}>
                    {role.label || role.role}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] text-slate-500">
                {tr("Source")}: <span className="font-semibold">{selectedRoleData?.source || "-"}</span>
                {selectedRoleData?.source === "custom" ? ` · ${tr("Revision")} ${selectedRoleData?.revision || 0}` : ""}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <button
                type="button"
                onClick={handleReset}
                disabled={!selectedRoleData?.editable || selectedRoleData?.source !== "custom"}
                className={`inline-flex items-center rounded-md px-3 py-2 text-xs font-semibold text-white shadow ${
                  selectedRoleData?.editable && selectedRoleData?.source === "custom"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "cursor-not-allowed bg-slate-300"
                }`}
              >
                <FaRedo className="mr-1" /> {tr("Reset Defaults")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!selectedRoleData?.editable}
                className={`inline-flex items-center rounded-md px-3 py-2 text-xs font-semibold text-white shadow ${
                  selectedRoleData?.editable ? "bg-blue-700 hover:bg-blue-800" : "cursor-not-allowed bg-slate-300"
                }`}
              >
                {selectedRoleData?.editable ? <FaSave className="mr-1" /> : <FaLock className="mr-1" />}
                {selectedRoleData?.editable ? tr("Save Permissions") : tr("Locked")}
              </button>
            </div>
          </div>
        </div>

        {groupedCatalog.map(([category, permissions]) => (
          <div key={category} className="rounded-lg border bg-white p-4 shadow-md">
            <h2 className="mb-3 text-sm font-bold text-slate-700">{tr(category)}</h2>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {permissions.map((permission) => {
                const checked = selectedPermissions.includes(permission.key);
                const roleKey = selectedRoleData?.key || selectedRoleData?.role || selectedRole;
                const availableForRole = !Array.isArray(permission.allowedRoles) || permission.allowedRoles.includes(roleKey);
                const locked = !selectedRoleData?.editable || permission.editable === false || !availableForRole;
                return (
                  <label
                    key={permission.key}
                    className={`flex items-start gap-3 rounded-md border p-3 ${
                      checked ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
                    } ${locked ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:border-blue-200"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={locked}
                      onChange={() => togglePermission(permission)}
                      className="mt-1 h-4 w-4"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
                        {permission.superadminOnly ? <FaLock className="text-slate-500" /> : null}
                        {tr(permission.label)}
                      </div>
                      <div className="mt-1 text-[11px] leading-4 text-slate-500">{tr(permission.description)}</div>
                      {!availableForRole ? (
                        <div className="mt-1 text-[10px] font-semibold text-amber-700">
                          {tr("Not available for this role's current server scope.")}
                        </div>
                      ) : null}
                      {Array.isArray(permission.requires) && permission.requires.length > 0 ? (
                        <div className="mt-1 text-[10px] text-blue-700">
                          {tr("Requires")}: {permission.requires.join(", ")}
                        </div>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-900">
          <b>{tr("Production safety")}</b>: {tr("This release exposes only permissions that are enforced end-to-end by both the server and UI. Additional modules can be added to the same catalog later without changing the permission model.")}
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsPage;
