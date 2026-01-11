import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoutes from "./utils/RoleBaseRoutes";
import AdminSummary from "./components/dashboard/AdminSummary";
import Masters from "./components/dashboard/Masters";
import ChangePassword from "./components/dashboard/ChangePassword";

import SupervisorList from "./components/supervisor/List";
import SupervisorAdd from "./components/supervisor/Add";
import SupervisorView from "./components/supervisor/View";
import SupervisorEdit from "./components/supervisor/Edit";

import SchoolList from "./components/school/List";
import SchoolAdd from "./components/school/Add";
import SchoolView from "./components/school/View";
import SchoolEdit from "./components/school/Edit";

import List from "./components/employee/List";
import Add from "./components/employee/Add";
import View from "./components/employee/View";
import Edit from "./components/employee/Edit";

import StudentList from "./components/student/List";
import StudentAdd from "./components/student/Add";
import StudentView from "./components/student/View";
import StudentEdit from "./components/student/Edit";
import StudentPromote from "./components/student/Promote";

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

import CertificateList from "./components/certificate/List";
import CertificateAdd from "./components/certificate/Add";
import CertificateView from "./components/certificate/View";

import DistrictStateList from "./components/districtstate/List";
import DistrictStateAdd from "./components/districtstate/Add";
import DistrictStateView from "./components/districtstate/View";
import DistrictStateEdit from "./components/districtstate/Edit";

import ReportsHome from "./components/report/ReportsHome";

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
        <Route path="/" element={<Navigate to="/dashboard" />}></Route>
        <Route path="/login" element={<Login />}></Route>

        {/* <Route path="/" element={<Navigate to="/login" />}></Route>
        <Route path="/login" element={<Login />}></Route>*/}

        <Route path="/dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["admin"]}>
                <AdminDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<AdminSummary />}></Route>

          <Route path="/dashboard/supervisors" element={<SupervisorList />}></Route>
          <Route path="/dashboard/add-supervisor" element={<SupervisorAdd />}></Route>
          <Route path="/dashboard/supervisors/:id" element={<SupervisorView />}></Route>
          <Route path="/dashboard/supervisors/edit/:id" element={<SupervisorEdit />}></Route>

          <Route path="/dashboard/schools" element={<SchoolList />}></Route>
          <Route path="/dashboard/add-school" element={<SchoolAdd />}></Route>
          <Route path="/dashboard/schools/:id" element={<SchoolView />}></Route>
          <Route path="/dashboard/schools/edit/:id" element={<SchoolEdit />}></Route>

          <Route path="/dashboard/employees" element={<List />}></Route>
          <Route path="/dashboard/add-employee" element={<Add />}></Route>
          <Route path="/dashboard/employees/:id" element={<View />}></Route>
          <Route path="/dashboard/employees/edit/:id" element={<Edit />}></Route>

          <Route path="/dashboard/students" element={<StudentList />}></Route>
          <Route path="/dashboard/add-student" element={<StudentAdd />}></Route>
          <Route path="/dashboard/students/:id" element={<StudentView />}></Route>
          <Route path="/dashboard/students/edit/:id" element={<StudentEdit />}></Route>
          <Route path="/dashboard/students/promote/:id" element={<StudentPromote />}></Route>

          <Route path="/dashboard/institutes" element={<InstituteList />}></Route>
          <Route path="/dashboard/add-institute" element={<InstituteAdd />}></Route>
          <Route path="/dashboard/institutes/:id" element={<InstituteView />}></Route>
          <Route path="/dashboard/institutes/edit/:id" element={<InstituteEdit />}></Route>

          <Route path="/dashboard/courses" element={<CourseList />}></Route>
          <Route path="/dashboard/add-course" element={<CourseAdd />}></Route>
          <Route path="/dashboard/courses/:id" element={<CourseView />}></Route>
          <Route path="/dashboard/courses/edit/:id" element={<CourseEdit />}></Route>

          <Route path="/dashboard/templates" element={<TemplateList />}></Route>
          <Route path="/dashboard/add-template" element={<TemplateAdd />}></Route>
          <Route path="/dashboard/templates/:id" element={<TemplateView />}></Route>
          <Route path="/dashboard/templates/edit/:id" element={<TemplateEdit />}></Route>

          <Route path="/dashboard/certificates" element={<CertificateList />}></Route>
          <Route path="/dashboard/add-certificate" element={<CertificateAdd />}></Route>
          <Route path="/dashboard/certificates/:id" element={<CertificateView />}></Route>

          <Route path="/dashboard/academicYears" element={<AcademicYearList />}></Route>
          <Route path="/dashboard/add-academicYear" element={<AcademicYearAdd />}></Route>
          <Route path="/dashboard/academicYears/:id" element={<AcademicYearView />}></Route>
          <Route path="/dashboard/academicYears/edit/:id" element={<AcademicYearEdit />}></Route>

          <Route path="/dashboard/districtStates" element={<DistrictStateList />}></Route>
          <Route path="/dashboard/add-districtState" element={<DistrictStateAdd />}></Route>
          <Route path="/dashboard/districtStates/:id" element={<DistrictStateView />}></Route>
          <Route path="/dashboard/districtStates/edit/:id" element={<DistrictStateEdit />}></Route>

          <Route path="/dashboard/masters" element={<Masters />}></Route>
          <Route path="/dashboard/changePassword" element={<ChangePassword />}></Route>

          <Route path="/dashboard/reports" element={<ReportsHome />}></Route>

          {/* 

          <Route path="/dashboard/departments" element={<DepartmentList />}></Route>
          <Route path="/dashboard/add-department" element={<AddDepartment />}></Route>
          <Route path="/dashboard/department/:id" element={<EditDepartment />}></Route>

          <Route path="/dashboard/employees/salary/:id" element={<ViewSalary />}></Route>

          <Route path="/dashboard/salary/add" element={<AddSalary />}></Route>
          <Route path="/dashboard/leaves" element={<Table />}></Route>
          <Route path="/dashboard/leaves/:id" element={<Detail />}></Route>
          <Route path="/dashboard/employees/leaves/:id" element={<LeaveList />}></Route>

          
          <Route path="/dashboard/attendance" element={<Attendance />}></Route>
          <Route path="/dashboard/attendance-report" element={<AttendanceReport />}></Route> */}

        </Route>

        {/* <Route
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

        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
