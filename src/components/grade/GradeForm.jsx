import React from "react";

const GradeForm = ({ value, onChange, submitLabel }) => (
  <>
    <div className="py-3 px-4 border mt-5 mb-3 rounded-lg shadow-lg bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block mt-2 text-sm font-medium text-slate-500">Grade <span className="text-red-700">*</span></label>
          <input type="text" name="grade" value={value.grade} onChange={onChange} maxLength={20} className="mt-1 p-2 block w-full border border-gray-300 rounded-md uppercase" placeholder="A+" required />
        </div>
        <div>
          <label className="block mt-2 text-sm font-medium text-slate-500">Minimum Mark % <span className="text-red-700">*</span></label>
          <input type="number" name="minMarkPercentage" value={value.minMarkPercentage} onChange={onChange} min="0" max="100" step="0.01" className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block mt-2 text-sm font-medium text-slate-500">Minimum Attendance % <span className="text-red-700">*</span></label>
          <input type="number" name="minAttendancePercentage" value={value.minAttendancePercentage} onChange={onChange} min="0" max="100" step="0.01" className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block mt-2 text-sm font-medium text-slate-500">Conduct / Behaviour</label>
          <input type="text" name="conduct" value={value.conduct} onChange={onChange} maxLength={80} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" placeholder="Optional - e.g. Excellent" />
          <p className="mt-1 text-[11px] text-slate-400">Leave blank when conduct should not restrict this grade.</p>
        </div>
        <div>
          <label className="block mt-2 text-sm font-medium text-slate-500">Evaluation Order <span className="text-red-700">*</span></label>
          <input type="number" name="displayOrder" value={value.displayOrder} onChange={onChange} min="1" max="999" step="1" className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required />
          <p className="mt-1 text-[11px] text-slate-400">1 is checked first, then 2, 3, and so on.</p>
        </div>
        <div>
          <label className="block mt-2 text-sm font-medium text-slate-500">Status <span className="text-red-700">*</span></label>
          <select name="active" value={value.active} onChange={onChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required>
            <option value="Active">Active</option>
            <option value="In-Active">In-Active</option>
          </select>
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block mt-2 text-sm font-medium text-slate-500">Remarks</label>
          <input type="text" name="remarks" value={value.remarks} onChange={onChange} maxLength={250} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" placeholder="Optional" />
        </div>
      </div>
    </div>
    <button type="submit" className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5">
      {submitLabel}
    </button>
  </>
);

export default GradeForm;
