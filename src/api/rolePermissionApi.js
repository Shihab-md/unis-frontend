import axios from "axios";
import { getBaseUrl } from "../utils/CommonHelper";

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchRolePermissions = async () => {
  const base = await getBaseUrl();
  const res = await axios.get(`${base}role-permissions`, authConfig());
  return res.data;
};

export const saveRolePermissions = async (role, permissions, expectedRevision) => {
  const base = await getBaseUrl();
  const res = await axios.put(
    `${base}role-permissions/${encodeURIComponent(role)}`,
    { permissions, expectedRevision },
    authConfig()
  );
  return res.data;
};

export const resetRolePermissions = async (role, expectedRevision) => {
  const base = await getBaseUrl();
  const res = await axios.delete(`${base}role-permissions/${encodeURIComponent(role)}`, {
    ...authConfig(),
    params: { expectedRevision },
  });
  return res.data;
};
