import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowAltCircleLeft, FaClipboardCheck, FaFilePdf } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const ExamsHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = String(user?.role || "").toLowerCase();
  const canQuestions = ["superadmin", "hquser", "admin"].includes(role);
  const canResults = ["superadmin", "admin"].includes(role);

  return (
    <div className="min-h-[70vh] px-2 py-3 md:px-4">
      <div className="mb-4 grid grid-cols-[80px_1fr_80px] items-center">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex w-fit items-center rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow hover:bg-slate-200"
        >
          <FaArrowAltCircleLeft className="mr-1" /> Back
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-700 lg:text-2xl">Exams</h2>
          <p className="text-xs text-slate-500">Question Papers and Results</p>
        </div>
        <div />
      </div>

      {!canQuestions && !canResults ? (
        <div className="mx-auto max-w-xl rounded-md border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700">
          Exam module is not available for this role.
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
                <div>
                  <h3 className="text-base font-bold text-slate-800">Questions</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Upload, schedule, target and securely download exam Question Paper PDFs.
                  </p>
                  <div className="mt-3 text-xs font-semibold text-blue-700 group-hover:text-blue-800">Open Question Papers →</div>
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
                <div>
                  <h3 className="text-base font-bold text-slate-800">Results</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Bulk marks entry, attendance, Grade calculation, saved exams and consolidated results.
                  </p>
                  <div className="mt-3 text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">Open Results →</div>
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
