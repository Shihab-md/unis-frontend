import React from 'react'

export default function CommonHeader({
  userName = "",
  title = "",
  arabicText = "إيمان : تقوى : حياء : أخلاق : دعاء : دعوة",
}) {
  return (
    <div className="text-center">
      <h5 className='p-1 font-semibold text-lg lg:text-2xl text-gray-600 mt-1 lg:mt-10 drop-shadow-lg font-["Noto_Naskh_Arabic"]'>
        {arabicText}
      </h5>
      <h5 className="p-1 mt-1 lg:mt-3 text-gray-600 drop-shadow-lg text-sm lg:text-base">
        Welcome, {userName}
      </h5>
      {title ? (
        <h5 className="text-xl mt-1 lg:mt-3 mb-2 font-bold capitalize text-green-600 drop-shadow-lg">
          {title}
        </h5>
      ) : null}
    </div>
  );
}