export const popupFilterValue = (key) => {
  const value = String(localStorage.getItem(key) ?? "").trim();
  return value === "null" || value === "undefined" ? "" : value;
};

export const readPopupFilters = (keys) => Object.fromEntries(
  Object.entries(keys).map(([field, key]) => [field, popupFilterValue(key)])
);

export const savePopupFilters = (keys, values, cacheKey) => {
  for (const [field, key] of Object.entries(keys)) {
    const value = String(values[field] ?? "").trim();
    if (value && value !== "null" && value !== "undefined") localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  }
  if (cacheKey) localStorage.removeItem(cacheKey);
};

export const loadPopupOptions = async (...sources) => {
  const result = await Promise.all(sources.map((source) => source()));
  if (!result.every(Array.isArray)) throw new Error("Filter options could not be loaded");
  return result;
};

export const NISWAN_POPUP_ROLES = new Set(["admin", "employee", "teacher", "usthadh", "warden", "staff", "student", "parent"]);
export const hasFixedPopupSchool = (user) => NISWAN_POPUP_ROLES.has(String(user?.role || "").toLowerCase())
  && String(user?.organizationType || popupFilterValue("organizationType")).toUpperCase() !== "HQ";
export const fixedPopupSchoolId = (user) => hasFixedPopupSchool(user)
  ? String(user?.schoolId?._id || user?.schoolId || popupFilterValue("schoolId") || "") : "";
