import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowAltCircleLeft,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaDatabase,
  FaExclamationTriangle,
  FaFilter,
  FaInfoCircle,
  FaKey,
  FaLock,
  FaMinusCircle,
  FaPlusCircle,
  FaSave,
  FaSearch,
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

const formatSavedAt = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [showTechnicalKeys, setShowTechnicalKeys] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState([]);

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

  const availableKeySet = useMemo(
    () => new Set(availableCatalog.map((permission) => permission.key)),
    [availableCatalog]
  );

  const selectedSet = useMemo(() => new Set(selectedPermissions), [selectedPermissions]);
  const savedSet = useMemo(() => new Set(savedPermissions), [savedPermissions]);

  const addedPermissions = useMemo(
    () => availableCatalog.filter((permission) => selectedSet.has(permission.key) && !savedSet.has(permission.key)),
    [availableCatalog, selectedSet, savedSet]
  );

  const removedPermissions = useMemo(
    () => availableCatalog.filter((permission) => !selectedSet.has(permission.key) && savedSet.has(permission.key)),
    [availableCatalog, selectedSet, savedSet]
  );

  const changedKeySet = useMemo(
    () => new Set([...addedPermissions, ...removedPermissions].map((permission) => permission.key)),
    [addedPermissions, removedPermissions]
  );

  const selectedCount = useMemo(
    () => selectedPermissions.filter((key) => availableKeySet.has(key)).length,
    [selectedPermissions, availableKeySet]
  );

  const filteredCatalog = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return availableCatalog.filter((permission) => {
      const enabled = selectedSet.has(permission.key);
      const changed = changedKeySet.has(permission.key);

      if (filterMode === "enabled" && !enabled) return false;
      if (filterMode === "disabled" && enabled) return false;
      if (filterMode === "changed" && !changed) return false;

      if (!query) return true;
      const haystack = [
        permission.label,
        permission.description,
        permission.key,
        permission.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [availableCatalog, selectedSet, changedKeySet, searchTerm, filterMode]);

  const groupedCatalog = useMemo(() => {
    const groups = new Map();
    for (const permission of filteredCatalog) {
      const category = permission.category || "Other";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(permission);
    }
    return [...groups.entries()];
  }, [filteredCatalog]);

  const categoryStats = useMemo(() => {
    const stats = new Map();
    for (const permission of availableCatalog) {
      const category = permission.category || "Other";
      const current = stats.get(category) || { total: 0, enabled: 0, changed: 0 };
      current.total += 1;
      if (selectedSet.has(permission.key)) current.enabled += 1;
      if (changedKeySet.has(permission.key)) current.changed += 1;
      stats.set(category, current);
    }
    return stats;
  }, [availableCatalog, selectedSet, changedKeySet]);

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

  useEffect(() => {
    if (!hasChanges) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const getDependents = (permissionKey) =>
    availableCatalog
      .filter((item) => Array.isArray(item.requires) && item.requires.includes(permissionKey))
      .map((item) => item.key);

  const collectActiveDependents = (permissionKey, workingSet, collected = new Set()) => {
    for (const dependent of getDependents(permissionKey)) {
      if (!workingSet.has(dependent) || collected.has(dependent)) continue;
      collected.add(dependent);
      collectActiveDependents(dependent, workingSet, collected);
    }
    return collected;
  };

  const removeWithDependents = (permissionKey, workingSet) => {
    workingSet.delete(permissionKey);
    for (const dependent of getDependents(permissionKey)) {
      if (workingSet.has(dependent)) removeWithDependents(dependent, workingSet);
    }
  };

  const addWithRequirements = (permissionKey, workingSet, visited = new Set()) => {
    if (visited.has(permissionKey)) return;
    visited.add(permissionKey);
    const definition = availableCatalog.find((item) => item.key === permissionKey);
    for (const required of definition?.requires || []) {
      addWithRequirements(required, workingSet, visited);
    }
    workingSet.add(permissionKey);
  };

  const togglePermission = async (permission) => {
    if (isLockedRole || permission?.editable === false) return;

    const currentlyEnabled = selectedSet.has(permission.key);
    if (currentlyEnabled) {
      const current = new Set(selectedPermissions);
      const dependents = [...collectActiveDependents(permission.key, current)];

      if (dependents.length > 0) {
        const dependentLabels = dependents.map((key) => permissionLabelByKey.get(key) || key);
        const result = await Swal.fire({
          title: tr("Disable dependent permissions?"),
          text: `${tr(permission.label)} ${tr("is required by")}: ${dependentLabels.map((label) => tr(label)).join(", ")}. ${tr("Disabling it will also disable those dependent permissions.")}`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: tr("Disable"),
          cancelButtonText: tr("Cancel"),
          background: "url(/bg_card.png)",
        });
        if (!result.isConfirmed) return;
      }
    }

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
    setSearchTerm("");
    setFilterMode("all");
    setCollapsedCategories([]);
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
      text: `${tr("Role")}: ${tr(roleLabel)} · ${tr("Scope")}: ${tr(scopeLabel)} · +${addedPermissions.length} / -${removedPermissions.length}`,
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

  const toggleCategory = (category) => {
    setCollapsedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const collapseAll = () => {
    setCollapsedCategories([...new Set(groupedCatalog.map(([category]) => category))]);
  };

  const expandAll = () => {
    setCollapsedCategories([]);
  };

  if (loading) return getSpinner();
  if (processing) return getPrcessing();

  const changedCount = addedPermissions.length + removedPermissions.length;
  const filterOptions = [
    { key: "all", label: "All", count: availableCatalog.length },
    { key: "enabled", label: "Enabled", count: selectedCount },
    { key: "disabled", label: "Disabled", count: Math.max(availableCatalog.length - selectedCount, 0) },
    { key: "changed", label: "Changed", count: changedCount },
  ];

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

      <div className="mx-auto max-w-6xl space-y-4">
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
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

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-md bg-slate-50 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{tr("Available")}</div>
                  <div className="mt-0.5 text-lg font-bold text-slate-700">{availableCatalog.length}</div>
                </div>
                <div className="rounded-md bg-blue-50 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-400">{tr("Enabled")}</div>
                  <div className="mt-0.5 text-lg font-bold text-blue-700">{selectedCount}</div>
                </div>
                <div className="rounded-md bg-amber-50 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-500">{tr("Pending Changes")}</div>
                  <div className="mt-0.5 text-lg font-bold text-amber-700">{changedCount}</div>
                </div>
                <div className="rounded-md bg-emerald-50 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500">{tr("Catalog")}</div>
                  <div className="mt-0.5 text-lg font-bold text-emerald-700">v{selectedRoleData?.catalogVersion || "-"}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                  <FaShieldAlt className="mr-1 inline" /> {tr("Scope")}: {tr(selectedRoleData?.scopeLabel || "-")}
                </span>
                {isLockedRole ? (
                  <span className="rounded-full bg-slate-200 px-2 py-1 font-semibold text-slate-700">
                    <FaLock className="mr-1 inline" /> {tr("Locked system role")}
                  </span>
                ) : (
                  <>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                      <FaDatabase className="mr-1 inline" /> {tr("Revision")} {selectedRoleData?.revision || 0}
                    </span>
                    <span className="rounded-full bg-slate-50 px-2 py-1 font-medium text-slate-600">
                      {tr("Last saved")}: {formatSavedAt(selectedRoleData?.updatedAt)}
                    </span>
                  </>
                )}
                {hasChanges ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 font-bold text-amber-800">
                    <FaExclamationTriangle className="mr-1 inline" /> {tr("Unsaved changes")}
                  </span>
                ) : !isLockedRole ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-800">
                    <FaCheckCircle className="mr-1 inline" /> {tr("Saved")}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
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
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 shadow-sm">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-bold">
                  {tr("Pending changes")}: +{addedPermissions.length} / -{removedPermissions.length}
                </div>
                <div className="mt-1 text-[11px] font-normal">
                  {tr("These changes are only on this screen until Save Changes is confirmed.")}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {addedPermissions.map((permission) => (
                    <span key={`add-${permission.key}`} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      <FaPlusCircle className="mr-1 inline" /> {tr(permission.label)}
                    </span>
                  ))}
                  {removedPermissions.map((permission) => (
                    <span key={`remove-${permission.key}`} className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
                      <FaMinusCircle className="mr-1 inline" /> {tr(permission.label)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border bg-white p-3 shadow-md">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="relative">
              <FaSearch className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-xs text-slate-400 ${direction === "rtl" ? "right-3" : "left-3"}`} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={tr("Search permissions by name, description or key")}
                className={`w-full rounded-md border border-slate-300 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 ${direction === "rtl" ? "pl-3 pr-9" : "pl-9 pr-3"}`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FaFilter className="text-xs text-slate-400" />
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setFilterMode(option.key)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    filterMode === option.key
                      ? "bg-blue-700 text-white shadow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tr(option.label)} ({option.count})
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-[11px] font-medium text-slate-600">
              <input
                type="checkbox"
                checked={showTechnicalKeys}
                onChange={(event) => setShowTechnicalKeys(event.target.checked)}
                className="h-3.5 w-3.5"
              />
              <FaKey className="text-slate-400" /> {tr("Show technical permission keys")}
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={expandAll} className="text-[11px] font-semibold text-blue-700 hover:underline">
                {tr("Expand all")}
              </button>
              <span className="text-slate-300">|</span>
              <button type="button" onClick={collapseAll} className="text-[11px] font-semibold text-blue-700 hover:underline">
                {tr("Collapse all")}
              </button>
            </div>
          </div>
        </div>

        {groupedCatalog.length === 0 ? (
          <div className="rounded-lg border bg-white p-6 text-center text-sm text-slate-500 shadow-md">
            {availableCatalog.length === 0
              ? tr("No configurable permissions are currently available for this role.")
              : tr("No permissions match the current search or filter.")}
          </div>
        ) : (
          groupedCatalog.map(([category, permissions]) => {
            const collapsed = collapsedCategories.includes(category) && !searchTerm;
            const stats = categoryStats.get(category) || { total: permissions.length, enabled: 0, changed: 0 };

            return (
              <div key={category} className="overflow-hidden rounded-lg border bg-white shadow-md">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-start hover:bg-slate-100"
                  aria-expanded={!collapsed}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-700">{tr(category)}</h2>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        {stats.enabled}/{stats.total} {tr("enabled")}
                      </span>
                      {stats.changed > 0 ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          {stats.changed} {tr("changed")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {collapsed ? <FaChevronDown className="shrink-0 text-slate-500" /> : <FaChevronUp className="shrink-0 text-slate-500" />}
                </button>

                {!collapsed ? (
                  <div className="grid grid-cols-1 gap-2 p-4 md:grid-cols-2">
                    {permissions.map((permission) => {
                      const checked = selectedSet.has(permission.key);
                      const locked = isLockedRole || permission.editable === false;
                      const isAdded = checked && !savedSet.has(permission.key);
                      const isRemoved = !checked && savedSet.has(permission.key);
                      const requirementLabels = (permission.requires || []).map(
                        (key) => permissionLabelByKey.get(key) || key
                      );
                      const activeDependentLabels = [...collectActiveDependents(permission.key, selectedSet)].map(
                        (key) => permissionLabelByKey.get(key) || key
                      );

                      return (
                        <label
                          key={permission.key}
                          className={`flex items-start gap-3 rounded-md border p-3 transition ${
                            isAdded
                              ? "border-emerald-300 bg-emerald-50"
                              : isRemoved
                                ? "border-rose-300 bg-rose-50"
                                : checked
                                  ? "border-blue-300 bg-blue-50"
                                  : "border-slate-200 bg-white"
                          } ${locked ? "cursor-default" : "cursor-pointer hover:border-blue-200"}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={locked}
                            onChange={() => togglePermission(permission)}
                            className="mt-1 h-4 w-4 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
                              <span>{tr(permission.label)}</span>
                              {isLockedRole ? (
                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                                  <FaLock className="mr-1 inline" /> {tr("Always enabled")}
                                </span>
                              ) : null}
                              {isAdded ? (
                                <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                                  <FaPlusCircle className="mr-1 inline" /> {tr("Will enable")}
                                </span>
                              ) : null}
                              {isRemoved ? (
                                <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[9px] font-bold text-rose-800">
                                  <FaMinusCircle className="mr-1 inline" /> {tr("Will disable")}
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-1 text-[11px] leading-4 text-slate-500">{tr(permission.description)}</div>
                            {requirementLabels.length > 0 ? (
                              <div className="mt-1.5 rounded bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700">
                                <FaInfoCircle className="mr-1 inline" /> {tr("Automatically requires")}: {requirementLabels.map((label) => tr(label)).join(", ")}
                              </div>
                            ) : null}
                            {checked && activeDependentLabels.length > 0 ? (
                              <div className="mt-1 text-[10px] font-medium text-amber-700">
                                {tr("Currently required by")}: {activeDependentLabels.map((label) => tr(label)).join(", ")}
                              </div>
                            ) : null}
                            {showTechnicalKeys ? (
                              <div className="mt-2 break-all rounded bg-slate-100 px-2 py-1 font-mono text-[9px] text-slate-500">
                                {permission.key}
                              </div>
                            ) : null}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })
        )}

        {!isLockedRole && hasChanges ? (
          <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300 bg-white/95 p-3 shadow-xl backdrop-blur">
            <div className="text-xs font-semibold text-slate-700">
              <span className="text-amber-700">{changedCount} {tr("pending changes")}</span>
              <span className="mx-2 text-[10px] font-normal text-slate-500">
                +{addedPermissions.length} / -{removedPermissions.length}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDiscard}
                className="inline-flex items-center rounded-md bg-slate-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-slate-700"
              >
                <FaUndoAlt className="mr-1" /> {tr("Discard Changes")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-blue-800"
              >
                <FaSave className="mr-1" /> {tr("Save Changes")}
              </button>
            </div>
          </div>
        ) : null}

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-900">
          <b>{tr("Important")}</b>: {tr("Changing a permission never expands the role's data scope. For example, Supervisor remains limited to assigned Niswans and Niswan Admin remains limited to the own Niswan.")}
          <br />
          {tr("Dependencies are enforced automatically. Enabling a permission may enable required permissions; disabling a required permission may also disable its active dependents.")}
          <br />
          {tr("Server authorization uses the saved database permissions immediately. Other signed-in users should refresh or sign in again so their menus reflect the latest permissions.")}
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsPage;
