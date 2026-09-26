import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { FaDownload, FaRegTimesCircle } from "react-icons/fa";

import {
  checkAuth,
  handleRightClickAndFullScreen,
  getPrcessing,
  showSwalAlert,
} from "../../utils/CommonHelper";
import {
  createTempSchoolMarksheets,
  getTempSchoolMarksheetTemplateInfo,
} from "../../api/tempSchoolMarksheetApi";

const SHEET_NAME = "School_Marksheet_Template";
const IMPORT_CHUNK_SIZE = 15;
const CHUNK_DELAY_MS = 750;

const EXPECTED_HEADERS = [
  "exam",
  "acYear",
  "regNumber",
  "name",
  "course",
  "niswanCode",
  "niswanName",
  "address",
  "subName1",
  "mark1",
  "result1",
  "subName2",
  "mark2",
  "result2",
  "subName3",
  "mark3",
  "result3",
  "subName4",
  "mark4",
  "result4",
  "subName5",
  "mark5",
  "result5",
  "subName6",
  "mark6",
  "result6",
  "day",
  "month",
  "year",
  "grade",
  "remarks",
];

const chunkArray = (items = [], size = IMPORT_CHUNK_SIZE) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isBlankRow = (row = {}) =>
  EXPECTED_HEADERS.every((header) => String(row?.[header] ?? "").trim() === "");

const normalizeRow = (row = {}, sourceRowNumber) => {
  const normalized = { sourceRowNumber };
  EXPECTED_HEADERS.forEach((header) => {
    normalized[header] = row?.[header] ?? "";
  });
  return normalized;
};

const validateWorkbook = (workbook) => {
  if (!workbook?.SheetNames?.includes(SHEET_NAME)) {
    throw new Error(`Required sheet "${SHEET_NAME}" was not found.`);
  }

  const worksheet = workbook.Sheets[SHEET_NAME];
  const matrix = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  const headerRow = Array.isArray(matrix?.[0])
    ? matrix[0].map((value) => String(value ?? "").trim())
    : [];
  const headerSet = new Set(headerRow);
  const missing = EXPECTED_HEADERS.filter((header) => !headerSet.has(header));

  if (missing.length > 0) {
    throw new Error(`Missing required Excel column(s): ${missing.join(", ")}`);
  }

  const duplicateHeaders = EXPECTED_HEADERS.filter(
    (header) => headerRow.filter((value) => value === header).length > 1
  );
  if (duplicateHeaders.length > 0) {
    throw new Error(`Duplicate Excel column(s): ${duplicateHeaders.join(", ")}`);
  }

  const rows = [];
  for (let matrixIndex = 1; matrixIndex < matrix.length; matrixIndex += 1) {
    const values = Array.isArray(matrix[matrixIndex]) ? matrix[matrixIndex] : [];
    const rawRow = {};
    headerRow.forEach((header, columnIndex) => {
      if (header) rawRow[header] = values[columnIndex] ?? "";
    });

    const normalized = normalizeRow(rawRow, matrixIndex + 1);
    if (!isBlankRow(normalized)) rows.push(normalized);
  }

  return rows;
};

const downloadReportWorkbook = ({
  rows,
  summary,
  completedChunks,
  totalChunks,
  fatalError = "",
  partial = false,
  templateInfo = null,
}) => {
  const wb = XLSX.utils.book_new();

  const summaryRows = [
    ["TEMP SCHOOL MARKSHEET PROCESSING REPORT"],
    [],
    ["TOTAL ROWS", Number(summary.total || 0)],
    ["SUCCESS", Number(summary.success || 0)],
    ["CREATED", Number(summary.created || 0)],
    ["REPLACED", Number(summary.replaced || 0)],
    ["INVALID", Number(summary.invalid || 0)],
    ["FAILED", Number(summary.failed || 0)],
    ["CHUNK SIZE", IMPORT_CHUNK_SIZE],
    ["CHUNKS COMPLETED", `${completedChunks}/${totalChunks || 0}`],
    ["GOOGLE DRIVE PATH", "UNIS/Marksheets/Temp-School"],
    ["TEMPLATE COURSE", templateInfo ? `${templateInfo.courseCode} - ${templateInfo.courseName}` : ""],
    ["TEMPLATE TYPE", templateInfo ? `${templateInfo.templateModule} / ${templateInfo.marksheetType}` : ""],
    ["TEMPLATE VERSION", templateInfo?.version ?? ""],
  ];

  if (fatalError) summaryRows.push(["PROCESSING ERROR", fatalError]);

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet["!cols"] = [{ wch: 24 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  const resultRows = (Array.isArray(rows) ? rows : []).map((row) => ({
    "EXCEL ROW": row?.sourceRowNumber ?? "",
    "REGISTER NUMBER": row?.regNumber || "",
    "STUDENT NAME": row?.name || "",
    STATUS: row?.status || "",
    ACTION: row?.action || "",
    "TOTAL SUBJECTS": row?.totalSubjects ?? "",
    "TOTAL MARKS": row?.totalMarks || "",
    PERCENTAGE: row?.percentage || "",
    "FILE NAME": row?.fileName || "",
    "DRIVE VIEW URL": row?.viewUrl || "",
    "DRIVE DOWNLOAD URL": row?.downloadUrl || "",
    MESSAGE: row?.message || "",
  }));

  const resultsSheet = XLSX.utils.json_to_sheet(resultRows, {
    header: [
      "EXCEL ROW",
      "REGISTER NUMBER",
      "STUDENT NAME",
      "STATUS",
      "ACTION",
      "TOTAL SUBJECTS",
      "TOTAL MARKS",
      "PERCENTAGE",
      "FILE NAME",
      "DRIVE VIEW URL",
      "DRIVE DOWNLOAD URL",
      "MESSAGE",
    ],
  });
  resultsSheet["!cols"] = [
    { wch: 11 },
    { wch: 18 },
    { wch: 28 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 16 },
    { wch: 14 },
    { wch: 40 },
    { wch: 55 },
    { wch: 55 },
    { wch: 70 },
  ];
  XLSX.utils.book_append_sheet(wb, resultsSheet, "Results");

  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const prefix = partial
    ? "TEMP_SCHOOL_MARKSHEET_PARTIAL_REPORT"
    : "TEMP_SCHOOL_MARKSHEET_REPORT";
  const fileName = `${prefix}_${stamp}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
};

const TempSchoolMarksheets = () => {
  const navigate = useNavigate();
  const importLockRef = useRef(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  useEffect(() => {
    if (checkAuth("tempSchoolMarksheet") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }
  }, [navigate]);

  const handleImport = async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    if (importLockRef.current || processing) return;
    importLockRef.current = true;

    let totalRows = 0;
    let totalChunks = 0;
    let completedChunks = 0;
    let resultRows = [];
    let templateInfo = null;
    let summary = {
      total: 0,
      success: 0,
      created: 0,
      replaced: 0,
      invalid: 0,
      failed: 0,
    };

    try {
      const { value: file } = await Swal.fire({
        title: "<h3 style='color:blue; font-size: 24px;'>Import Temp School Marksheet Excel</h3>",
        input: "file",
        background: "url(/bg_card.png)",
        inputAttributes: {
          accept: ".xlsx, .xls",
          "aria-label": "Upload temporary school marksheet Excel file",
        },
        confirmButtonText: "Upload",
        showCancelButton: true,
      });

      if (!file) return;
      setProcessing(true);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const rows = validateWorkbook(workbook);

      if (!rows.length) {
        setProcessing(false);
        await Swal.fire({
          title: "Info!",
          html: `<b>No data rows found in ${SHEET_NAME}.</b>`,
          icon: "info",
          showConfirmButton: true,
          background: "url(/bg_card.png)",
        });
        return;
      }

      const templateResponse = await getTempSchoolMarksheetTemplateInfo({ timeout: 60000 });
      if (!templateResponse?.success || !templateResponse?.template) {
        throw new Error(
          templateResponse?.error ||
            "SE-02 / 7TH STANDARD / Normal Marksheet template is not ready."
        );
      }
      templateInfo = templateResponse.template;

      const confirm = await Swal.fire({
        title: "Create Temp School Marksheets?",
        html: `
          <b>Total Rows: ${rows.length}</b><br/><br/>
          PDFs will be processed in chunks of ${IMPORT_CHUNK_SIZE}.<br/>
          Existing files with the same REGISTER NUMBER - NAME will be replaced in Google Drive.<br/><br/>
          <b>Template:</b> ${templateInfo.courseCode} - ${templateInfo.courseName}<br/>
          <b>Type:</b> ${templateInfo.templateModule} / ${templateInfo.marksheetType} &nbsp; <b>Version:</b> ${templateInfo.version}<br/>
          <span style="font-size:12px;color:#666;">The uploaded Template-module PDF is used directly; text is overlaid as real selectable PDF text.</span><br/><br/>
          <span style="font-size:12px;color:#666;">Drive: UNIS/Marksheets/Temp-School</span>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Create",
        cancelButtonText: "Cancel",
        background: "url(/bg_card.png)",
      });

      if (!confirm.isConfirmed) {
        setProcessing(false);
        return;
      }

      const chunks = chunkArray(rows, IMPORT_CHUNK_SIZE);
      totalRows = rows.length;
      totalChunks = chunks.length;
      summary.total = totalRows;

      Swal.fire({
        title: "Creating Temp School Marksheets...",
        html: `<b>Preparing ${totalRows} rows in ${totalChunks} chunks...</b><br/><span style="font-size:12px;color:#666;">Please do not close or refresh the page.</span>`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: "url(/bg_card.png)",
        didOpen: () => Swal.showLoading(),
      });

      for (let i = 0; i < chunks.length; i += 1) {
        const chunkRows = chunks[i];
        const firstExcelRow = chunkRows[0]?.sourceRowNumber || "-";
        const lastExcelRow = chunkRows[chunkRows.length - 1]?.sourceRowNumber || "-";

        if (Swal.isVisible()) {
          Swal.update({
            title: "Creating Temp School Marksheets...",
            html: `
              <div style="font-weight:bold;">Chunk ${i + 1} / ${totalChunks}</div>
              <div style="margin-top:8px;">Excel Rows ${firstExcelRow} - ${lastExcelRow}</div>
              <div style="margin-top:8px;">Created: ${summary.created}, Replaced: ${summary.replaced}, Invalid: ${summary.invalid}, Failed: ${summary.failed}</div>
              <div style="margin-top:8px; font-size:12px; color:#666;">Validation errors are recorded and processing continues.</div>
            `,
          });
        }

        const response = await createTempSchoolMarksheets(
          {
            rows: chunkRows,
            batchNo: i + 1,
            totalBatches: totalChunks,
            templateVersion: templateInfo.version,
          },
          { timeout: 180000 }
        );

        if (!response?.success) {
          throw new Error(response?.error || `Chunk ${i + 1}/${totalChunks} failed.`);
        }

        if (
          !response?.template ||
          Number(response.template.version) !== Number(templateInfo.version) ||
          String(response.template.courseCode || "").toUpperCase() !== "SE-02" ||
          String(response.template.marksheetType || "").toUpperCase() !== "NORMAL"
        ) {
          throw new Error(
            "Template validation mismatch detected during batch processing. Processing stopped for safety."
          );
        }

        completedChunks += 1;
        resultRows = resultRows.concat(response?.rows || []);
        summary.created += Number(response?.summary?.created || 0);
        summary.replaced += Number(response?.summary?.replaced || 0);
        summary.invalid += Number(response?.summary?.invalid || 0);
        summary.failed += Number(response?.summary?.failed || 0);
        summary.success += Number(response?.summary?.success || 0);

        if (i < chunks.length - 1) await sleep(CHUNK_DELAY_MS);
      }

      Swal.close();
      setProcessing(false);

      const reportName = downloadReportWorkbook({
        rows: resultRows,
        summary,
        completedChunks,
        totalChunks,
        templateInfo,
      });

      await Swal.fire({
        title: "Completed!",
        html: `
          <b>Success: ${summary.success}, Created: ${summary.created}, Replaced: ${summary.replaced}, Invalid: ${summary.invalid}, Failed: ${summary.failed}, Total: ${totalRows}</b><br/><br/>
          Final report downloaded:<br/>${reportName}
        `,
        icon: summary.failed || summary.invalid ? "warning" : "success",
        showConfirmButton: true,
        background: "url(/bg_card.png)",
      });
    } catch (error) {
      Swal.close();
      setProcessing(false);

      const errorText = error?.response?.data?.error || error?.message || String(error);
      let partialReportName = "";
      if (resultRows.length > 0) {
        partialReportName = downloadReportWorkbook({
          rows: resultRows,
          summary,
          completedChunks,
          totalChunks,
          fatalError: errorText,
          partial: true,
          templateInfo,
        });
      }

      await Swal.fire({
        title: "Error!",
        html: `
          <b>Processing stopped because of a file/chunk level error.</b><br/><br/>
          ${errorText}
          ${partialReportName ? `<br/><br/>Partial report downloaded:<br/>${partialReportName}` : ""}
        `,
        icon: "error",
        showConfirmButton: true,
        background: "url(/bg_card.png)",
      });
    } finally {
      importLockRef.current = false;
    }
  };

  if (processing) return getPrcessing();

  return (
    <div className="p-3 sm:p-4">
      <div
        className="mx-auto max-w-5xl mt-5 rounded-md border border-slate-200 bg-white shadow-lg transition-all duration-200 bg-[url('/c-6.jpg')] bg-center bg-no-repeat hover:-translate-y-0.5 hover:shadow-xl"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 254, 254, 0.88), rgba(255, 255, 255, 0.93)), url('/c-6.jpg')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="flex items-center justify-center rounded-t-md bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 shadow-lg">
          <h1 className="text-base font-semibold text-white">
            Create Temp School Marksheets
          </h1>
          <Link to="/dashboard/masters">
            <FaRegTimesCircle className="ml-4 rounded-full bg-white/90 p-1 text-2xl text-red-600 shadow-md md:ml-7" />
          </Link>
        </div>

        <div className="p-4 space-y-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700 shadow-sm">
            <p className="font-semibold text-amber-700 mb-1">Important</p>
            <p>
              This temporary utility does not read or write Student, Niswan, Academic or
              Marksheet result records. All printable student/marks data comes only from Excel.
              The PDF artwork is loaded from Templates: SE-02 - 7TH STANDARD / Normal Marksheet.
            </p>
            <p className="mt-2">
              All printable text is converted to CAPITAL LETTERS. Total Subjects,
              Total Marks and Percentage are calculated automatically. Existing Google
              Drive files with the same name are replaced. The original uploaded PDF page is
              preserved and data is overlaid as real selectable/searchable PDF text (not an image).
            </p>
            <p className="mt-2 font-medium text-slate-800">
              Google Drive: UNIS/Marksheets/Temp-School
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              href="/School_Marksheet_Import_Template.xlsx"
              download="School_Marksheet_Import_Template.xlsx"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow hover:bg-emerald-50"
            >
              <FaDownload /> Download Excel Template
            </a>

            <button
              type="button"
              onClick={handleImport}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm shadow-xl hover:-translate-y-0.5"
            >
              Upload Excel & Create Marksheets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempSchoolMarksheets;
