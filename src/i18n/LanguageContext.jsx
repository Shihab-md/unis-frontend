import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { translateUiPhrase } from "./uiPhrases";

export const SUPPORTED_LANGUAGES = ["en", "ta", "ur", "ar", "ml", "kn", "te"];

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
];

const translations = {
  en: {
    common: {
      dashboard: "Dashboard",
      welcome: "Welcome, {{name}}",
      back: "Back",
      save: "Save",
      cancel: "Cancel",
      open: "Open",
      logout: "Logout",
      profile: "Profile",
      password: "Password",
      status: "Status",
      address: "Address",
      language: "Language",
      preferredLanguage: "Preferred Language",
      saveLanguage: "Save Language",
      saving: "Saving...",
      languageSaved: "Language preference updated successfully.",
      languageSaveFailed: "Unable to update language preference.",
      englishFallback: "English fallback enabled",
    },
    dashboard: {
      muavins: "Muavins",
      niswans: "Niswans",
      niswan: "Niswan",
      employees: "Employees",
      students: "Students",
      inspection: "Inspection",
      attendance: "Attendance",
      leaves: "Leaves",
      exams: "Exams",
      certificates: "Certificates",
      accounts: "Accounts",
      masters: "Masters",
      reports: "Reports",
      profile: "Profile",
    },
    profile: {
      myProfile: "My Profile",
      employeeId: "Employee ID",
      contactNumber: "Contact Number",
      gender: "Gender",
      maritalStatus: "Marital Status",
      dateOfBirth: "Date of Birth",
      dateOfJoining: "Date of Joining",
      qualification: "Qualification",
      status: "Status",
      address: "Address",
      updatePassword: "Update Password",
      passwordTip: "Tip: use 8+ characters with uppercase, number & special.",
      strength: "Strength",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      passwordsMatch: "Passwords match",
      passwordsDoNotMatch: "Passwords do not match",
      contactHelp: "If any profile detail is wrong, please contact HQ/Admin to update data.",
    },
    exams: {
      title: "Exams",
      subtitle: "Question Papers and Results",
      unavailable: "Exam module is not available for this role.",
      questions: "Questions",
      questionsDescription: "Upload, schedule, target and securely download exam Question Paper PDFs.",
      openQuestions: "Open Question Papers →",
      results: "Results",
      resultsDescription: "Bulk marks entry, attendance, Grade calculation, saved exams and consolidated results.",
      openResults: "Open Results →",
    },
    roles: {
      superadmin: "SuperAdmin",
      hquser: "HQ User",
      supervisor: "Supervisor",
      admin: "Admin",
      student: "Student",
      employee: "Employee",
      teacher: "Teacher",
      usthadh: "Usthadh",
      parent: "Parent",
      warden: "Warden",
      staff: "Staff",
      guest: "Guest",
    },
  },
  ta: {
    common: {
      dashboard: "முகப்புப்பக்கம்",
      welcome: "வரவேற்கிறோம், {{name}}",
      back: "பின்செல்",
      save: "சேமிக்கவும்",
      cancel: "ரத்து செய்",
      open: "திறக்கவும்",
      logout: "வெளியேறு",
      profile: "சுயவிவரம்",
      password: "கடவுச்சொல்",
      status: "நிலை",
      address: "முகவரி",
      language: "மொழி",
      preferredLanguage: "விருப்ப மொழி",
      saveLanguage: "மொழியைச் சேமிக்கவும்",
      saving: "சேமிக்கப்படுகிறது...",
      languageSaved: "மொழி விருப்பம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது.",
      languageSaveFailed: "மொழி விருப்பத்தை புதுப்பிக்க முடியவில்லை.",
      englishFallback: "மொழிபெயர்ப்பு இல்லையெனில் ஆங்கிலம் காட்டப்படும்",
    },
    dashboard: {
      muavins: "முஆவின்கள்",
      niswans: "நிஸ்வான்கள்",
      niswan: "நிஸ்வான்",
      employees: "பணியாளர்கள்",
      students: "மாணவர்கள்",
      inspection: "ஆய்வு அறிக்கை",
      attendance: "வருகைப் பதிவு",
      leaves: "விடுப்புகள்",
      exams: "தேர்வுகள்",
      certificates: "சான்றிதழ்கள்",
      accounts: "கணக்குகள்",
      masters: "முதன்மைத் தரவு",
      reports: "அறிக்கைகள்",
      profile: "சுயவிவரம்",
    },
    profile: {
      myProfile: "என் சுயவிவரம்",
      employeeId: "பணியாளர் எண்",
      contactNumber: "தொடர்பு எண்",
      gender: "பாலினம்",
      maritalStatus: "திருமண நிலை",
      dateOfBirth: "பிறந்த தேதி",
      dateOfJoining: "சேர்ந்த தேதி",
      qualification: "தகுதி",
      status: "நிலை",
      address: "முகவரி",
      updatePassword: "கடவுச்சொல்லைப் புதுப்பிக்கவும்",
      passwordTip: "குறைந்தது 8 எழுத்துகள், பெரிய எழுத்து, எண் மற்றும் சிறப்பு குறியீடு பயன்படுத்தவும்.",
      strength: "வலிமை",
      currentPassword: "தற்போதைய கடவுச்சொல்",
      newPassword: "புதிய கடவுச்சொல்",
      confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
      passwordsMatch: "கடவுச்சொற்கள் பொருந்துகின்றன",
      passwordsDoNotMatch: "கடவுச்சொற்கள் பொருந்தவில்லை",
      contactHelp: "சுயவிவர விவரங்களில் பிழை இருந்தால் HQ/Admin-ஐ தொடர்புகொள்ளவும்.",
    },
    exams: {
      title: "தேர்வுகள்",
      subtitle: "வினாத்தாள்கள் மற்றும் முடிவுகள்",
      unavailable: "இந்தப் பயனர் வகைக்கு தேர்வு தொகுதி கிடைக்கவில்லை.",
      questions: "வினாத்தாள்கள்",
      questionsDescription: "தேர்வு வினாத்தாள் PDF-களை பதிவேற்றி, நேரமிட்டு, இலக்கு நிஸ்வான்களைத் தேர்ந்தெடுத்து பாதுகாப்பாகப் பதிவிறக்கவும்.",
      openQuestions: "வினாத்தாள்களைத் திறக்கவும் →",
      results: "முடிவுகள்",
      resultsDescription: "மொத்த மதிப்பெண் பதிவு, வருகை, தரக் கணக்கீடு, சேமித்த தேர்வுகள் மற்றும் ஒருங்கிணைந்த முடிவுகள்.",
      openResults: "முடிவுகளைத் திறக்கவும் →",
    },
    roles: {
      superadmin: "சூப்பர் அட்மின்",
      hquser: "HQ பயனர்",
      supervisor: "முஆவின்",
      admin: "அட்மின்",
      student: "மாணவர்",
      employee: "பணியாளர்",
      teacher: "ஆசிரியர்",
      usthadh: "உஸ்தாத்",
      parent: "பெற்றோர்",
      warden: "வார்டன்",
      staff: "பணியாளர்",
      guest: "விருந்தினர்",
    },
  },
  ur: {
    common: {
      dashboard: "ڈیش بورڈ",
      welcome: "خوش آمدید، {{name}}",
      back: "واپس",
      save: "محفوظ کریں",
      cancel: "منسوخ کریں",
      open: "کھولیں",
      logout: "لاگ آؤٹ",
      profile: "پروفائل",
      password: "پاس ورڈ",
      status: "حیثیت",
      address: "پتہ",
      language: "زبان",
      preferredLanguage: "ترجیحی زبان",
      saveLanguage: "زبان محفوظ کریں",
      saving: "محفوظ ہو رہا ہے...",
      languageSaved: "زبان کی ترجیح کامیابی سے اپ ڈیٹ ہوگئی۔",
      languageSaveFailed: "زبان کی ترجیح اپ ڈیٹ نہیں ہوسکی۔",
      englishFallback: "ترجمہ نہ ہو تو انگریزی دکھائی جائے گی",
    },
    dashboard: {
      muavins: "معاونین",
      niswans: "نسواں",
      niswan: "نسواں",
      employees: "ملازمین",
      students: "طلبہ",
      inspection: "معائنہ",
      attendance: "حاضری",
      leaves: "رخصتیں",
      exams: "امتحانات",
      certificates: "اسناد",
      accounts: "حسابات",
      masters: "ماسٹر ڈیٹا",
      reports: "رپورٹس",
      profile: "پروفائل",
    },
    profile: {
      myProfile: "میری پروفائل",
      employeeId: "ملازم شناختی نمبر",
      contactNumber: "رابطہ نمبر",
      gender: "جنس",
      maritalStatus: "ازدواجی حیثیت",
      dateOfBirth: "تاریخ پیدائش",
      dateOfJoining: "شمولیت کی تاریخ",
      qualification: "تعلیمی قابلیت",
      status: "حیثیت",
      address: "پتہ",
      updatePassword: "پاس ورڈ تبدیل کریں",
      passwordTip: "کم از کم 8 حروف، بڑا حرف، نمبر اور خصوصی علامت استعمال کریں۔",
      strength: "مضبوطی",
      currentPassword: "موجودہ پاس ورڈ",
      newPassword: "نیا پاس ورڈ",
      confirmPassword: "پاس ورڈ کی تصدیق",
      passwordsMatch: "پاس ورڈ مطابقت رکھتے ہیں",
      passwordsDoNotMatch: "پاس ورڈ مطابقت نہیں رکھتے",
      contactHelp: "پروفائل کی معلومات غلط ہوں تو HQ/Admin سے رابطہ کریں۔",
    },
    exams: {
      title: "امتحانات",
      subtitle: "سوالیہ پرچے اور نتائج",
      unavailable: "اس صارف کے کردار کے لیے امتحان ماڈیول دستیاب نہیں ہے۔",
      questions: "سوالیہ پرچے",
      questionsDescription: "امتحانی سوالیہ PDF اپ لوڈ کریں، وقت مقرر کریں، مطلوبہ نسواں منتخب کریں اور محفوظ طریقے سے ڈاؤن لوڈ کریں۔",
      openQuestions: "سوالیہ پرچے کھولیں ←",
      results: "نتائج",
      resultsDescription: "اجتماعی نمبر اندراج، حاضری، گریڈ حساب، محفوظ امتحانات اور مجموعی نتائج۔",
      openResults: "نتائج کھولیں ←",
    },
    roles: {
      superadmin: "سپر ایڈمن",
      hquser: "HQ صارف",
      supervisor: "معاون",
      admin: "ایڈمن",
      student: "طالب علم",
      employee: "ملازم",
      teacher: "استاد",
      usthadh: "استاذ",
      parent: "والدین",
      warden: "وارڈن",
      staff: "عملہ",
      guest: "مہمان",
    },
  },
  ar: {
    common: {
      dashboard: "لوحة التحكم",
      welcome: "مرحبًا، {{name}}",
      back: "رجوع",
      save: "حفظ",
      cancel: "إلغاء",
      open: "فتح",
      logout: "تسجيل الخروج",
      profile: "الملف الشخصي",
      password: "كلمة المرور",
      status: "الحالة",
      address: "العنوان",
      language: "اللغة",
      preferredLanguage: "اللغة المفضلة",
      saveLanguage: "حفظ اللغة",
      saving: "جارٍ الحفظ...",
      languageSaved: "تم تحديث اللغة المفضلة بنجاح.",
      languageSaveFailed: "تعذر تحديث اللغة المفضلة.",
      englishFallback: "سيتم عرض الإنجليزية عند عدم توفر الترجمة",
    },
    dashboard: {
      muavins: "المعاونون",
      niswans: "نسوان",
      niswan: "نسوان",
      employees: "الموظفون",
      students: "الطلاب",
      inspection: "التفتيش",
      attendance: "الحضور",
      leaves: "الإجازات",
      exams: "الامتحانات",
      certificates: "الشهادات",
      accounts: "الحسابات",
      masters: "البيانات الأساسية",
      reports: "التقارير",
      profile: "الملف الشخصي",
    },
    profile: {
      myProfile: "ملفي الشخصي",
      employeeId: "رقم الموظف",
      contactNumber: "رقم الاتصال",
      gender: "الجنس",
      maritalStatus: "الحالة الاجتماعية",
      dateOfBirth: "تاريخ الميلاد",
      dateOfJoining: "تاريخ الانضمام",
      qualification: "المؤهل",
      status: "الحالة",
      address: "العنوان",
      updatePassword: "تحديث كلمة المرور",
      passwordTip: "استخدم 8 أحرف على الأقل، متضمنة حرفًا لاتينيًا كبيرًا ورقمًا ورمزًا خاصًا.",
      strength: "القوة",
      currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد كلمة المرور",
      passwordsMatch: "كلمتا المرور متطابقتان",
      passwordsDoNotMatch: "كلمتا المرور غير متطابقتين",
      contactHelp: "إذا كانت بيانات الملف الشخصي غير صحيحة، يرجى التواصل مع HQ/Admin لتحديثها.",
    },
    exams: {
      title: "الامتحانات",
      subtitle: "أوراق الأسئلة والنتائج",
      unavailable: "وحدة الامتحانات غير متاحة لهذا الدور.",
      questions: "أوراق الأسئلة",
      questionsDescription: "ارفع ملفات PDF لأوراق أسئلة الامتحانات، وحدد وقت الإتاحة والجهات المستهدفة، ونزّلها بأمان.",
      openQuestions: "فتح أوراق الأسئلة ←",
      results: "النتائج",
      resultsDescription: "إدخال الدرجات بالجملة، الحضور، حساب التقدير، الامتحانات المحفوظة والنتائج المجمعة.",
      openResults: "فتح النتائج ←",
    },
    roles: {
      superadmin: "المشرف العام",
      hquser: "مستخدم المقر الرئيسي",
      supervisor: "معاون",
      admin: "مسؤول",
      student: "طالب",
      employee: "موظف",
      teacher: "معلم",
      usthadh: "أستاذ",
      parent: "ولي الأمر",
      warden: "مشرف السكن",
      staff: "موظف",
      guest: "ضيف",
    },
  },
  ml: {
    common: {
      dashboard: "ഡാഷ്ബോർഡ്",
      welcome: "സ്വാഗതം, {{name}}",
      back: "പിന്നോട്ട്",
      save: "സംരക്ഷിക്കുക",
      cancel: "റദ്ദാക്കുക",
      open: "തുറക്കുക",
      logout: "ലോഗ് ഔട്ട്",
      profile: "പ്രൊഫൈൽ",
      password: "പാസ്‌വേഡ്",
      status: "സ്ഥിതി",
      address: "വിലാസം",
      language: "ഭാഷ",
      preferredLanguage: "ഇഷ്ട ഭാഷ",
      saveLanguage: "ഭാഷ സംരക്ഷിക്കുക",
      saving: "സംരക്ഷിക്കുന്നു...",
      languageSaved: "ഭാഷാ മുൻഗണന വിജയകരമായി പുതുക്കി.",
      languageSaveFailed: "ഭാഷാ മുൻഗണന പുതുക്കാനായില്ല.",
      englishFallback: "പരിഭാഷ ഇല്ലെങ്കിൽ ഇംഗ്ലീഷ് കാണിക്കും",
    },
    dashboard: {
      muavins: "മുആവിനുകൾ",
      niswans: "നിസ്വാനുകൾ",
      niswan: "നിസ്വാൻ",
      employees: "ജീവനക്കാർ",
      students: "വിദ്യാർത്ഥികൾ",
      inspection: "പരിശോധന",
      attendance: "ഹാജർ",
      leaves: "അവധികൾ",
      exams: "പരീക്ഷകൾ",
      certificates: "സർട്ടിഫിക്കറ്റുകൾ",
      accounts: "അക്കൗണ്ടുകൾ",
      masters: "മാസ്റ്റർ ഡാറ്റ",
      reports: "റിപ്പോർട്ടുകൾ",
      profile: "പ്രൊഫൈൽ",
    },
    profile: {
      myProfile: "എന്റെ പ്രൊഫൈൽ",
      employeeId: "ജീവനക്കാരന്റെ ഐഡി",
      contactNumber: "ബന്ധപ്പെടാനുള്ള നമ്പർ",
      gender: "ലിംഗം",
      maritalStatus: "വിവാഹസ്ഥിതി",
      dateOfBirth: "ജനന തീയതി",
      dateOfJoining: "ചേർന്ന തീയതി",
      qualification: "യോഗ്യത",
      status: "സ്ഥിതി",
      address: "വിലാസം",
      updatePassword: "പാസ്‌വേഡ് മാറ്റുക",
      passwordTip: "8+ അക്ഷരങ്ങൾ, വലിയ അക്ഷരം, നമ്പർ, പ്രത്യേക ചിഹ്നം എന്നിവ ഉപയോഗിക്കുക.",
      strength: "ശക്തി",
      currentPassword: "നിലവിലെ പാസ്‌വേഡ്",
      newPassword: "പുതിയ പാസ്‌വേഡ്",
      confirmPassword: "പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക",
      passwordsMatch: "പാസ്‌വേഡുകൾ ഒത്തുപോകുന്നു",
      passwordsDoNotMatch: "പാസ്‌വേഡുകൾ ഒത്തുപോകുന്നില്ല",
      contactHelp: "പ്രൊഫൈൽ വിവരങ്ങളിൽ തെറ്റുണ്ടെങ്കിൽ HQ/Admin-നെ ബന്ധപ്പെടുക.",
    },
    exams: {
      title: "പരീക്ഷകൾ",
      subtitle: "ചോദ്യപേപ്പറുകളും ഫലങ്ങളും",
      unavailable: "ഈ ഉപയോക്തൃ റോളിന് പരീക്ഷാ മോഡ്യൂൾ ലഭ്യമല്ല.",
      questions: "ചോദ്യപേപ്പറുകൾ",
      questionsDescription: "പരീക്ഷാ ചോദ്യപേപ്പർ PDF അപ്‌ലോഡ് ചെയ്യുക, സമയം നിശ്ചയിക്കുക, ലക്ഷ്യ നിസ്വാനുകൾ തിരഞ്ഞെടുക്കുക, സുരക്ഷിതമായി ഡൗൺലോഡ് ചെയ്യുക.",
      openQuestions: "ചോദ്യപേപ്പറുകൾ തുറക്കുക →",
      results: "ഫലങ്ങൾ",
      resultsDescription: "ബൾക്ക് മാർക്ക് എൻട്രി, ഹാജർ, ഗ്രേഡ് കണക്കാക്കൽ, സംരക്ഷിച്ച പരീക്ഷകൾ, ഏകീകൃത ഫലങ്ങൾ.",
      openResults: "ഫലങ്ങൾ തുറക്കുക →",
    },
    roles: {
      superadmin: "സൂപ്പർ അഡ്മിൻ",
      hquser: "HQ ഉപയോക്താവ്",
      supervisor: "മുആവിൻ",
      admin: "അഡ്മിൻ",
      student: "വിദ്യാർത്ഥി",
      employee: "ജീവനക്കാരൻ",
      teacher: "അധ്യാപകൻ",
      usthadh: "ഉസ്താദ്",
      parent: "രക്ഷിതാവ്",
      warden: "വാർഡൻ",
      staff: "സ്റ്റാഫ്",
      guest: "അതിഥി",
    },
  },
  kn: {
    common: {
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      welcome: "ಸ್ವಾಗತ, {{name}}",
      back: "ಹಿಂದಕ್ಕೆ",
      save: "ಉಳಿಸಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
      open: "ತೆರೆಯಿರಿ",
      logout: "ಲಾಗ್ ಔಟ್",
      profile: "ಪ್ರೊಫೈಲ್",
      password: "ಪಾಸ್‌ವರ್ಡ್",
      status: "ಸ್ಥಿತಿ",
      address: "ವಿಳಾಸ",
      language: "ಭಾಷೆ",
      preferredLanguage: "ಆದ್ಯತೆಯ ಭಾಷೆ",
      saveLanguage: "ಭಾಷೆ ಉಳಿಸಿ",
      saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
      languageSaved: "ಭಾಷೆಯ ಆದ್ಯತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
      languageSaveFailed: "ಭಾಷೆಯ ಆದ್ಯತೆಯನ್ನು ನವೀಕರಿಸಲಾಗಲಿಲ್ಲ.",
      englishFallback: "ಅನುವಾದ ಇಲ್ಲದಿದ್ದರೆ ಇಂಗ್ಲಿಷ್ ತೋರಿಸಲಾಗುತ್ತದೆ",
    },
    dashboard: {
      muavins: "ಮುಆವಿನ್‌ಗಳು",
      niswans: "ನಿಸ್ವಾನ್‌ಗಳು",
      niswan: "ನಿಸ್ವಾನ್",
      employees: "ಉದ್ಯೋಗಿಗಳು",
      students: "ವಿದ್ಯಾರ್ಥಿಗಳು",
      inspection: "ಪರಿಶೀಲನೆ",
      attendance: "ಹಾಜರಾತಿ",
      leaves: "ರಜೆಗಳು",
      exams: "ಪರೀಕ್ಷೆಗಳು",
      certificates: "ಪ್ರಮಾಣಪತ್ರಗಳು",
      accounts: "ಖಾತೆಗಳು",
      masters: "ಮಾಸ್ಟರ್ ಡೇಟಾ",
      reports: "ವರದಿಗಳು",
      profile: "ಪ್ರೊಫೈಲ್",
    },
    profile: {
      myProfile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
      employeeId: "ಉದ್ಯೋಗಿ ಐಡಿ",
      contactNumber: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ",
      gender: "ಲಿಂಗ",
      maritalStatus: "ವೈವಾಹಿಕ ಸ್ಥಿತಿ",
      dateOfBirth: "ಜನ್ಮ ದಿನಾಂಕ",
      dateOfJoining: "ಸೇರಿದ ದಿನಾಂಕ",
      qualification: "ಅರ್ಹತೆ",
      status: "ಸ್ಥಿತಿ",
      address: "ವಿಳಾಸ",
      updatePassword: "ಪಾಸ್‌ವರ್ಡ್ ನವೀಕರಿಸಿ",
      passwordTip: "8+ ಅಕ್ಷರಗಳು, ದೊಡ್ಡ ಅಕ್ಷರ, ಸಂಖ್ಯೆ ಮತ್ತು ವಿಶೇಷ ಚಿಹ್ನೆಯನ್ನು ಬಳಸಿ.",
      strength: "ಬಲ",
      currentPassword: "ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್",
      newPassword: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್",
      confirmPassword: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
      passwordsMatch: "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ",
      passwordsDoNotMatch: "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ",
      contactHelp: "ಪ್ರೊಫೈಲ್ ವಿವರ ತಪ್ಪಿದ್ದರೆ HQ/Admin ಅನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    },
    exams: {
      title: "ಪರೀಕ್ಷೆಗಳು",
      subtitle: "ಪ್ರಶ್ನೆಪತ್ರಿಕೆಗಳು ಮತ್ತು ಫಲಿತಾಂಶಗಳು",
      unavailable: "ಈ ಬಳಕೆದಾರ ಪಾತ್ರಕ್ಕೆ ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್ ಲಭ್ಯವಿಲ್ಲ.",
      questions: "ಪ್ರಶ್ನೆಪತ್ರಿಕೆಗಳು",
      questionsDescription: "ಪರೀಕ್ಷಾ ಪ್ರಶ್ನೆಪತ್ರಿಕೆ PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಸಮಯ ನಿಗದಿಪಡಿಸಿ, ಗುರಿ ನಿಸ್ವಾನ್‌ಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಮತ್ತು ಸುರಕ್ಷಿತವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
      openQuestions: "ಪ್ರಶ್ನೆಪತ್ರಿಕೆಗಳನ್ನು ತೆರೆಯಿರಿ →",
      results: "ಫಲಿತಾಂಶಗಳು",
      resultsDescription: "ಬಲ್ಕ್ ಅಂಕ ನಮೂದು, ಹಾಜರಾತಿ, ಗ್ರೇಡ್ ಲೆಕ್ಕಾಚಾರ, ಉಳಿಸಿದ ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ಏಕೀಕೃತ ಫಲಿತಾಂಶಗಳು.",
      openResults: "ಫಲಿತಾಂಶಗಳನ್ನು ತೆರೆಯಿರಿ →",
    },
    roles: {
      superadmin: "ಸೂಪರ್ ಅಡ್ಮಿನ್",
      hquser: "HQ ಬಳಕೆದಾರ",
      supervisor: "ಮುಆವಿನ್",
      admin: "ಅಡ್ಮಿನ್",
      student: "ವಿದ್ಯಾರ್ಥಿ",
      employee: "ಉದ್ಯೋಗಿ",
      teacher: "ಶಿಕ್ಷಕ",
      usthadh: "ಉಸ್ತಾದ್",
      parent: "ಪೋಷಕರು",
      warden: "ವಾರ್ಡನ್",
      staff: "ಸಿಬ್ಬಂದಿ",
      guest: "ಅತಿಥಿ",
    },
  },
  te: {
    common: {
      dashboard: "డ్యాష్‌బోర్డ్",
      welcome: "స్వాగతం, {{name}}",
      back: "వెనుకకు",
      save: "సేవ్ చేయండి",
      cancel: "రద్దు చేయండి",
      open: "తెరవండి",
      logout: "లాగ్ అవుట్",
      profile: "ప్రొఫైల్",
      password: "పాస్‌వర్డ్",
      status: "స్థితి",
      address: "చిరునామా",
      language: "భాష",
      preferredLanguage: "ప్రాధాన్య భాష",
      saveLanguage: "భాషను సేవ్ చేయండి",
      saving: "సేవ్ చేస్తోంది...",
      languageSaved: "భాషా ప్రాధాన్యం విజయవంతంగా నవీకరించబడింది.",
      languageSaveFailed: "భాషా ప్రాధాన్యాన్ని నవీకరించలేకపోయాం.",
      englishFallback: "అనువాదం అందుబాటులో లేకపోతే ఆంగ్లం చూపబడుతుంది",
    },
    dashboard: {
      muavins: "ముఆవిన్లు",
      niswans: "నిస్వాన్లు",
      niswan: "నిస్వాన్",
      employees: "ఉద్యోగులు",
      students: "విద్యార్థులు",
      inspection: "తనిఖీ",
      attendance: "హాజరు",
      leaves: "సెలవులు",
      exams: "పరీక్షలు",
      certificates: "సర్టిఫికేట్లు",
      accounts: "ఖాతాలు",
      masters: "మాస్టర్ డేటా",
      reports: "నివేదికలు",
      profile: "ప్రొఫైల్",
    },
    profile: {
      myProfile: "నా ప్రొఫైల్",
      employeeId: "ఉద్యోగి ఐడి",
      contactNumber: "సంప్రదింపు నంబర్",
      gender: "లింగం",
      maritalStatus: "వైవాహిక స్థితి",
      dateOfBirth: "పుట్టిన తేదీ",
      dateOfJoining: "చేరిన తేదీ",
      qualification: "అర్హత",
      status: "స్థితి",
      address: "చిరునామా",
      updatePassword: "పాస్‌వర్డ్ నవీకరించండి",
      passwordTip: "8+ అక్షరాలు, పెద్ద అక్షరం, సంఖ్య మరియు ప్రత్యేక గుర్తును ఉపయోగించండి.",
      strength: "బలం",
      currentPassword: "ప్రస్తుత పాస్‌వర్డ్",
      newPassword: "కొత్త పాస్‌వర్డ్",
      confirmPassword: "పాస్‌వర్డ్ నిర్ధారించండి",
      passwordsMatch: "పాస్‌వర్డ్‌లు సరిపోలుతున్నాయి",
      passwordsDoNotMatch: "పాస్‌వర్డ్‌లు సరిపోలడం లేదు",
      contactHelp: "ప్రొఫైల్ వివరాల్లో తప్పు ఉంటే HQ/Adminను సంప్రదించండి.",
    },
    exams: {
      title: "పరీక్షలు",
      subtitle: "ప్రశ్నాపత్రాలు మరియు ఫలితాలు",
      unavailable: "ఈ వినియోగదారు పాత్రకు పరీక్షల మాడ్యూల్ అందుబాటులో లేదు.",
      questions: "ప్రశ్నాపత్రాలు",
      questionsDescription: "పరీక్ష ప్రశ్నాపత్ర PDFలను అప్‌లోడ్ చేసి, సమయం నిర్ణయించి, లక్ష్య నిస్వాన్లను ఎంచుకుని సురక్షితంగా డౌన్‌లోడ్ చేయండి.",
      openQuestions: "ప్రశ్నాపత్రాలను తెరవండి →",
      results: "ఫలితాలు",
      resultsDescription: "బల్క్ మార్కుల నమోదు, హాజరు, గ్రేడ్ లెక్కింపు, సేవ్ చేసిన పరీక్షలు మరియు సమగ్ర ఫలితాలు.",
      openResults: "ఫలితాలను తెరవండి →",
    },
    roles: {
      superadmin: "సూపర్ అడ్మిన్",
      hquser: "HQ వినియోగదారు",
      supervisor: "ముఆవిన్",
      admin: "అడ్మిన్",
      student: "విద్యార్థి",
      employee: "ఉద్యోగి",
      teacher: "ఉపాధ్యాయుడు",
      usthadh: "ఉస్తాద్",
      parent: "తల్లిదండ్రులు",
      warden: "వార్డెన్",
      staff: "సిబ్బంది",
      guest: "అతిథి",
    },
  },
};

const LanguageContext = createContext(null);

const isSupported = (value) => SUPPORTED_LANGUAGES.includes(String(value || "").toLowerCase());

const getByPath = (object, path) =>
  String(path || "")
    .split(".")
    .filter(Boolean)
    .reduce((current, key) => (current && Object.prototype.hasOwnProperty.call(current, key) ? current[key] : undefined), object);

const interpolate = (text, variables = {}) =>
  String(text ?? "").replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, key) => String(variables[key] ?? ""));

const isRtlLanguage = (language) => ["ur", "ar"].includes(language);

const getFontFamily = (language) => {
  if (language === "ur" || language === "ar") return '"Noto Naskh Arabic", "Nirmala UI", "Segoe UI", Arial, sans-serif';
  if (language === "ta") return '"Noto Sans Tamil", "Nirmala UI", "Segoe UI", Arial, sans-serif';
  if (language === "ml") return '"Noto Sans Malayalam", "Nirmala UI", "Segoe UI", Arial, sans-serif';
  if (language === "kn") return '"Noto Sans Kannada", "Nirmala UI", "Segoe UI", Arial, sans-serif';
  if (language === "te") return '"Noto Sans Telugu", "Nirmala UI", "Segoe UI", Arial, sans-serif';
  return 'Inter, "Segoe UI", Arial, sans-serif';
};

export const LanguageProvider = ({ children }) => {
  const { user } = useAuth();
  const lastUserIdRef = useRef(null);
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("preferredLanguage");
    return isSupported(saved) ? saved : "en";
  });

  useEffect(() => {
    const userId = String(user?._id || "");
    const userLanguage = String(user?.preferredLanguage || "").toLowerCase();

    // Apply the server preference when a user session is first established or changes.
    if (userId && userId !== lastUserIdRef.current) {
      lastUserIdRef.current = userId;
      if (isSupported(userLanguage)) {
        setLanguageState(userLanguage);
        localStorage.setItem("preferredLanguage", userLanguage);
      }
    }

    if (!userId) lastUserIdRef.current = null;
  }, [user?._id, user?.preferredLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = String(nextLanguage || "").toLowerCase();
    if (!isSupported(normalized)) return false;
    setLanguageState(normalized);
    localStorage.setItem("preferredLanguage", normalized);
    return true;
  }, []);

  const value = useMemo(() => {
    const t = (key, fallbackOrVariables, maybeVariables) => {
      const fallback = typeof fallbackOrVariables === "string" ? fallbackOrVariables : key;
      const variables = typeof fallbackOrVariables === "object" && fallbackOrVariables !== null
        ? fallbackOrVariables
        : (maybeVariables || {});
      const selected = getByPath(translations[language], key);
      const english = getByPath(translations.en, key);
      return interpolate(selected ?? english ?? fallback, variables);
    };

    const tr = (text, params = {}) => translateUiPhrase(text, language, params);

    return {
      language,
      setLanguage,
      t,
      tr,
      direction: isRtlLanguage(language) ? "rtl" : "ltr",
      isRtl: isRtlLanguage(language),
      fontFamily: getFontFamily(language),
      languageOptions: LANGUAGE_OPTIONS,
    };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
};

const visualLength = (value) =>
  Array.from(String(value || "")).reduce((total, char) => {
    const code = char.codePointAt(0) || 0;
    const isWideScript =
      (code >= 0x0600 && code <= 0x077f) || // Arabic / Urdu
      (code >= 0x0b80 && code <= 0x0bff) || // Tamil
      (code >= 0x0c00 && code <= 0x0c7f) || // Telugu
      (code >= 0x0c80 && code <= 0x0cff) || // Kannada
      (code >= 0x0d00 && code <= 0x0d7f);   // Malayalam
    return total + (isWideScript ? 1.18 : 1);
  }, 0);

const sizeClassFor = (text, variant, language = "en") => {
  const length = visualLength(text);
  const isTamil = language === "ta";

  // Compact multilingual sizing.
  // Tamil stays one additional step smaller.

  if (variant === "heading") {
    if (isTamil) {
      if (length > 30) return "text-xs sm:text-sm lg:text-base";
      if (length > 20) return "text-sm sm:text-base lg:text-lg";
      return "text-base sm:text-lg lg:text-xl";
    }

    if (length > 30) return "text-sm sm:text-base lg:text-lg";
    if (length > 20) return "text-base sm:text-lg lg:text-xl";
    return "text-lg sm:text-xl lg:text-2xl";
  }

  if (variant === "button") {
    if (isTamil) {
      if (length > 28) return "text-[8px] sm:text-[9px] lg:text-[10px]";
      if (length > 18) return "text-[9px] sm:text-[10px] lg:text-[11px]";
      return "text-[10px] sm:text-[11px] lg:text-xs";
    }

    if (length > 28) return "text-[9px] sm:text-[10px] lg:text-[11px]";
    if (length > 18) return "text-[10px] sm:text-[11px] lg:text-xs";
    return "text-[11px] sm:text-xs lg:text-sm";
  }

  // Card/default label sizing
  if (isTamil) {
    if (length > 24) return "text-[8px] sm:text-[9px] lg:text-[10px]";
    if (length > 16) return "text-[9px] sm:text-[10px] lg:text-[11px]";
    return "text-[10px] sm:text-[11px] lg:text-xs";
  }

  if (length > 24) return "text-[9px] sm:text-[10px] lg:text-[11px]";
  if (length > 16) return "text-[10px] sm:text-[11px] lg:text-xs";
  return "text-[11px] sm:text-xs lg:text-sm";
};

export const AutoText = ({
  as: Component = "span",
  children,
  text,
  variant = "label",
  className = "",
  style,
  ...props
}) => {
  const { language, fontFamily, direction } = useLanguage();
  const content = text ?? children ?? "";

  return (
    <Component
      dir={direction}
      className={`${sizeClassFor(content, variant, language)} leading-snug break-words ${className}`.trim()}
      style={{ fontFamily, ...style }}
      {...props}
    >
      {children ?? text}
    </Component>
  );
};

export const UiText = ({ text, as = "span", variant = "label", className = "", ...props }) => {
  const { tr } = useLanguage();
  return <AutoText as={as} text={tr(text)} variant={variant} className={className} {...props} />;
};
