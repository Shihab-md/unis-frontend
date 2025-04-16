import React from 'react'

const SummaryCard = ({icon, text, number, color}) => {
  return (
    <div className="rounded flex bg-white border shadow-lg rounded-lg hover:bg-blue-200">
        <div className={`text-2xl flex justify-center items-center ${color} text-gray-100 px-2 rounded-l-lg`}>
            {icon}
        </div>
        <div className="pl-2 py-1 rounded-r-lg">
            <p className="font-semibold">{text}</p>
            <p className="font-bold text-gray-500">{number}</p>
        </div>
    </div>
  )
}
export default SummaryCard