import { PERMISSIONS } from "../auth/permissions";
import { normalizeRole } from "../auth/roles";

export const REPORTS_PATH = "/dashboard/reports";
const reportRoles = new Set(["superadmin", "hqadmin", "accountant", "hquser", "supervisor", "admin", "guest"]);
export const canUseReports = (user, can) => reportRoles.has(normalizeRole(user?.role)) && Boolean(can?.(PERMISSIONS.REPORTS_VIEW));
export const REPORT_CATEGORIES = Object.freeze([
  { id: "students", title: "Student Reports", description: "Student overview, detailed records and year-end progress.", tone: "blue" },
  { id: "niswans", title: "Niswan Reports", description: "Student strength and status totals for each Niswan.", tone: "teal" },
  { id: "employees", title: "Employee Reports", description: "Detailed employee and supervisor records.", tone: "violet" },
]);
export const REPORTS = Object.freeze([
  { id: "overview", category: "students", title: "Student Overview", description: "Student totals, admission trends, status and permitted fee summaries.", view: "overview" },
  { id: "directory", category: "students", title: "Student Detailed Report", description: "Filter student records and export the matching details.", view: "students" },
  { id: "year-end", category: "students", title: "Student Promotion & Year-End Status", description: "Check promotion, completion, pending decisions and exclusions by Niswan.", view: "year-end", roles: ["superadmin", "hqadmin"] },
  { id: "student-strength", category: "niswans", title: "Niswan Student Summary", description: "Compare student counts, status and permitted fee totals across Niswans.", view: "niswan" },
  { id: "directory", category: "employees", title: "Employee Detailed Report", description: "Filter employee records by Niswan, status and search.", view: "employees" },
  { id: "supervisors", category: "employees", title: "Supervisor Detailed Report", description: "Filter supervisor records by status, job type and search.", view: "supervisors" },
]);
export const canUseReport = (report, user, can) => Boolean(report) && canUseReports(user, can) &&
  (!report.roles || report.roles.includes(normalizeRole(user?.role)));
export const reportPath = (report) => `${REPORTS_PATH}/${report.category}/${report.id}`;
