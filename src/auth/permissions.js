export const PERMISSIONS = Object.freeze({
  ROLE_PERMISSIONS_MANAGE: "system.role_permissions.manage",

  NISWAN_VIEW: "niswan.view",
  NISWAN_CREATE: "niswan.create",
  NISWAN_EDIT: "niswan.edit",
  NISWAN_DELETE: "niswan.delete",

  SUPERVISOR_LIST: "supervisor.list",
  SUPERVISOR_VIEW: "supervisor.view",
  SUPERVISOR_CREATE: "supervisor.create",
  SUPERVISOR_EDIT: "supervisor.edit",
  SUPERVISOR_DELETE: "supervisor.delete",

  EMPLOYEE_VIEW: "employee.view",
  EMPLOYEE_CREATE: "employee.create",
  EMPLOYEE_EDIT: "employee.edit",
  EMPLOYEE_DELETE: "employee.delete",

  STUDENT_VIEW: "student.view",
  STUDENT_CREATE: "student.create",
  STUDENT_EDIT: "student.edit",
  STUDENT_DELETE: "student.delete",
  STUDENT_PROMOTE: "student.promote",

  STUDENT_ATTENDANCE_VIEW: "attendance.student.view",
  STUDENT_ATTENDANCE_ENTER: "attendance.student.enter",
  STUDENT_ATTENDANCE_FINALIZE: "attendance.student.finalize",

  STAFF_ATTENDANCE_SELF_VIEW: "attendance.staff.self.view",
  STAFF_ATTENDANCE_VIEW: "attendance.staff.view",
  STAFF_ATTENDANCE_ENTER: "attendance.staff.enter",
  STAFF_ATTENDANCE_FINALIZE: "attendance.staff.finalize",

  STUDENT_LEAVE_VIEW: "leave.student.view",
  STUDENT_LEAVE_MANAGE: "leave.student.manage",
  STAFF_LEAVE_SELF_VIEW: "leave.staff.self.view",
  STAFF_LEAVE_SELF_APPLY: "leave.staff.self.apply",
  STAFF_LEAVE_APPROVE: "leave.staff.approve",

  STUDENT_ATTENDANCE_REPORT_VIEW: "attendance.student.report.view",
  STAFF_ATTENDANCE_REPORT_VIEW: "attendance.staff.report.view",

  MARKSHEET_VIEW: "marksheet.view",
  MARKSHEET_ENTER: "marksheet.enter",
  MARKSHEET_FINALIZE: "marksheet.finalize",
  MARKSHEET_ANNUAL: "marksheet.annual",
  MARKSHEET_CONSOLIDATED_VIEW: "marksheet.consolidated.view",
  MARKSHEET_PDF: "marksheet.pdf",
});

export const SCREEN_PERMISSION_MAP = Object.freeze({
  schoolsList: PERMISSIONS.NISWAN_VIEW,
  schoolView: PERMISSIONS.NISWAN_VIEW,
  schoolAdd: PERMISSIONS.NISWAN_CREATE,
  schoolEdit: PERMISSIONS.NISWAN_EDIT,

  supervisorsList: PERMISSIONS.SUPERVISOR_LIST,
  supervisorView: PERMISSIONS.SUPERVISOR_VIEW,
  supervisorAdd: PERMISSIONS.SUPERVISOR_CREATE,
  supervisorEdit: PERMISSIONS.SUPERVISOR_EDIT,

  employeesList: PERMISSIONS.EMPLOYEE_VIEW,
  employeeView: PERMISSIONS.EMPLOYEE_VIEW,
  employeeAdd: PERMISSIONS.EMPLOYEE_CREATE,
  employeeEdit: PERMISSIONS.EMPLOYEE_EDIT,

  studentsList: PERMISSIONS.STUDENT_VIEW,
  studentView: PERMISSIONS.STUDENT_VIEW,
  studentAdd: PERMISSIONS.STUDENT_CREATE,
  studentEdit: PERMISSIONS.STUDENT_EDIT,
  studentPromote: PERMISSIONS.STUDENT_PROMOTE,

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
