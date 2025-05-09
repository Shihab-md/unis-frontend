import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoutes from "./utils/RoleBaseRoutes";
import AdminSummary from "./components/dashboard/AdminSummary";

import Setting from "./components/dashboard/Setting";

import DepartmentList from "./components/department/DepartmentList";
import AddDepartment from "./components/department/AddDepartment";
import EditDepartment from "./components/department/EditDepartment";

import SupervisorList from "./components/supervisor/List";
import SupervisorAdd from "./components/supervisor/Add";
import SupervisorView from "./components/supervisor/View";
import SupervisorEdit from "./components/supervisor/Edit";

import SchoolList from "./components/school/List";
import SchoolAdd from "./components/school/Add";
import SchoolView from "./components/school/View";
import SchoolEdit from "./components/school/Edit";

import ClassSectionList from "./components/classSection/List";
import ClassSectionAdd from "./components/classSection/Add";
import ClassSectionView from "./components/classSection/View";
import ClassSectionEdit from "./components/classSection/Edit";

import List from "./components/employee/List";
import Add from "./components/employee/Add";
import View from "./components/employee/View";
import Edit from "./components/employee/Edit";

import StudentList from "./components/student/List";
import StudentAdd from "./components/student/Add";
import StudentView from "./components/student/View";
import StudentEdit from "./components/student/Edit";

import InstituteList from "./components/institute/List";
import InstituteAdd from "./components/institute/Add";
import InstituteView from "./components/institute/View";
import InstituteEdit from "./components/institute/Edit";

import CourseList from "./components/course/List";
import CourseAdd from "./components/course/Add";
import CourseView from "./components/course/View";
import CourseEdit from "./components/course/Edit";

import AcademicYearList from "./components/academicYear/List";
import AcademicYearAdd from "./components/academicYear/Add";
import AcademicYearView from "./components/academicYear/View";
import AcademicYearEdit from "./components/academicYear/Edit";

import TemplateList from "./components/template/List";
import TemplateAdd from "./components/template/Add";
import TemplateView from "./components/template/View";
import TemplateEdit from "./components/template/Edit";

import CertificateCreate from "./components/certificate/Create";

import AddSalary from "./components/salary/Add";
import ViewSalary from "./components/salary/View";
import Summary from './components/EmployeeDashboard/Summary'
import LeaveList from './components/leave/List'
import AddLeave from './components/leave/Add'

import Table from "./components/leave/Table";
import Detail from "./components/leave/Detail";
import Attendance from "./components/attendance/Attendance";
import AttendanceReport from "./components/attendance/AttendanceReport";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin-dashboard" />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["admin"]}>
                <AdminDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<AdminSummary />}></Route>

          <Route
            path="/admin-dashboard/departments"
            element={<DepartmentList />}
          ></Route>
          <Route
            path="/admin-dashboard/add-department"
            element={<AddDepartment />}
          ></Route>
          <Route
            path="/admin-dashboard/department/:id"
            element={<EditDepartment />}
          ></Route>

          <Route path="/admin-dashboard/supervisors" element={<SupervisorList />}></Route>
          <Route path="/admin-dashboard/add-supervisor" element={<SupervisorAdd />}></Route>
          <Route path="/admin-dashboard/supervisors/:id" element={<SupervisorView />}></Route>
          <Route path="/admin-dashboard/supervisors/edit/:id" element={<SupervisorEdit />}></Route>

          <Route path="/admin-dashboard/schools" element={<SchoolList />}></Route>
          <Route path="/admin-dashboard/add-school" element={<SchoolAdd />}></Route>
          <Route path="/admin-dashboard/schools/:id" element={<SchoolView />}></Route>
          <Route path="/admin-dashboard/schools/edit/:id" element={<SchoolEdit />}></Route>

          <Route path="/admin-dashboard/classSections" element={<ClassSectionList />}></Route>
          <Route path="/admin-dashboard/add-classSection" element={<ClassSectionAdd />}></Route>
          <Route path="/admin-dashboard/classSections/:id" element={<ClassSectionView />}></Route>
          <Route path="/admin-dashboard/classSections/edit/:id" element={<ClassSectionEdit />}></Route>

          <Route path="/admin-dashboard/employees" element={<List />}></Route>
          <Route path="/admin-dashboard/add-employee" element={<Add />}></Route>
          <Route path="/admin-dashboard/employees/:id" element={<View />}></Route>
          <Route path="/admin-dashboard/employees/edit/:id" element={<Edit />}></Route>
          <Route
            path="/admin-dashboard/employees/salary/:id"
            element={<ViewSalary />}
          ></Route>

          <Route path="/admin-dashboard/students" element={<StudentList />}></Route>
          <Route path="/admin-dashboard/add-student" element={<StudentAdd />}></Route>
          <Route path="/admin-dashboard/students/:id" element={<StudentView />}></Route>
          <Route path="/admin-dashboard/students/edit/:id" element={<StudentEdit />}></Route>

          <Route path="/admin-dashboard/institutes" element={<InstituteList />}></Route>
          <Route path="/admin-dashboard/add-institute" element={<InstituteAdd />}></Route>
          <Route path="/admin-dashboard/institutes/:id" element={<InstituteView />}></Route>
          <Route path="/admin-dashboard/institutes/edit/:id" element={<InstituteEdit />}></Route>

          <Route path="/admin-dashboard/courses" element={<CourseList />}></Route>
          <Route path="/admin-dashboard/add-course" element={<CourseAdd />}></Route>
          <Route path="/admin-dashboard/courses/:id" element={<CourseView />}></Route>
          <Route path="/admin-dashboard/courses/edit/:id" element={<CourseEdit />}></Route>

          <Route path="/admin-dashboard/templates" element={<TemplateList />}></Route>
          <Route path="/admin-dashboard/add-template" element={<TemplateAdd />}></Route>
          <Route path="/admin-dashboard/templates/:id" element={<TemplateView />}></Route>
          <Route path="/admin-dashboard/templates/edit/:id" element={<TemplateEdit />}></Route>

          <Route path="/admin-dashboard/certificates" element={<CertificateCreate />}></Route>

          <Route path="/admin-dashboard/academicYears" element={<AcademicYearList />}></Route>
          <Route path="/admin-dashboard/add-academicYear" element={<AcademicYearAdd />}></Route>
          <Route path="/admin-dashboard/academicYears/:id" element={<AcademicYearView />}></Route>
          <Route path="/admin-dashboard/academicYears/edit/:id" element={<AcademicYearEdit />}></Route>

          <Route path="/admin-dashboard/settings" element={<Setting />}></Route>

          <Route
            path="/admin-dashboard/salary/add"
            element={<AddSalary />}
          ></Route>
          <Route path="/admin-dashboard/leaves" element={<Table />}></Route>
          <Route path="/admin-dashboard/leaves/:id" element={<Detail />}></Route>
          <Route path="/admin-dashboard/employees/leaves/:id" element={<LeaveList />}></Route>

          
          <Route path="/admin-dashboard/attendance" element={<Attendance />}></Route>
          <Route path="/admin-dashboard/attendance-report" element={<AttendanceReport />}></Route>
        </Route>
        <Route
          path="/employee-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["admin", "employee"]}>
                <EmployeeDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<Summary />}></Route>

          <Route path="/employee-dashboard/profile/:id" element={<View />}></Route>
          <Route path="/employee-dashboard/leaves/:id" element={<LeaveList />}></Route>
          <Route path="/employee-dashboard/add-leave" element={<AddLeave />}></Route>
          <Route path="/employee-dashboard/salary/:id" element={<ViewSalary />}></Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
