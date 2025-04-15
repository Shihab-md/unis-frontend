import React from 'react'

const SummaryCard = ({icon, text, number, color}) => {
  return (
    <div className="rounded flex bg-white border shadow">
        <div className={`text-3xl flex justify-center items-center ${color} text-gray px-2`}>
            {icon}
        </div>
        <div className="pl-2 py-1">
            <p className="font-semibold">{text}</p>
            <p className="font-bold text-gray-500">{number}</p>
        </div>
    </div>
  )
}
export default SummaryCard