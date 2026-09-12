import React from 'react'
import { AutoText, useLanguage } from '../../i18n/LanguageContext'

const SummaryCard = ({ icon, text, number, color, isCount }) => {
  const { isRtl } = useLanguage();

  return (
    <div className="flex min-h-[58px] rounded-lg bg-white border shadow-lg hover:bg-blue-50 hover:-translate-y-0.5">
      <div className={`text-2xl flex justify-center items-center ${color} text-gray-100 px-2 ${isRtl ? "rounded-r-lg" : "rounded-l-lg"}`}>
        {icon}
      </div>
      <div className={`min-w-0 flex-1 py-1 rounded-r-lg ${isRtl ? "pr-2 pl-1 text-right" : "pl-2 pr-1 text-left"}`}>
        <AutoText as="p" text={text} className="font-semibold text-slate-800" />
        {!isCount ?
          <p className="font-bold text-gray-500" dir="ltr">{number}</p>
          : null}
      </div>
    </div>
  )
}
export default SummaryCard
