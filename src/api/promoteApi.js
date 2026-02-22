import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchPromoteCandidates = async ({ schoolId, targetAcYear, courseId }) => {
  const base = await getBaseUrl();
  const url = new URL(
    `student/promote/candidates/${schoolId}/${targetAcYear}/${courseId}`,
    base
  ).toString();

  const res = await axios.get(url, { headers: authHeaders() });
  return res.data;
};

export const promoteBulk = async ({
  schoolId,
  targetAcYear,
  courseId,
  studentIds,
  policy = "PROMOTE",
  requireFeesPaid = true,
  chunkSize = 10,
}) => {
  const base = await getBaseUrl();
  const url = new URL("student/promote/bulk", base).toString();

  const res = await axios.post(
    url,
    { schoolId, targetAcYear, courseId, studentIds, policy, requireFeesPaid, chunkSize },
    { headers: authHeaders() }
  );
  return res.data;
};
