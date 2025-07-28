import React from 'react'

const ViewCard = ({ type, text }) => {

  if (type === "title") {
    return (<div className="border p-2 text-xs font-bold text-gray-500 bg-violet-100">{text}</div>)

  } else if (type === "data") {
    return (<div className="border p-2 text-sm">{text ? text : "-"}</div>)

  } else if (type === "header") {
    return (<div className="flex space-x-3 mb-1 justify-center font-medium border border-blue-300
      shadow-lg p-2 text-blue-600 text-shadow-lg bg-blue-100 rounded-md">{text}</div>)
  }
}
export default ViewCard