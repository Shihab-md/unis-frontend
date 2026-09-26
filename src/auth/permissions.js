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

  EXAM_QUESTION_VIEW: "exam.question.view",
  EXAM_QUESTION_CREATE: "exam.question.create",
  EXAM_QUESTION_EDIT: "exam.question.edit",
  EXAM_QUESTION_DELETE: "exam.question.delete",
  EXAM_QUESTION_DOWNLOAD_TRACKING_VIEW: "exam.question.download_tracking.view",

  CERTIFICATE_VIEW: "certificate.view",
  CERTIFICATE_GENERATE: "certificate.generate",
  CERTIFICATE_REPRINT: "certificate.reprint",
  CERTIFICATE_DUPLICATE_PRINT: "certificate.duplicate_print",
  CERTIFICATE_BULK_IHS: "certificate.bulk_ihs",

  INSPECTION_VIEW: "inspection.view",
  INSPECTION_CREATE: "inspection.create",

  ACCOUNTS_VIEW: "accounts.view",
  ACCOUNTS_SCHOOL_INVOICES_VIEW: "accounts.school_invoices.view",
  ACCOUNTS_PAYMENT_BATCH_SUBMIT: "accounts.payment_batch.submit",
  ACCOUNTS_BATCH_HISTORY_VIEW: "accounts.payment_batch.history.view",
  ACCOUNTS_HQ_REVIEW_VIEW: "accounts.hq_review.view",
  ACCOUNTS_HQ_APPROVE: "accounts.hq_review.approve",
  ACCOUNTS_HQ_REJECT: "accounts.hq_review.reject",
  ACCOUNTS_HQ_PENDING_INVOICES_VIEW: "accounts.hq_pending_invoices.view",
  ACCOUNTS_HQ_MIGRATION_RUN: "accounts.hq_migration.run",

  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",

  NOTIFICATIONS_VIEW: "notifications.view",
  NOTIFICATIONS_SEND: "notifications.send",
  NOTIFICATIONS_SENT_HISTORY_VIEW: "notifications.sent_history.view",

  HELP_DESK_VIEW: "helpdesk.view",
  HELP_DESK_CREATE: "helpdesk.create",
  HELP_DESK_REPLY: "helpdesk.reply",
  HELP_DESK_STATUS_MANAGE: "helpdesk.status.manage",

  MASTER_INSTITUTE_VIEW: "master.institute.view",
  MASTER_INSTITUTE_CREATE: "master.institute.create",
  MASTER_INSTITUTE_EDIT: "master.institute.edit",
  MASTER_INSTITUTE_DELETE: "master.institute.delete",

  MASTER_COURSE_VIEW: "master.course.view",
  MASTER_COURSE_CREATE: "master.course.create",
  MASTER_COURSE_EDIT: "master.course.edit",
  MASTER_COURSE_DELETE: "master.course.delete",

  MASTER_ACADEMIC_YEAR_VIEW: "master.academic_year.view",
  MASTER_ACADEMIC_YEAR_CREATE: "master.academic_year.create",
  MASTER_ACADEMIC_YEAR_EDIT: "master.academic_year.edit",
  MASTER_ACADEMIC_YEAR_DELETE: "master.academic_year.delete",

  MASTER_TEMPLATE_VIEW: "master.template.view",
  MASTER_TEMPLATE_CREATE: "master.template.create",
  MASTER_TEMPLATE_EDIT: "master.template.edit",
  MASTER_TEMPLATE_DELETE: "master.template.delete",

  MASTER_DISTRICT_STATE_VIEW: "master.district_state.view",
  MASTER_DISTRICT_STATE_CREATE: "master.district_state.create",
  MASTER_DISTRICT_STATE_EDIT: "master.district_state.edit",
  MASTER_DISTRICT_STATE_DELETE: "master.district_state.delete",

  MASTER_GRADE_VIEW: "master.grade.view",
  MASTER_GRADE_CREATE: "master.grade.create",
  MASTER_GRADE_EDIT: "master.grade.edit",
  MASTER_GRADE_DELETE: "master.grade.delete",

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

  institutesList: PERMISSIONS.MASTER_INSTITUTE_VIEW,
  instituteView: PERMISSIONS.MASTER_INSTITUTE_VIEW,
  instituteAdd: PERMISSIONS.MASTER_INSTITUTE_CREATE,
  instituteEdit: PERMISSIONS.MASTER_INSTITUTE_EDIT,

  coursesList: PERMISSIONS.MASTER_COURSE_VIEW,
  courseView: PERMISSIONS.MASTER_COURSE_VIEW,
  courseAdd: PERMISSIONS.MASTER_COURSE_CREATE,
  courseEdit: PERMISSIONS.MASTER_COURSE_EDIT,

  acYearsList: PERMISSIONS.MASTER_ACADEMIC_YEAR_VIEW,
  acYearView: PERMISSIONS.MASTER_ACADEMIC_YEAR_VIEW,
  acYearAdd: PERMISSIONS.MASTER_ACADEMIC_YEAR_CREATE,
  acYearEdit: PERMISSIONS.MASTER_ACADEMIC_YEAR_EDIT,

  templatesList: PERMISSIONS.MASTER_TEMPLATE_VIEW,
  templateView: PERMISSIONS.MASTER_TEMPLATE_VIEW,
  templateAdd: PERMISSIONS.MASTER_TEMPLATE_CREATE,
  templateEdit: PERMISSIONS.MASTER_TEMPLATE_EDIT,

  districtStateList: PERMISSIONS.MASTER_DISTRICT_STATE_VIEW,
  districtStateView: PERMISSIONS.MASTER_DISTRICT_STATE_VIEW,
  districtStateAdd: PERMISSIONS.MASTER_DISTRICT_STATE_CREATE,
  districtStateEdit: PERMISSIONS.MASTER_DISTRICT_STATE_EDIT,

  gradesList: PERMISSIONS.MASTER_GRADE_VIEW,
  gradeView: PERMISSIONS.MASTER_GRADE_VIEW,
  gradeAdd: PERMISSIONS.MASTER_GRADE_CREATE,
  gradeEdit: PERMISSIONS.MASTER_GRADE_EDIT,

  certificatesList: PERMISSIONS.CERTIFICATE_VIEW,
  certificateView: PERMISSIONS.CERTIFICATE_VIEW,
  certificateAdd: PERMISSIONS.CERTIFICATE_GENERATE,
  certificateEdit: PERMISSIONS.CERTIFICATE_REPRINT,
  certificateDuplicatePrint: PERMISSIONS.CERTIFICATE_DUPLICATE_PRINT,
  certificateBulkIhs: PERMISSIONS.CERTIFICATE_BULK_IHS,

  inspectionReportList: PERMISSIONS.INSPECTION_VIEW,
  inspectionReportView: PERMISSIONS.INSPECTION_VIEW,
  inspectionReportAdd: PERMISSIONS.INSPECTION_CREATE,

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
