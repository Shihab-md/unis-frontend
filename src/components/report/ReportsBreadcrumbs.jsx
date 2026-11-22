/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useLanguage } from "../../i18n/LanguageContext";
import { translateReportNavigation } from "../../i18n/reportNavigationText";
import { REPORT_CATEGORIES, REPORTS_PATH } from "../../reports/reportCatalog";

export default function ReportsBreadcrumbs({ categoryId, title = "", inverse = false }) {
  const { tr, language, direction } = useLanguage();
  const t = (text) => translateReportNavigation(text, language, tr);
  const category = REPORT_CATEGORIES.find((item) => item.id === categoryId);
  return <div className={`report-no-print text-sm ${inverse ? "text-white" : "text-slate-700"}`}>
    <nav aria-label={tr("Breadcrumb")}><ol className="flex flex-wrap items-center gap-2">
      <li><Link className="underline underline-offset-2" to={REPORTS_PATH}>{t("Reports")}</Link></li>
      {category && <><li aria-hidden="true">/</li><li>{title ? <Link className="underline underline-offset-2" to={`${REPORTS_PATH}/${category.id}`}>{t(category.title)}</Link> : <span aria-current="page">{t(category.title)}</span>}</li></>}
      {title && <><li aria-hidden="true">/</li><li aria-current="page">{t(title)}</li></>}
    </ol></nav>
    <div className="mt-3 flex flex-wrap gap-4">
      {category && title && <Link className="inline-flex items-center gap-2 underline underline-offset-2" to={`${REPORTS_PATH}/${category.id}`}><FaArrowLeft aria-hidden="true" className={direction === "rtl" ? "rotate-180" : ""} />{t(`Back to ${category.title}`)}</Link>}
      <Link className="inline-flex items-center gap-2 underline underline-offset-2" to={REPORTS_PATH}><FaArrowLeft aria-hidden="true" className={direction === "rtl" ? "rotate-180" : ""} />{t("Back to Reports")}</Link>
    </div>
  </div>;
}
