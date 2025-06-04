import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { columns, ClassSectionButtons } from '../../utils/ClassSectionHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'

const List = () => {
  const [classSections, setClassSections] = useState([])
  const [schLoading, setSchLoading] = useState(false)
  const [filteredClassSection, setFilteredClassSections] = useState(null)

  useEffect(() => {

    const onClassSectionDelete = () => {
      fetchClassSections()
    }

    const fetchClassSections = async () => {
      setSchLoading(true)
      try {
        const responnse = await axios.get(
          "https://unis-server.vercel.app/api/classSection",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          let sno = 1;
          const data = await responnse.data.classSections.map((sch) => ({
            _id: sch._id,
            sno: sno++,
            classs: sch.classs,
            section: sch.section,
            action: (<ClassSectionButtons Id={sch._id} onClassSectionDelete={onClassSectionDelete} />),
          }));
          setClassSections(data);
          setFilteredClassSections(data)
        }
      } catch (error) {
        console.log(error.message)
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error)
          navigate("/dashboard");
        }
      } finally {
        setSchLoading(false)
      }
    };

    fetchClassSections();
  }, []);

  const handleFilter = (e) => {
    const records = classSections.filter((sch) => (
      sch.classs.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredClassSections(records)
  }

  if (!filteredClassSection) {
    return <div>Loading ...</div>
  }

  return (
    <div className='p-6'>
      <div className="text-center">
        <h3 className="text-2xl font-bold">Manage Class Section</h3>
      </div>
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search By Class"
          className="px-4 py-0.5 border"
          onChange={handleFilter}
        />
        <Link
          to="/dashboard/add-classSection"
          className="px-4 py-1 bg-teal-600 rounded text-white"
        >
          Add New Class Section
        </Link>
      </div>
      <div className='mt-6'>
        <DataTable columns={columns} data={filteredClassSection} pagination />
      </div>
    </div>
  )
}

export default List