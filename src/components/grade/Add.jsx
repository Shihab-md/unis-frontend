import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegTimesCircle } from "react-icons/fa";
import { createGrade } from "../../api/gradeApi";
import { checkAuth, getPrcessing, handleRightClickAndFullScreen, showSwalAlert } from "../../utils/CommonHelper";
import GradeForm from "./GradeForm";

const initialGrade = {
  grade: "",
  minMarkPercentage: "",
  minAttendancePercentage: "",
  conduct: "",
  displayOrder: "",
  active: "Active",
  remarks: "",
};

const Add = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [grade, setGrade] = useState(initialGrade);

  useEffect(() => {
    handleRightClickAndFullScreen();
    if (checkAuth("gradeAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setGrade((prev) => ({ ...prev, [name]: name === "grade" ? value.toUpperCase() : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setProcessing(true);
      const data = await createGrade(grade);
      if (data.success) {
        showSwalAlert("Success!", data.message || "Grade added.", "success");
        navigate("/dashboard/grades");
      }
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Add Grade failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (processing) return getPrcessing();

  return (
    <div className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <h2 className="text-sm lg:text-xl font-semibold">Enter Grade Rule</h2>
        <Link to="/dashboard/grades"><FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md" /></Link>
      </div>
      <form onSubmit={handleSubmit} autoComplete="off">
        <GradeForm value={grade} onChange={handleChange} submitLabel="Add Grade" />
      </form>
    </div>
  );
};

export default Add;
