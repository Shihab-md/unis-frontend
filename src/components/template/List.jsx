import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, TemplateButtons } from '../../utils/TemplateHelper'
import { getBaseUrl, handleRightClick, getSpinner, checkAuth, getBackIcon, getAddIcon } from '../../utils/CommonHelper';
import DataTable from 'react-data-table-component'
import axios from 'axios'
import Swal from 'sweetalert2';

const List = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  // For FULL screen view
  document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });

  const [templates, setTemplates] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredTemplate, setFilteredTemplates] = useState(null)
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("templatesList") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const onTemplateDelete = () => {
      fetchTemplates()
    }

    const fetchTemplates = async () => {
      setSupLoading(true)
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + "template",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.templates.map((sup) => ({
            _id: sup._id,
            sno: sno++,
            code: sup.courseId.name,
            details: sup.details,
            action: (<TemplateButtons Id={sup._id} onTemplateDelete={onTemplateDelete} />),
          }));
          setTemplates(data);
          setFilteredTemplates(data)
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

    fetchTemplates();
  }, []);

  const handleFilter = (e) => {
    const records = templates.filter((sup) => (
      sup.code.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredTemplates(records)
  }

  if (!filteredTemplate) {
    return getSpinner();
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-shadow-lg">Manage Templates</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {getBackIcon("/dashboard")}
        <input
          type="text"
          placeholder="Seach By Course"
          className="px-4 py-0.5 border rounded shadow-lg"
          onChange={handleFilter}
        />
        {getAddIcon("/dashboard/add-template")}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredTemplate} pagination />
      </div>
    </div>
  )
}

export default List