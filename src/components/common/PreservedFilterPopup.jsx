import React, { forwardRef, useImperativeHandle, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const PopupFields = forwardRef(function PopupFields({ fields, initialValues, defaults, onChange, tr, direction, fontFamily }, ref) {
  const [values, setValues] = useState(initialValues);
  const update = (next) => { setValues(next); onChange(next); };
  useImperativeHandle(ref, () => ({ reset: () => update({ ...defaults }) }));
  return <div dir={direction} style={{ fontFamily }} className="mb-2 w-full">
    <h3 className="mb-3 text-center text-xl font-bold text-green-700">{tr("Filter")}</h3>
    <div className="grid gap-3">
      {fields.map((field) => <div key={field.key}>
        <label htmlFor={`popup-filter-${field.key}`} className="mb-1 block text-start text-sm text-blue-600">{tr(field.label)}</label>
        {field.type === "date" || field.type === "text" ? <input
          id={`popup-filter-${field.key}`} aria-label={tr(field.label)} type={field.type}
          className="w-full rounded border border-slate-300 p-2 text-sm"
          value={values[field.key] || ""} disabled={field.disabled}
          onChange={(event) => update({ ...values, [field.key]: event.target.value })}
        /> : <Select inputId={`popup-filter-${field.key}`} instanceId={`popup-filter-${field.key}`}
          aria-label={tr(field.label)} className="text-start text-sm" options={field.options}
          value={field.options.find((option) => String(option.value) === values[field.key]) || null}
          onChange={(option) => update({ ...values, [field.key]: option ? String(option.value) : "" })}
          isClearable={!field.disabled} isDisabled={field.disabled} isRtl={direction === "rtl"}
          placeholder={tr("All")} maxMenuHeight={190} menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 2000 }) }}
        />}
      </div>)}
    </div>
  </div>;
});

export const openPreservedFilterPopup = async ({ fields, values, defaults, tr, direction, fontFamily }) => {
  const MySwal = withReactContent(Swal), ref = React.createRef();
  let draft = { ...values };
  const result = await MySwal.fire({
    background: "url(/bg_card.png)",
    html: <PopupFields ref={ref} fields={fields} initialValues={draft} defaults={defaults}
      onChange={(next) => { draft = next; }} tr={tr} direction={direction} fontFamily={fontFamily} />,
    focusConfirm: false, showCancelButton: true, showDenyButton: true,
    confirmButtonText: tr("Apply"), cancelButtonText: tr("Cancel"),
    denyButtonText: `&#8634; ${tr("Reset")}`, denyButtonColor: "#64748b",
    preDeny: () => { ref.current?.reset(); return false; }, preConfirm: () => draft,
  });
  return result.isConfirmed ? result.value : null;
};
