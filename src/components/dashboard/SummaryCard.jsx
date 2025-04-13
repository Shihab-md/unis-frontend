import React from 'react'

const SummaryCard = ({icon, text, number, color}) => {
  return (
    <div className="rounded flex bg-white border">
        <div className={`text-3xl flex justify-center items-center ${color} text-white px-3`}>
            {icon}
        </div>
        <div className="pl-3 py-1">
            <p className="font-semibold">{text}</p>
            <p className="font-bold text-gray-500">{number}</p>
        </div>
    </div>
  )
}
export default SummaryCard