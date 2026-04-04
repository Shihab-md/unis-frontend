import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { columns, CourseButtons, CourseCard } from '../../utils/CourseHelper';
import DataTable from 'react-data-table-component';
import {
  getBaseUrl,
  handleRightClickAndFullScreen,
  getSpinner,
  checkAuth,
  LinkIcon,
  showSwalAlert
} from '../../utils/CommonHelper';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../../context/AuthContext';

const List = () => {
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [courses, setCourses] = useState([]);
  const [supLoading, setSupLoading] = useState(false);
  const [filterCourseType, setFilterCourseType] = useState("");
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();
  const MySwal = withReactContent(Swal);

  const fetchCourses = async () => {
    setSupLoading(true);
    try {
      const responnse = await axios.get(
        (await getBaseUrl()).toString() + "course",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (responnse.data.success) {
        let sno = 1;
        const data = responnse.data.courses.map((sup) => ({
          _id: sup._id,
          sno: sno++,
          code: sup.code,
          name: sup.name,
          type: sup.type,
          remarks: sup.remarks,
          fees: sup.fees,
          years: sup.years,
          promotionOrder: sup.promotionOrder,
          subjectsCount: sup._subjectsCount ? sup._subjectsCount : 0,
          action: (
            <CourseButtons
              Id={sup._id}
              onCourseDelete={fetchCourses}
            />
          ),
        }));

        setCourses(data);
      }
    } catch (error) {
      console.log(error.message);
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
        navigate("/dashboard/masters");
      }
    } finally {
      setSupLoading(false);
    }
  };

  useEffect(() => {
    if (checkAuth("coursesList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }

    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const courseType = String(filterCourseType || "").trim().toLowerCase();
    const search = String(searchText || "").trim().toLowerCase();

    return (courses || []).filter((row) => {
      const rowCode = String(row?.code || "").toLowerCase();
      const rowName = String(row?.name || "").toLowerCase();
      const rowType = String(row?.type || "").toLowerCase();
      const rowRemarks = String(row?.remarks || "").toLowerCase();

      const matchesSearch =
        !search ||
        rowCode.includes(search) ||
        rowName.includes(search) ||
        rowType.includes(search) ||
        rowRemarks.includes(search);

      const matchesCourseType =
        !courseType || rowType === courseType.toLowerCase();

      return matchesSearch && matchesCourseType;
    });
  }, [courses, searchText, filterCourseType]);

  const openFilterPopup = async () => {
    const result = await MySwal.fire({
      background: "url(/bg_card.png)",
      html: (
        <div className="mb-2 w-full">
          <div className="text-xl font-bold mb-5 text-green-600 text-center">
            Filter
          </div>

          <div className="grid grid-cols-1 md:grid-cols-8 mt-5 p-7 items-center gap-2">
            <span className="lg:col-span-1"></span>

            <span className="lg:col-span-2 text-sm mb-1 text-start text-blue-500">
              Course Type
            </span>

            <select
              id="swal-course-type"
              defaultValue={filterCourseType || ""}
              className="lg:col-span-4 w-full rounded border p-2 text-sm"
            >
              <option value="">All</option>
              <option value="Deeniyath Education">Deeniyath Education</option>
              <option value="Islamic Home Science">Islamic Home Science</option>
              <option value="School Education">School Education</option>
              <option value="College Education">College Education</option>
              <option value="Vocational Courses">Vocational Courses</option>
              <option value="Teacher Training">Teacher Training</option>
            </select>

            <span className="lg:col-span-1"></span>
          </div>
        </div>
      ),
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Apply",
      denyButtonText: "Clear",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const selectedCourseType =
          document.getElementById("swal-course-type")?.value || "";

        return selectedCourseType;
      },
    });

    if (result.isConfirmed) {
      setFilterCourseType(result.value || "");
    } else if (result.isDenied) {
      setFilterCourseType("");
    }
  };

  if (supLoading) {
    return getSpinner();
  }

  return (
    <div className="p-3 lg:p-5 bg-repeat mt-1 lg:mt-5">
      <div className="text-center">
        <h3 className="text-base lg:text-2xl font-bold px-5 py-0 text-gray-600">
          Manage Courses
          <p className="flex md:grid text-sm md:text-base justify-center text-rose-700">
            (Records Count : {filteredCourses.length})
          </p>
        </h3>
      </div>

      <div className="flex justify-between items-center mt-5">
        {LinkIcon("/dashboard/masters", "Back")}

        <div className="w-3/4 lg:w-1/2 rounded flex lg:border shadow-lg rounded-md justify-between items-center relative lg:bg-[url(/bg-img.jpg)]">
          <div className="w-full text-md flex justify-center items-center pl-2 rounded-l-md">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-3 py-0.5 border rounded shadow-md justify-center ml-1 lg:ml-0 mr-3 lg:mr-0"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="hidden lg:block p-1 mt-0.5 rounded-md items-center justify-center">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        {user.role === "superadmin" || user.role === "hquser" ? (
          <div className="mr-3 flex items-center gap-2">
            {filterCourseType ? (
              <span className="hidden md:inline-flex max-w-[220px] truncate rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 border border-sky-200">
                Course Type: {filterCourseType}
              </span>
            ) : null}

            <div
              className="shrink-0"
              onClick={openFilterPopup}
            >
              {LinkIcon("#", "Filter")}
            </div>
          </div>
        ) : null}

        {LinkIcon("/dashboard/add-course", "Add")}
      </div>

      <>
        {/* Mobile / Tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 lg:hidden">
          {filteredCourses.map((row) => (
            <CourseCard
              key={row._id}
              row={row}
              onCourseDelete={fetchCourses}
            />
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden lg:block mt-5">
          <DataTable
            columns={columns}
            data={filteredCourses}
            highlightOnHover
            striped
            responsive
          />
        </div>
      </>
    </div>
  );
};

export default List;