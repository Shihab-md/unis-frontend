import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowAltCircleLeft, FaClipboardCheck, FaFilePdf } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { AutoText, useLanguage } from "../../i18n/LanguageContext";
import { PERMISSIONS } from "../../auth/permissions";

const ExamsHome = () => {
  const { can } = useAuth();
  const { t, direction, fontFamily } = useLanguage();
  const navigate = useNavigate();
  const canQuestions = can(PERMISSIONS.EXAM_QUESTION_VIEW);
  const canResults = can(PERMISSIONS.MARKSHEET_VIEW);

  return (
    <div className="min-h-[70vh] px-2 py-3 md:px-4" dir={direction} style={{ fontFamily }}>
      <div className="mb-4 grid grid-cols-[80px_1fr_80px] items-center">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex w-fit items-center rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow hover:bg-slate-200"
        >
          <FaArrowAltCircleLeft className={direction === "rtl" ? "ml-1" : "mr-1"} />
          <AutoText text={t("common.back")} variant="button" />
        </button>
        <div className="text-center min-w-0 px-2">
          <AutoText as="h2" text={t("exams.title")} variant="heading" className="font-bold text-slate-700" />
          <AutoText as="p" text={t("exams.subtitle")} className="mt-1 text-slate-500" />
        </div>
        <div />
      </div>

      {!canQuestions && !canResults ? (
        <div className="mx-auto max-w-xl rounded-md border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700">
          <AutoText text={t("exams.unavailable")} />
        </div>
      ) : (
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          {canQuestions ? (
            <Link
              to="/dashboard/exams/questions"
              className="group rounded-xl border border-blue-100 bg-white p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xl text-white shadow">
                  <FaFilePdf />
                </div>
                <div className="min-w-0 flex-1">
                  <AutoText as="h3" text={t("exams.questions")} className="font-bold text-slate-800" />
                  <AutoText as="p" text={t("exams.questionsDescription")} className="mt-1 leading-5 text-slate-500" />
                  <AutoText as="div" text={t("exams.openQuestions")} variant="button" className="mt-3 font-semibold text-blue-700 group-hover:text-blue-800" />
                </div>
              </div>
            </Link>
          ) : null}

          {canResults ? (
            <Link
              to="/dashboard/exams/results"
              className="group rounded-xl border border-emerald-100 bg-white p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-xl text-white shadow">
                  <FaClipboardCheck />
                </div>
                <div className="min-w-0 flex-1">
                  <AutoText as="h3" text={t("exams.results")} className="font-bold text-slate-800" />
                  <AutoText as="p" text={t("exams.resultsDescription")} className="mt-1 leading-5 text-slate-500" />
                  <AutoText as="div" text={t("exams.openResults")} variant="button" className="mt-3 font-semibold text-emerald-700 group-hover:text-emerald-800" />
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ExamsHome;
