const languages = ["en", "ta", "ur", "ar", "ml", "kn", "te"];
const rows = [
  ["Student Promotion & Year-End Status", "மாணவர் வகுப்பு உயர்வு மற்றும் கல்வியாண்டு இறுதி நிலை", "طلبہ کی ترقی اور تعلیمی سال کے اختتام کی صورتحال", "ترفيع الطلاب وحالة نهاية العام الدراسي", "വിദ്യാർത്ഥി സ്ഥാനക്കയറ്റവും അധ്യയന വർഷാവസാന നിലയും", "ವಿದ್ಯಾರ್ಥಿಗಳ ಬಡ್ತಿ ಮತ್ತು ಶೈಕ್ಷಣಿಕ ವರ್ಷದ ಅಂತ್ಯದ ಸ್ಥಿತಿ", "విద్యార్థుల ప్రమోషన్ మరియు విద్యా సంవత్సరాంత స్థితి"],
  ["Current Academic Year", "தற்போதைய கல்வியாண்டு", "موجودہ تعلیمی سال", "العام الدراسي الحالي", "നിലവിലെ അധ്യയന വർഷം", "ಪ್ರಸ್ತುತ ಶೈಕ್ಷಣಿಕ ವರ್ಷ", "ప్రస్తుత విద్యా సంవత్సరం"],
  ["Next Academic Year", "அடுத்த கல்வியாண்டு", "اگلا تعلیمی سال", "العام الدراسي القادم", "അടുത്ത അധ്യയന വർഷം", "ಮುಂದಿನ ಶೈಕ್ಷಣಿಕ ವರ್ಷ", "తదుపరి విద్యా సంవత్సరం"],
  ["Fully Processed", "முழுமையாக முடிக்கப்பட்டது", "مکمل کارروائی", "تمت المعالجة بالكامل", "നടപടികൾ പൂർത്തിയായി", "ಪ್ರಕ್ರಿಯೆ ಪೂರ್ಣಗೊಂಡಿದೆ", "ప్రక్రియ పూర్తయింది"],
  ["Pending Students", "நிலுவையில் உள்ள மாணவர்கள்", "زیر التوا طلبہ", "الطلاب قيد الانتظار", "നടപടി ശേഷിക്കുന്ന വിദ്യാർത്ഥികൾ", "ಬಾಕಿ ಇರುವ ವಿದ್ಯಾರ್ಥಿಗಳು", "పెండింగ్‌లో ఉన్న విద్యార్థులు"],
  ["Needs Review", "சரிபார்ப்பு தேவை", "جائزہ درکار ہے", "تحتاج إلى مراجعة", "പരിശോധന ആവശ്യമാണ്", "ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ", "సమీక్ష అవసరం"],
  ["No Students", "மாணவர்கள் இல்லை", "کوئی طالب علم نہیں", "لا يوجد طلاب", "വിദ്യാർത്ഥികളില്ല", "ವಿದ್ಯಾರ್ಥಿಗಳಿಲ್ಲ", "విద్యార్థులు లేరు"],
  ["Done", "முடிந்தது", "مکمل", "مكتمل", "പൂർത്തിയായി", "ಪೂರ್ಣಗೊಂಡಿದೆ", "పూర్తయింది"],
  ["Not Promoted", "அடுத்த ஆண்டிற்கு உயர்த்தப்படவில்லை", "ترقی نہیں دی گئی", "لم يتم الترفيع", "സ്ഥാനക്കയറ്റം നൽകിയിട്ടില്ല", "ಬಡ್ತಿ ನೀಡಲಾಗಿಲ್ಲ", "ప్రమోట్ చేయబడలేదు"],
  ["Course Decisions", "பாடநெறி முடிவுகள்", "کورس کے فیصلے", "قرارات المقررات", "കോഴ്സ് തീരുമാനങ്ങൾ", "ಕೋರ್ಸ್ ನಿರ್ಧಾರಗಳು", "కోర్సు నిర్ణయాలు"],
  ["Final-Year Decisions Pending", "இறுதியாண்டு முடிவுகள் நிலுவையில் உள்ளன", "آخری سال کے فیصلے زیر التوا", "قرارات السنة النهائية المعلقة", "അവസാന വർഷ തീരുമാനങ്ങൾ ശേഷിക്കുന്നു", "ಅಂತಿಮ ವರ್ಷದ ನಿರ್ಧಾರಗಳು ಬಾಕಿ ಇವೆ", "చివరి సంవత్సరం నిర్ణయాలు పెండింగ్‌లో ఉన్నాయి"],
  ["Niswans Done", "முடித்த நிஸ்வான்கள்", "مکمل نسواں", "المدارس المكتملة", "പൂർത്തിയാക്കിയ നിസ്‌വാനുകൾ", "ಪೂರ್ಣಗೊಳಿಸಿದ ನಿಸ್ವಾನ್‌ಗಳು", "పూర్తి చేసిన నిస్వాన్‌లు"],
  ["Niswans Pending", "நிலுவையில் உள்ள நிஸ்வான்கள்", "زیر التوا نسواں", "المدارس قيد الانتظار", "നടപടി ശേഷിക്കുന്ന നിസ്‌വാനുകൾ", "ಬಾಕಿ ಇರುವ ನಿಸ್ವಾನ್‌ಗಳು", "పెండింగ్‌లో ఉన్న నిస్వాన్‌లు"],
  ["Niswans Needing Review", "சரிபார்ப்பு தேவைப்படும் நிஸ்வான்கள்", "جائزہ طلب نسواں", "مدارس تحتاج إلى مراجعة", "പരിശോധന ആവശ്യമായ നിസ്‌വാനുകൾ", "ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿರುವ ನಿಸ್ವಾನ್‌ಗಳು", "సమీక్ష అవసరమైన నిస్వాన్‌లు"],
  ["All Niswans / All Courses", "அனைத்து நிஸ்வான்கள் / அனைத்து பாடநெறிகள்", "تمام نسواں / تمام کورس", "جميع المدارس / جميع المقررات", "എല്ലാ നിസ്‌വാനുകളും / എല്ലാ കോഴ്സുകളും", "ಎಲ್ಲಾ ನಿಸ್ವಾನ್‌ಗಳು / ಎಲ್ಲಾ ಕೋರ್ಸ್‌ಗಳು", "అన్ని నిస్వాన్‌లు / అన్ని కోర్సులు"],
  ["Year-end decisions are complete.", "கல்வியாண்டு இறுதி முடிவுகள் அனைத்தும் முடிக்கப்பட்டுள்ளன.", "سال کے اختتام کے تمام فیصلے مکمل ہیں۔", "اكتملت قرارات نهاية العام الدراسي.", "വർഷാവസാന തീരുമാനങ്ങൾ പൂർത്തിയായി.", "ವರ್ಷಾಂತ್ಯದ ನಿರ್ಧಾರಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ.", "విద్యా సంవత్సరాంత నిర్ణయాలు పూర్తయ్యాయి."],
  ["Year-end decisions still need attention.", "கல்வியாண்டு இறுதி முடிவுகள் இன்னும் நிலுவையில் உள்ளன.", "سال کے اختتام کے فیصلوں پر مزید توجہ درکار ہے۔", "لا تزال قرارات نهاية العام بحاجة إلى متابعة.", "വർഷാവസാന തീരുമാനങ്ങളിൽ ഇനിയും നടപടികൾ ആവശ്യമാണ്.", "ವರ್ಷಾಂತ್ಯದ ನಿರ್ಧಾರಗಳಿಗೆ ಇನ್ನೂ ಗಮನ ಅಗತ್ಯವಿದೆ.", "విద్యా సంవత్సరాంత నిర్ణయాలపై ఇంకా చర్య అవసరం."],
  ["Refresh Report", "அறிக்கையைப் புதுப்பிக்கவும்", "رپورٹ تازہ کریں", "تحديث التقرير", "റിപ്പോർട്ട് പുതുക്കുക", "ವರದಿಯನ್ನು ನವೀಕರಿಸಿ", "నివేదికను రిఫ్రెష్ చేయండి"],
  ["Reset Filters", "வடிகட்டிகளை மீட்டமைக்கவும்", "فلٹر دوبارہ ترتیب دیں", "إعادة ضبط عوامل التصفية", "ഫിൽട്ടറുകൾ പുനഃസജ്ജമാക്കുക", "ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಮರುಹೊಂದಿಸಿ", "ఫిల్టర్‌లను రీసెట్ చేయండి"],
  ["Reason", "காரணம்", "وجہ", "السبب", "കാരണം", "ಕಾರಣ", "కారణం"],
  ["Unresolved", "தீர்க்கப்படாதவை", "حل طلب", "غير محسوم", "പരിഹരിക്കാത്തവ", "ಪರಿಹರಿಸದವು", "పరిష్కరించనివి"],
];
const dictionaries = Object.fromEntries(languages.map((language, index) => [language, Object.fromEntries(rows.map((row) => [row[0], row[index]]))]));
export const translateStudentYearEnd = (text, language, fallback = (value) => value) => dictionaries[language]?.[text] || fallback(text);
export const yearEndStatusText = { DONE: "Done", PENDING: "Pending", NEEDS_REVIEW: "Needs Review", NO_STUDENTS: "No Students",
  PROMOTED: "Promoted", NOT_PROMOTED: "Not Promoted", COMPLETED: "Completed", UNRESOLVED: "Unresolved" };

export const YEAR_END_REASON_TEXT = Object.freeze({
  STUDENT_RECORD_MISSING: "The academic record refers to a missing student.",
  NISWAN_RECORD_MISSING: "The student refers to a missing Niswan.",
  COURSE_MISSING: "Course details are missing.", COURSE_ORDER_INVALID: "School course progression is not configured.",
  COURSE_ORDER_AMBIGUOUS: "More than one school course has the same progression order.",
  COURSE_ORDER_GAP: "The next school course is missing or ambiguous.", COURSE_DURATION_INVALID: "Course duration is not configured.",
  SOURCE_DUPLICATE: "More than one source academic record or course entry needs review.", STUDY_YEAR_INVALID: "The student's study year is missing or invalid.",
  NON_FINAL_COMPLETED: "A non-final course year is marked Completed.", COMPLETION_TARGET_CONFLICT: "A completed course also has a next-year entry.",
  TARGET_DUPLICATE: "More than one matching next-year course entry needs review.", TARGET_DECISION_MISSING: "A next-year record exists without an explicit promotion decision.",
  TARGET_PROGRESSION_CONFLICT: "The next-year decision does not match the course progression.", STUDENT_STATUS_REVIEW: "The student's current status needs review before closing the year.",
  NEXT_YEAR_MISSING: "The next academic year is not configured.", ADMISSION_FEES_INCOMPLETE: "The admission fees-paid flag is incomplete.",
  PENDING_FEE_INVOICE: "An unpaid fee invoice is blocking the decision.", FINAL_DECISION_PENDING: "The final-year completion or repeat decision is pending.",
  DECISION_PENDING: "The promotion or repeat decision is pending.", SOURCE_COURSES_MISSING: "The current academic record has no course entries.",
  SOURCE_ACADEMIC_MISSING: "The current academic-year record is missing.",
});
