import React from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { deleteGrade } from "../api/gradeApi";
import { getButtonStyle, showConfirmationSwalAlert, showSwalAlert } from "./CommonHelper";

export const gradeColumns = [
  { name: "S No", selector: (row) => row.sno, width: "70px" },
  { name: "Grade", selector: (row) => row.grade, sortable: true, width: "100px" },
  { name: "Min Mark %", selector: (row) => row.minMarkPercentage, sortable: true, width: "130px" },
  { name: "Min Attendance %", selector: (row) => row.minAttendancePercentage, sortable: true, width: "160px" },
  { name: "Conduct / Behaviour", selector: (row) => row.conduct || "Any", sortable: true, width: "190px" },
  { name: "Order", selector: (row) => row.displayOrder, sortable: true, width: "90px" },
  { name: "Status", selector: (row) => row.active, sortable: true, width: "120px" },
  { name: "Action", selector: (row) => row.action, center: true, minWidth: "170px" },
];

export const GradeButtons = ({ Id, onGradeDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = user?.role === "guest";

  const handleDelete = async () => {
    const result = await showConfirmationSwalAlert("Are you sure to Delete?", "", "question");
    if (!result.isConfirmed) return;

    try {
      const data = await deleteGrade(Id);
      if (data.success) {
        showSwalAlert("Success!", data.message || "Grade deleted.", "success");
        onGradeDelete?.();
      }
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Delete Grade failed.", "error");
    }
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <button className={getButtonStyle("View")} title="View Grade" aria-label="View Grade" onClick={() => navigate(`/dashboard/grades/${Id}`)}>
        <FaEye className="m-1" />
      </button>
      <button className={getButtonStyle("Edit")} title="Edit Grade" aria-label="Edit Grade" disabled={isGuest} onClick={() => navigate(`/dashboard/grades/edit/${Id}`)}>
        <FaEdit className="m-1" />
      </button>
      <button className={getButtonStyle("Delete")} title="Delete Grade" aria-label="Delete Grade" disabled={isGuest} onClick={handleDelete}>
        <FaTrashAlt className="m-1" />
      </button>
    </div>
  );
};
