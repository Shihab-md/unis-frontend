import React, { forwardRef, useImperativeHandle, useState } from "react";
import Select from "react-select";

const StudentFilterPopup = forwardRef(function StudentFilterPopup(
  { courses, institutes, academicYears, initialValues, getResetValues, onChange, tr, direction, fontFamily }, ref
) {
  const [values, setValues] = useState(initialValues);

  const updateValues = (next) => {
    setValues(next);
    onChange(next);
  };
  useImperativeHandle(ref, () => ({ reset: () => updateValues(getResetValues()) }));

  const field = (key, label, options, className = "") => (
    <div className={className}>
      <label htmlFor={`student-filter-${key}`} className="mb-1 block text-start text-sm text-blue-500">
        {tr(label)}
      </label>
      <Select
        inputId={`student-filter-${key}`}
        instanceId={`student-filter-${key}`}
        aria-label={tr(label)}
        className="mb-3 text-start text-sm"
        options={options}
        value={options.find((option) => String(option.value) === values[key]) || null}
        onChange={(option) => updateValues({ ...values, [key]: option ? String(option.value) : "" })}
        isClearable
        isRtl={direction === "rtl"}
        maxMenuHeight={180}
        menuPortalTarget={document.body}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 2000 }) }}
        placeholder=""
      />
    </div>
  );
  const textOptions = (labels) => labels.map((label) => ({ value: label, label: tr(label) }));

  return (
    <div dir={direction} style={{ fontFamily }} className="mb-2 w-full">
      <div className="mb-3 text-center text-xl font-bold text-green-600">{tr("Filter")}</div>
      <div className="grid grid-cols-4 gap-x-3 md:grid-cols-6">
        {field("courseId", "Course", courses.map((course) => ({ value: String(course._id), label: course.name })), "col-span-2 md:col-span-3")}
        {field("year", "Year", Array.from({ length: 13 }, (_, year) => ({ value: String(year), label: String(year) })))}
        {field("courseStatus", "Course Status", textOptions(["Admission", "Promoted", "Completed", "Not-Promoted"]), "md:col-span-2")}
      </div>
      <div className="grid grid-cols-3 gap-x-3">
        {field("instituteId", "Institute", institutes.map((institute) => ({ value: String(institute._id), label: institute.name })), "col-span-2")}
        {field("acYear", "AC year", academicYears.map((year) => ({ value: String(year._id), label: year.acYear })))}
      </div>
      <div className="grid grid-cols-3 gap-x-3">
        {field("status", "Status", textOptions(["Active", "Alumni", "In-Active", "Transferred", "Graduated", "Discontinued"]))}
        {field("maritalStatus", "Marital Status", textOptions(["Married", "Single"]))}
        {field("hosteller", "Hosteller", textOptions(["Yes", "No"]))}
      </div>
    </div>
  );
});

export default StudentFilterPopup;
