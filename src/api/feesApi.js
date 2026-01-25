import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchDueInvoices = async ({ schoolId, acYear }) => {
  const base = (await getBaseUrl()).toString();
  console.log(base, schoolId, acYear)

  const res = await axios.get(
    (await getBaseUrl()).toString() + "fees/invoices/" + schoolId.toString() + "/" + acYear.toString(),
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.data?.invoices || [];
};

export const createPaymentBatch = async (payload) => {
  const base = await getBaseUrl();
  const res = await axios.post(`${base}fees/payment-batches`, payload, authHeaders());
  return res.data;
};

export const fetchSchoolFeesDashboard = async ({ schoolId, acYear }) => {
  const base = await getBaseUrl();
  const res = await axios.get(
    `${base}fees/dashboard/school?schoolId=${schoolId}&acYear=${acYear}`,
    authHeaders()
  );
  return res.data?.dashboard;
};

// HQ
export const fetchPendingBatches = async ({ schoolId, acYear }) => {
  const base = await getBaseUrl();
  const qs = new URLSearchParams({
    status: "PENDING_APPROVAL",
    ...(schoolId ? { schoolId } : {}),
    ...(acYear ? { acYear } : {}),
  });
  const res = await axios.get(`${base}hq/fees/payment-batches?${qs.toString()}`, authHeaders());
  return res.data?.batches || [];
};

export const fetchBatchDetails = async (batchId) => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}hq/fees/payment-batches/${batchId}`, authHeaders());
  return res.data; // { batch, items }
};

export const approveBatch = async (batchId) => {
  const base = await getBaseUrl();
  const res = await axios.post(`${base}hq/fees/payment-batches/${batchId}/approve`, {}, authHeaders());
  return res.data;
};

export const rejectBatch = async (batchId, reason) => {
  const base = await getBaseUrl();
  const res = await axios.post(
    `${base}hq/fees/payment-batches/${batchId}/reject`,
    { reason },
    authHeaders()
  );
  return res.data;
};

export const fetchHQFeesDashboard = async ({ acYear }) => {
  const base = await getBaseUrl();
  const qs = new URLSearchParams(acYear ? { acYear } : {});
  const res = await axios.get(`${base}hq/fees/dashboard?${qs.toString()}`, authHeaders());
  return res.data?.dashboard;
};
