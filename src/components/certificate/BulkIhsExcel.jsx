import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { FaRegTimesCircle } from "react-icons/fa";

import {
  checkAuth,
  handleRightClickAndFullScreen,
  getPrcessing,
  showSwalAlert,
} from "../../utils/CommonHelper";
import { createBulkIhsCertificates } from "../../api/ihsBulkCertificateApi";

const IMPORT_CHUNK_SIZE = 100;

const chunkArray = (items = [], size = 100) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
};

const downloadTextFile = (content, fileName) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const normalizeExcelRow = (row = {}) => ({
  rollNumber: String(row?.rollNumber || "").trim(),
  name: String(row?.name || "").trim(),
  fatherName: String(row?.fatherName || "").trim(),
  day: row?.day,
  month: row?.month,
  year: row?.year,
  ihs_type: String(row?.ihs_type || "").trim(),
  schoolName: String(row?.schoolName || "").trim(),
});

const isBlankRow = (row = {}) =>
  !String(row?.rollNumber || "").trim() &&
  !String(row?.name || "").trim() &&
  !String(row?.fatherName || "").trim() &&
  !String(row?.day ?? "").trim() &&
  !String(row?.month ?? "").trim() &&
  !String(row?.year ?? "").trim() &&
  !String(row?.ihs_type || "").trim() &&
  !String(row?.schoolName || "").trim();

const buildChunkLog = (rows = [], offset = 0) =>
  rows
    .map((row, idx) => {
      const lineNo = offset + idx + 1;
      return [
        `Row ${lineNo}`,
        `Roll Number: ${row?.rollNumber || "-"}`,
        `Status: ${row?.status || "-"}`,
        `Certificate No: ${row?.certificateNo || "-"}`,
        `View URL: ${row?.viewUrl || "-"}`,
        `Download URL: ${row?.downloadUrl || "-"}`,
        `Message: ${row?.message || "-"}`,
      ].join(" | ");
    })
    .join("\r\n");

const BulkIhsExcel = () => {
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const navigate = useNavigate();
  const importLockRef = useRef(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (checkAuth("certificateAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }
  }, [navigate]);

  const handleImport = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (importLockRef.current || processing) return;
    importLockRef.current = true;

    let totalRows = 0;
    let totalChunks = 0;
    let completedChunks = 0;
    let totalCreated = 0;
    let totalDuplicates = 0;
    let totalInvalid = 0;
    let totalFailed = 0;
    let combinedLogs = [];

    try {
      const { value: file } = await Swal.fire({
        title: "<h3 style='color:blue; font-size: 24px;'>Import IHS Certificate Excel</h3>",
        input: "file",
        background: "url(/bg_card.png)",
        inputAttributes: {
          accept: ".xlsx, .xls",
          "aria-label": "Upload IHS certificate Excel file",
        },
        confirmButtonText: "Upload",
        showCancelButton: true,
      });

      if (!file) return;

      setProcessing(true);

      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(ws, {
        defval: "",
        raw: true,
      });

      const normalizedRows = (Array.isArray(rawRows) ? rawRows : [])
        .map(normalizeExcelRow)
        .filter((row) => !isBlankRow(row));

      if (!normalizedRows.length) {
        setProcessing(false);
        await Swal.fire({
          title: "Info!",
          html: "<b>No rows found in selected Excel file.</b>",
          icon: "info",
          showConfirmButton: true,
          background: "url(/bg_card.png)",
        });
        return;
      }

      const confirm = await Swal.fire({
        title: "Create IHS Certificates?",
        html: `<b>Total Rows: ${normalizedRows.length}</b><br/><br/>System will create IHS certificates in chunks.`,
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

      const chunks = chunkArray(normalizedRows, IMPORT_CHUNK_SIZE);
      totalRows = normalizedRows.length;
      totalChunks = chunks.length;

      Swal.fire({
        title: "Creating IHS Certificates...",
        html: `<b>Preparing ${totalRows} rows in ${totalChunks} chunks...</b>`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: "url(/bg_card.png)",
        didOpen: () => {
          Swal.showLoading();
        },
      });

      for (let i = 0; i < chunks.length; i++) {
        const chunkRows = chunks[i];
        const startRow = i * IMPORT_CHUNK_SIZE + 1;
        const endRow = Math.min((i + 1) * IMPORT_CHUNK_SIZE, totalRows);

        if (Swal.isVisible()) {
          Swal.update({
            title: "Creating IHS Certificates...",
            html: `
              <div style="font-weight:bold;">Chunk ${i + 1} / ${totalChunks}</div>
              <div style="margin-top:8px;">Rows ${startRow} - ${endRow}</div>
              <div style="margin-top:8px; font-size:12px; color:#666;">Please do not close or refresh the page.</div>
            `,
          });
        }

        const resData = await createBulkIhsCertificates({ rows: chunkRows });

        if (!resData?.success) {
          throw new Error(resData?.error || `Chunk ${i + 1}/${totalChunks} failed.`);
        }

        completedChunks += 1;
        totalCreated += Number(resData?.summary?.created || 0);
        totalDuplicates += Number(resData?.summary?.duplicates || 0);
        totalInvalid += Number(resData?.summary?.invalid || 0);
        totalFailed += Number(resData?.summary?.failed || 0);

        combinedLogs.push(
          `===== Chunk ${i + 1}/${totalChunks} | Rows ${startRow}-${endRow} =====`
        );
        combinedLogs.push(buildChunkLog(resData?.rows || [], startRow - 1));
        combinedLogs.push("");
      }

      Swal.close();
      setProcessing(false);

      const fileName = `IHS_Certificate_Import_Result_${Date.now()}.txt`;
      const finalText = [
        `Summary: Created: ${totalCreated}, Duplicates: ${totalDuplicates}, Invalid: ${totalInvalid}, Failed: ${totalFailed}, Total: ${totalRows}`,
        `Chunk Size: ${IMPORT_CHUNK_SIZE}`,
        `Chunks Completed: ${completedChunks}/${totalChunks}`,
        "",
        ...combinedLogs,
      ].join("\r\n");

      downloadTextFile(finalText, fileName);

      await Swal.fire({
        title: "Success!",
        html: `<b>Created: ${totalCreated}, Duplicates: ${totalDuplicates}, Invalid: ${totalInvalid}, Failed: ${totalFailed}, Total: ${totalRows}</b><br/><br/>Please check the downloaded file:<br/>${fileName}`,
        icon: "success",
        showConfirmButton: true,
        background: "url(/bg_card.png)",
      });
    } catch (error) {
      Swal.close();
      setProcessing(false);

      const partialFileName = `IHS_Certificate_Import_Partial_${Date.now()}.txt`;
      const partialText = [
        `Summary before failure: Created: ${totalCreated}, Duplicates: ${totalDuplicates}, Invalid: ${totalInvalid}, Failed: ${totalFailed}, Completed Chunks: ${completedChunks}/${totalChunks || "-"}`,
        "",
        ...combinedLogs,
        "",
        `ERROR: ${error?.response?.data?.error || error?.message || error}`,
      ].join("\r\n");

      if (combinedLogs.length > 0) {
        downloadTextFile(partialText, partialFileName);
      }

      await Swal.fire({
        title: "Error!",
        html: `<b>Chunk import stopped.</b><br/><br/>${error?.response?.data?.error || error?.message || error}${combinedLogs.length > 0 ? `<br/><br/>Partial result file downloaded:<br/>${partialFileName}` : ""}`,
        icon: "error",
        showConfirmButton: true,
        background: "url(/bg_card.png)",
      });
    } finally {
      importLockRef.current = false;
    }
  };

  if (processing) {
    return getPrcessing();
  }

  return (
    <div className="p-3 sm:p-4">
      <div
        className="mx-auto max-w-5xl mt-5 rounded-md border border-slate-200 bg-white shadow-lg transition-all duration-200
        bg-[url('/c-6.jpg')] bg-center bg-no-repeat hover:-translate-y-0.5 hover:shadow-xl"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 254, 254, 0.88), rgba(255, 255, 255, 0.93)), url('/c-6.jpg')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="flex items-center justify-center rounded-t-md bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-3 shadow-lg">
          <h1 className="text-base font-semibold text-white">
            Bulk IHS Certificate Import
          </h1>
          <Link to="/dashboard/masters">
            <FaRegTimesCircle className="ml-4 rounded-full bg-white/90 p-1 text-2xl text-red-600 shadow-md md:ml-7" />
          </Link>
        </div>

        <div className="p-4 space-y-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700 shadow-sm">
            <p className="font-semibold text-amber-700 mb-1">Important</p>
            <p>
              This temporary IHS import is fully separate from the existing certificate module.
              Excel is the source of truth for printable fields.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleImport}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm shadow-xl hover:-translate-y-0.5"
            >
              Upload Excel & Create Certificates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkIhsExcel;