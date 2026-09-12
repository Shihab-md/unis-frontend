import React from 'react'
import { AutoText, useLanguage } from '../../i18n/LanguageContext'

const ViewCard = ({ type, text }) => {
  const { tr, direction, fontFamily } = useLanguage();
  const translatedText = type === "title" || type === "header" ? tr(text) : text;

  if (type === "title") {
    return (
      <AutoText
        text={translatedText}
        className="border p-2 font-bold text-gray-500 bg-violet-100"
      />
    )

  } else if (type === "data") {
    return (<div className="border p-2 text-sm" dir="auto">{text ? text : "-"}</div>)

  } else if (type === "dataArabic") {
    return (<div className='border p-2 font-["Noto_Naskh_Arabic"] text-lg' dir="rtl">{text ? text : '-'}</div>)

  } else if (type === "header") {
    return (
      <AutoText
        text={translatedText}
        variant="button"
        className="flex mb-1 justify-center font-medium border border-blue-300 shadow-lg p-2 text-blue-600 text-shadow-lg bg-blue-100 rounded-md"
        style={{ fontFamily }}
        dir={direction}
      />
    )
  }

  return null;
}
export default ViewCard
