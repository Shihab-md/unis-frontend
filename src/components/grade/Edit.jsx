import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaRegTimesCircle } from "react-icons/fa";
import { fetchGrade, updateGrade } from "../../api/gradeApi";
import { checkAuth, getPrcessing, getSpinner, handleRightClickAndFullScreen, showSwalAlert } from "../../utils/CommonHelper";
import GradeForm from "./GradeForm";

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [grade, setGrade] = useState(null);

  useEffect(() => {
    handleRightClickAndFullScreen();
    if (checkAuth("gradeEdit") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const data = await fetchGrade(id);
        setGrade(data.grade);
      } catch (error) {
        showSwalAlert("Error!", error?.response?.data?.error || error.message || "Load Grade failed.", "error");
        navigate("/dashboard/grades");
      }
    };
    load();
  }, [id, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setGrade((prev) => ({ ...prev, [name]: name === "grade" ? value.toUpperCase() : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setProcessing(true);
      const data = await updateGrade(id, grade);
      if (data.success) {
        showSwalAlert("Success!", data.message || "Grade updated.", "success");
        navigate("/dashboard/grades");
      }
    } catch (error) {
      showSwalAlert("Error!", error?.response?.data?.error || error.message || "Update Grade failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (processing) return getPrcessing();
  if (!grade) return getSpinner();

  return (
    <div className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <h2 className="text-sm lg:text-xl font-semibold">Update Grade Rule</h2>
        <Link to="/dashboard/grades"><FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md" /></Link>
      </div>
      <form onSubmit={handleSubmit} autoComplete="off">
        <GradeForm value={grade} onChange={handleChange} submitLabel="Update Grade" />
      </form>
    </div>
  );
};

export default Edit;
