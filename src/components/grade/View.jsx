import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaRegTimesCircle } from "react-icons/fa";
import { fetchGrade } from "../../api/gradeApi";
import ViewCard from "../dashboard/ViewCard";
import { checkAuth, getSpinner, handleRightClickAndFullScreen, showSwalAlert } from "../../utils/CommonHelper";

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grade, setGrade] = useState(null);

  useEffect(() => {
    handleRightClickAndFullScreen();
    if (checkAuth("gradeView") === "NO") {
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

  if (!grade) return getSpinner();

  return (
    <div className="max-w-3xl mx-auto mt-2 p-8 shadow-lg border">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <h2 className="text-sm lg:text-xl font-semibold">Grade Rule Details</h2>
        <Link to="/dashboard/grades"><FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md" /></Link>
      </div>
      <div className="py-3 px-4 border mt-5 rounded-lg shadow-lg bg-white">
        <ViewCard type="title" text="Grade" /><ViewCard type="data" text={grade.grade} />
        <ViewCard type="title" text="Minimum Mark %" /><ViewCard type="data" text={`${grade.minMarkPercentage}%`} />
        <ViewCard type="title" text="Minimum Attendance %" /><ViewCard type="data" text={`${grade.minAttendancePercentage}%`} />
        <ViewCard type="title" text="Conduct / Behaviour" /><ViewCard type="data" text={grade.conduct || "Any (not restricted)"} />
        <ViewCard type="title" text="Evaluation Order" /><ViewCard type="data" text={grade.displayOrder} />
        <ViewCard type="title" text="Status" /><ViewCard type="data" text={grade.active} />
        <ViewCard type="title" text="Remarks" /><ViewCard type="data" text={grade.remarks || "-"} />
      </div>
      <button className="w-full mt-5 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg" onClick={() => navigate("/dashboard/grades")}>Back</button>
    </div>
  );
};

export default View;
