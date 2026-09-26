export const PERMISSIONS = Object.freeze({
  ROLE_PERMISSIONS_MANAGE: "system.role_permissions.manage",

  MARKSHEET_VIEW: "marksheet.view",
  MARKSHEET_ENTER: "marksheet.enter",
  MARKSHEET_FINALIZE: "marksheet.finalize",
  MARKSHEET_ANNUAL: "marksheet.annual",
  MARKSHEET_CONSOLIDATED_VIEW: "marksheet.consolidated.view",
  MARKSHEET_PDF: "marksheet.pdf",
});

export const SCREEN_PERMISSION_MAP = Object.freeze({
  marksheetList: PERMISSIONS.MARKSHEET_VIEW,
  rolePermissions: PERMISSIONS.ROLE_PERMISSIONS_MANAGE,
});

export const getStoredPermissions = () => {
  try {
    const raw = localStorage.getItem("permissions");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : null;
  } catch {
    return null;
  }
};

export const hasStoredPermission = (permission) => {
  const permissions = getStoredPermissions();
  if (!permissions) return null;
  return permissions.includes(String(permission || ""));
};
