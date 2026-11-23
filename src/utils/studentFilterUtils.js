export const STUDENT_FILTER_KEYS = Object.freeze([
  "courseId", "status", "acYear", "maritalStatus", "hosteller", "year", "instituteId", "courseStatus",
]);

export const cleanStudentFilterValue = (value) => {
  const text = String(value ?? "").trim();
  return text === "null" || text === "undefined" ? "" : text;
};

export const readStudentFilters = (storage) => Object.fromEntries(
  STUDENT_FILTER_KEYS.map((key) => [key, cleanStudentFilterValue(storage.getItem(key))])
);

export const getStudentResetFilters = (academicYears) => {
  // The unfiltered Students List uses the configured Active academic year.
  // acYear in storage is the last applied filter and must not define Reset.
  const selectedYear = academicYears.find((year) => year.active === "Active");
  return {
    ...Object.fromEntries(STUDENT_FILTER_KEYS.map((key) => [key, ""])),
    acYear: selectedYear ? String(selectedYear._id) : "",
  };
};

export const getStudentPopupFilters = (academicYears, storage) => {
  const values = readStudentFilters(storage);
  const storedYear = academicYears.find((year) => String(year._id) === values.acYear);
  return {
    ...values,
    acYear: storedYear ? String(storedYear._id) : getStudentResetFilters(academicYears).acYear,
  };
};

export const saveStudentFilters = (values, storage) => {
  for (const key of STUDENT_FILTER_KEYS) {
    const value = cleanStudentFilterValue(values[key]);
    if (value) storage.setItem(key, value);
    else storage.removeItem(key);
  }
  storage.removeItem("students");
};
