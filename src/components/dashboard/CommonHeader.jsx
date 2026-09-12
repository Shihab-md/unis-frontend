import React from 'react'
import { AutoText, useLanguage } from '../../i18n/LanguageContext'

export default function CommonHeader({
  userName = "",
  title = "",
  arabicText = "إيمان : تقوى : حياء : أخلاق : دعاء : دعوة",
}) {
  const { t, direction, fontFamily } = useLanguage();

  return (
    <div className="text-center" dir={direction} style={{ fontFamily }}>
      <h5 className='p-1 font-semibold text-lg lg:text-2xl text-gray-600 mt-1 lg:mt-10 drop-shadow-lg font-["Noto_Naskh_Arabic"]' dir="rtl">
        {arabicText}
      </h5>
      <AutoText
        as="h5"
        text={t("common.welcome", { name: userName })}
        className="p-1 mt-1 lg:mt-3 text-gray-600 drop-shadow-lg font-medium"
      />
      {title ? (
        <AutoText
          as="h5"
          text={title}
          variant="heading"
          className="mt-1 lg:mt-3 mb-2 font-bold capitalize text-green-600 drop-shadow-lg"
        />
      ) : null}
    </div>
  );
}
