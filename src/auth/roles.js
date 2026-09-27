export const ROLES = Object.freeze({
  SUPERADMIN: "superadmin",
  HQ_ADMIN: "hqadmin",
  ACCOUNTANT: "accountant",
  HQ_USER: "hquser",
  HQ_STAFF: "hqstaff",
  SUPERVISOR: "supervisor",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  TEACHER: "teacher",
  USTHADH: "usthadh",
  STUDENT: "student",
  PARENT: "parent",
  WARDEN: "warden",
  STAFF: "staff",
  GUEST: "guest",
});

export const GLOBAL_HQ_READ_ROLES = Object.freeze([
  ROLES.SUPERADMIN,
  ROLES.HQ_ADMIN,
  ROLES.ACCOUNTANT,
  ROLES.HQ_USER,
]);
export const GLOBAL_HQ_READ_ROLE_SET = new Set(GLOBAL_HQ_READ_ROLES);

export const HQ_OPERATIONAL_ROLES = Object.freeze([
  ROLES.SUPERADMIN,
  ROLES.HQ_ADMIN,
]);
export const HQ_OPERATIONAL_ROLE_SET = new Set(HQ_OPERATIONAL_ROLES);

export const HQ_ACCOUNTS_ROLES = Object.freeze([
  ROLES.SUPERADMIN,
  ROLES.HQ_ADMIN,
  ROLES.ACCOUNTANT,
]);
export const HQ_ACCOUNTS_ROLE_SET = new Set(HQ_ACCOUNTS_ROLES);

export const HQ_EMPLOYEE_ROLES = Object.freeze([
  ROLES.HQ_ADMIN,
  ROLES.ACCOUNTANT,
  ROLES.HQ_USER,
  ROLES.HQ_STAFF,
]);
export const HQ_EMPLOYEE_ROLE_SET = new Set(HQ_EMPLOYEE_ROLES);

// Payroll permissions are deliberately deferred to Phase 6. Preserve the exact
// pre-Phase-4 access boundary until then instead of inheriting access from HQ scope.
export const LEGACY_PAYROLL_ROLE_SET = new Set([
  ROLES.SUPERADMIN,
  ROLES.HQ_USER,
  ROLES.ADMIN,
]);

export const normalizeRole = (role) => String(role || "").trim().toLowerCase();
export const isGlobalHqReadRole = (role) => GLOBAL_HQ_READ_ROLE_SET.has(normalizeRole(role));
export const isHqOperationalRole = (role) => HQ_OPERATIONAL_ROLE_SET.has(normalizeRole(role));
export const isHqAccountsRole = (role) => HQ_ACCOUNTS_ROLE_SET.has(normalizeRole(role));
export const isHqEmployeeRole = (role) => HQ_EMPLOYEE_ROLE_SET.has(normalizeRole(role));
export const hasLegacyPayrollRole = (role) => LEGACY_PAYROLL_ROLE_SET.has(normalizeRole(role));
