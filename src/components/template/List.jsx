import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { columns, TemplateButtons } from '../../utils/TemplateHelper'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, LinkIcon, showSwalAlert } from '../../utils/CommonHelper';
import DataTable from 'react-data-table-component'
import axios from 'axios'

const List = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [templates, setTemplates] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredTemplate, setFilteredTemplates] = useState(null)
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("templatesList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
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
            code: sup.courseId?.code,
            name: sup.courseId?.name,
            details: sup.details,
            action: (<TemplateButtons Id={sup._id} onTemplateDelete={onTemplateDelete} />),
          }));
          setTemplates(data);
          setFilteredTemplates(data)
        }
      } catch (error) {
        console.log(error.message)
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/masters");
        }
      } finally {
        setSupLoading(false)
      }
    };

    fetchTemplates();
  }, []);

  const handleFilter = (e) => {
    const records = templates.filter((sup) => (
      sup.code?.toLowerCase().includes(e.target.value.toLowerCase())
      || sup.name?.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredTemplates(records)
  }

  if (!filteredTemplate) {
    return getSpinner();
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-shadow-lg text-gray-600">Manage Templates
          <p className='flex md:grid text-sm md:text-base justify-center text-rose-700'>
            (Records Count : {filteredTemplate ? filteredTemplate.length : 0}) </p>
        </h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        {LinkIcon("/dashboard/masters", "Back")}

        <div className="w-3/4 lg:w-1/2 rounded flex border shadow-lg rounded-md justify-between items-center relative bg-[url(/bg-img.jpg)]">
          <div className={`w-full text-md flex justify-center items-center pl-2 rounded-l-md`}>
            <input
              type="text"
              placeholder="Search"
              class="w-full px-3 py-0.5 border rounded shadow-md justify-center"
              onChange={handleFilter}
            />
          </div>
          <div className="p-1 mt-0.5 rounded-md items-center justify-center ">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        {LinkIcon("/dashboard/add-template", "Add")}
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredTemplate} pagination />
      </div>
    </div>
  )
}

export default List