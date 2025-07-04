import React from 'react'

const ViewCard = ({ type, text }) => {

  if (type === "title") {
    return (<div className="border p-2 font-medium bg-violet-100">{text}</div>)

  } else if (type === "data") {
    return (<div className="border p-2">{text ? text : "-"}</div>)

  } else if (type === "header") {
    return (<div className="flex space-x-3 mb-1 justify-center font-medium border  
      p-2 text-white text-shadow-lg bg-purple-500 rounded-md">{text}</div>)
  }
}
export default ViewCard