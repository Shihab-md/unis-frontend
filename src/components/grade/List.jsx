import React, { useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { fetchGrades } from "../../api/gradeApi";
import { GradeButtons, gradeColumns } from "../../utils/GradeHelper";
import {
  LinkIcon,
  checkAuth,
  getSpinner,
  handleRightClickAndFullScreen,
  showSwalAlert,
} from "../../utils/CommonHelper";

const List = () => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState(null);

  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const loadGrades = useCallback(async () => {
    try {
      const data = await fetchGrades();
      const rows = (Array.isArray(data.grades) ? data.grades : []).map((grade, index) => ({
        ...grade,
        sno: index + 1,
        action: <GradeButtons Id={grade._id} onGradeDelete={loadGrades} />,
      }));
      setGrades(rows);
      setFilteredGrades(rows);
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Load Grades failed.", "error");
      navigate("/dashboard/masters");
    }
  }, [navigate]);

  useEffect(() => {
    if (checkAuth("gradesList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }
    loadGrades();
  }, [loadGrades, navigate]);

  const handleFilter = (event) => {
    const value = event.target.value.toLowerCase();
    setFilteredGrades(
      grades.filter((row) =>
        [row.grade, row.conduct, row.active, row.remarks, row.minMarkPercentage, row.minAttendancePercentage, row.displayOrder]
          .some((item) => String(item ?? "").toLowerCase().includes(value))
      )
    );
  };

  if (!filteredGrades) return getSpinner();

  return (
    <div className="p-3 lg:p-5 bg-repeat mt-3 lg:mt-5">
      <div className="text-center">
        <h3 className="text-base lg:text-2xl font-bold px-5 py-0 text-gray-600">
          Manage Grades
          <p className="flex md:grid text-sm md:text-base justify-center text-rose-700">
            (Records Count : {filteredGrades.length})
          </p>
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Rules are checked by Order. A student must meet both minimum Mark % and minimum Attendance %. Conduct / Behaviour is optional; blank means any conduct.
        </p>
      </div>

      <div className="flex justify-between items-center mt-5 gap-2">
        {LinkIcon("/dashboard/masters", "Back")}
        <div className="w-3/4 lg:w-1/2 rounded-md flex border shadow-lg justify-between items-center bg-[url(/bg-img.jpg)]">
          <input type="text" placeholder="Search" className="w-full px-3 py-1 border rounded-md shadow-md" onChange={handleFilter} />
        </div>
        {LinkIcon("/dashboard/add-grade", "Add")}
      </div>

      <div className="mt-6 rounded-lg shadow-lg">
        <DataTable columns={gradeColumns} data={filteredGrades} pagination responsive highlightOnHover striped />
      </div>
    </div>
  );
};

export default List;
