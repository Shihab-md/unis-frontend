import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, CertificateButtons } from '../../utils/CertificateHelper'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon } from '../../utils/CommonHelper';
import DataTable from 'react-data-table-component'
import axios from 'axios'
import Swal from 'sweetalert2';

const List = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [certificates, setCertificates] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredCertificate, setFilteredCertificates] = useState(null)
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("certificatesList") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const onCertificateDelete = () => {
      fetchCertificates()
    }

    const fetchCertificates = async () => {
      setSupLoading(true)
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "certificate",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.certificates.map((sup) => ({
            _id: sup._id,
            sno: sno++,
            sanadhNo: sup.code,
            studentName: sup.userId.name,
            rollNumber: sup.studentId.rollNumber,
            sanadhName: sup.courseId.name,
            niswanCode: sup.schoolId.code,
            niswanName: sup.schoolId.nameEnglish,
            action: (<CertificateButtons Id={sup._id} onCertificateDelete={onCertificateDelete} />),
          }));
          setCertificates(data);
          setFilteredCertificates(data)
        }
      } catch (error) {
        console.log(error.message)
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');
          navigate("/dashboard");
        }
      } finally {
        setSupLoading(false)
      }
    };

    fetchCertificates();
  }, []);

  const handleFilter = (e) => {
    const records = certificates.filter((sup) => (
      sup.sanadhNo.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredCertificates(records)
  }

  if (!filteredCertificate) {
    return getSpinner();
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-shadow-lg">Manage Certificates</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {LinkIcon("/dashboard", "Back")}
        <input
          type="text"
          placeholder="Search By Sanadh No."
          className="px-4 py-0.5 border rounded shadow-lg"
          onChange={handleFilter}
        />
        {LinkIcon("/dashboard/add-certificate", "Add")}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredCertificate} pagination />
      </div>
    </div>
  )
}

export default List