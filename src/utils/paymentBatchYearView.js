export const yearBatchAmount = (batch) => Number(batch?.yearTotalAmount || 0);
export const yearBatchCount = (batch) => Number(batch?.yearItemCount || 0);

export const isAcademicYearResponse = (response, acYear) =>
  response?.academicYearScope === "INVOICE_ITEMS" &&
  String(response?.selectedAcademicYearId) === String(acYear) &&
  Array.isArray(response?.batches) && response.batches.every((batch) =>
    Number.isFinite(batch.yearTotalAmount) && Number.isInteger(batch.yearItemCount) &&
    batch.yearItemCount > 0 && Array.isArray(batch.items) && batch.items.length === batch.yearItemCount);

export const buildBatchYearCsv = (batches, yearLabel) => {
    const esc = (v) => {
      const s = v === null || v === undefined ? "" : String(v);
      const needs = /[",\r\n]/.test(s);
      return needs ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const rows = [];
    rows.push(
      [
        "BatchNo",
        "ReceiptNumber",
        "BatchStatus",
        "PaidDate",
        "Mode",
        "ReferenceNo",
        "SchoolCode",
        "SchoolName",
        "District",
        "State",
        "SelectedYearTotalAmount",
        "SelectedYearItemCount",
        "FullBatchTotalAmount",
        "FullBatchItemCount",
        "SelectedAcademicYear",
        "StudentName",
        "RollNumber",
        "CourseName",
        "CourseType",
        "InvoiceNo",
        "InvoiceSource",
        "ItemAmount",
        "ItemStatus",
        "ItemError",
      ]
        .map(esc)
        .join(",")
    );

    for (const b of batches) {
      const school = b?.schoolId || {};
      const ds = school?.districtStateId || {};
      const batchBase = {
        batchNo: b?.batchNo || "",
        receiptNumber: b?.receiptNumber || "",
        batchStatus: b?.status || "",
        paidDate: b?.paidDate ? new Date(b.paidDate).toISOString().slice(0, 10) : "",
        mode: b?.mode || "",
        referenceNo: b?.referenceNo || "",
        schoolCode: school?.code || "",
        schoolName: school?.nameEnglish || "",
        district: ds?.district || "",
        state: ds?.state || "",
        totalAmount: yearBatchAmount(b),
        itemCount: yearBatchCount(b),
        fullTotalAmount: b?.totalAmount ?? "",
        fullItemCount: b?.itemCount ?? "",
      };

      const items = Array.isArray(b?.items) ? b.items : [];
      if (items.length === 0) {
        rows.push(
          [
            batchBase.batchNo,
            batchBase.receiptNumber,
            batchBase.batchStatus,
            batchBase.paidDate,
            batchBase.mode,
            batchBase.referenceNo,
            batchBase.schoolCode,
            batchBase.schoolName,
            batchBase.district,
            batchBase.state,
            batchBase.totalAmount,
            batchBase.itemCount,
            batchBase.fullTotalAmount,
            batchBase.fullItemCount,
            yearLabel,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ]
            .map(esc)
            .join(",")
        );
        continue;
      }

      for (const it of items) {
        const stu = it?.studentId || {};
        const u = stu?.userId || {};
        const inv = it?.invoiceId || {};
        const c = inv?.courseId || {};

        rows.push(
          [
            batchBase.batchNo,
            batchBase.receiptNumber,
            batchBase.batchStatus,
            batchBase.paidDate,
            batchBase.mode,
            batchBase.referenceNo,
            batchBase.schoolCode,
            batchBase.schoolName,
            batchBase.district,
            batchBase.state,
            batchBase.totalAmount,
            batchBase.itemCount,
            batchBase.fullTotalAmount,
            batchBase.fullItemCount,
            yearLabel,
            u?.name || "",
            stu?.rollNumber || "",
            c?.name || "",
            c?.type || "",
            inv?.invoiceNo || "",
            inv?.source || "",
            it?.amount ?? "",
            it?.status || "",
            it?.error || "",
          ]
            .map(esc)
            .join(",")
        );
      }
    }

    return "\uFEFF" + rows.join("\r\n");
};
