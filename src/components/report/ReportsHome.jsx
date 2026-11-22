import { Link, useParams } from "react-router-dom";
import { FaBookOpen, FaBuilding, FaUsers, FaFileAlt } from "react-icons/fa";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { translateReportNavigation } from "../../i18n/reportNavigationText";
import { REPORT_CATEGORIES, REPORTS, REPORTS_PATH, canUseReports, canUseReport, reportPath } from "../../reports/reportCatalog";
import ReportsBreadcrumbs from "./ReportsBreadcrumbs";
import ReportDashboard from "./ReportDashboard";
import StudentYearEndReport from "./StudentYearEndReport";

const icons = { students: FaBookOpen, niswans: FaBuilding, employees: FaUsers };
const tones = { blue: "from-blue-700 to-sky-600", teal: "from-teal-700 to-emerald-600", violet: "from-violet-700 to-purple-600" };
export default function ReportsHome() {
  const { category: categoryId, reportId } = useParams();
  const { user, can, loading } = useAuth();
  const { tr, language, direction, fontFamily } = useLanguage();
  const t = (text) => translateReportNavigation(text, language, tr);
  if (loading) return <p role="status" className="p-6">{tr("Loading...")}</p>;
  if (!canUseReports(user, can)) return <p role="alert" className="p-6" dir={direction} style={{ fontFamily }}>{tr("Reports are not available for this role.")}</p>;
  const category = REPORT_CATEGORIES.find((item) => item.id === categoryId);
  const report = REPORTS.find((item) => item.category === categoryId && item.id === reportId);
  const visibleReports = REPORTS.filter((item) => canUseReport(item, user, can));
  if ((categoryId && !category) || (reportId && !report)) return <section className="p-6" dir={direction} style={{ fontFamily }}><h1 className="text-xl font-bold">{t("Report not found")}</h1><Link className="mt-3 inline-block underline" to={REPORTS_PATH}>{t("Back to Reports")}</Link></section>;
  if (report && !canUseReport(report, user, can)) return <section className="p-6" dir={direction} style={{ fontFamily }}><p role="alert">{tr("This report is available only to Superadmin and HQAdmin with report access.")}</p><Link to={`${REPORTS_PATH}/${category.id}`} className="mt-3 inline-block underline">{t(`Back to ${category.title}`)}</Link></section>;
  if (report?.view === "year-end") return <StudentYearEndReport key={`${user?._id || user?.id || ""}:${user?.role}:year-end`} />;
  if (report) return <ReportDashboard key={`${user?._id || user?.id || ""}:${user?.role}:${reportPath(report)}`} report={report} />;
  const cards = category ? visibleReports.filter((item) => item.category === categoryId) : REPORT_CATEGORIES.filter((item) => visibleReports.some((report) => report.category === item.id));
  return <section className="min-h-screen bg-slate-50 p-3 md:p-6" dir={direction} style={{ fontFamily }}>
    {category && <ReportsBreadcrumbs categoryId={category.id} />}
    <header className="mt-3 rounded-xl bg-gradient-to-r from-sky-800 to-teal-700 p-5 text-white shadow-lg">
      <h1 className="text-2xl font-bold">{t(category?.title || "Reports")}</h1>
      <p className="mt-2 text-sm">{t(category ? "Choose a report" : "Choose a report category")}</p>
    </header>
    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((item) => {
        const Icon = category ? FaFileAlt : icons[item.id];
        return <Link key={item.id} to={category ? reportPath(item) : `${REPORTS_PATH}/${item.id}`} className={`rounded-xl bg-gradient-to-br ${tones[category?.tone || item.tone]} p-5 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-700`}>
          <Icon aria-hidden="true" className="mb-4 text-3xl" />
          <h2 className="text-lg font-semibold">{t(item.title)}</h2>
          <p className="mt-2 text-sm text-white/90">{tr(item.description)}</p>
        </Link>;
      })}
    </div>
  </section>;
}
