import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { columns, TemplateButtons } from '../../utils/TemplateHelper'
import { getBaseUrl } from '../../utils/CommonHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import {
  FaPlusSquare, FaArrowAltCircleLeft
} from "react-icons/fa";

const List = () => {
  const [templates, setTemplates] = useState([])
  const [supLoading, setSupLoading] = useState(false)
  const [filteredTemplate, setFilteredTemplates] = useState(null)
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {

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
            code: sup.code,
            details: sup.details,
            action: (<TemplateButtons Id={sup._id} onTemplateDelete={onTemplateDelete} />),
          }));
          setTemplates(data);
          setFilteredTemplates(data)
        }
      } catch (error) {
        console.log(error.message)
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error)
          navigate('/login')
        }
      } finally {
        setSupLoading(false)
      }
    };

    fetchTemplates();
  }, []);

  const handleFilter = (e) => {
    const records = templates.filter((sup) => (
      sup.name.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredTemplates(records)
  }

  if (!filteredTemplate) {
    return <div>Loading ...</div>
  }

  return (
    <div className="mt-3 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold px-5 py-0 text-shadow-lg">Manage Templates</h3>
      </div>
      <div className="flex justify-between items-center mt-5">
        <Link to="/admin-dashboard" >
          <FaArrowAltCircleLeft className="text-2xl bg-blue-700 text-white rounded shadow-lg" />
        </Link>
        <input
          type="text"
          placeholder="Seach By Template Code"
          className="px-4 py-0.5 border rounded shadow-lg"
          onChange={handleFilter}
        />
        <Link to="/admin-dashboard/add-template" >
          <FaPlusSquare className="text-2xl bg-teal-700 text-white rounded shadow-lg" />
        </Link>
      </div>
      <div className='mt-6 rounded-lg shadow-lg'>
        <DataTable columns={columns} data={filteredTemplate} pagination />
      </div>
    </div>
  )
}

export default List