import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReactQuill from "react-quill";
import Select from "react-select";
import "react-quill/dist/quill.snow.css";
import {
  FaPaperPlane,
  FaUpload,
  FaRegTimesCircle,
  FaMicrophone,
  FaStop,
  FaFileAlt,
} from "react-icons/fa";
import { addInspectionReport } from "../../api/inspectionReportApi";
import { getSchoolsFromCache } from "../../utils/SchoolHelper";
import {
  handleRightClickAndFullScreen,
  checkAuth,
  showSwalAlert,
  getPrcessing,
} from "../../utils/CommonHelper";

const VOICE_LANGUAGE_OPTIONS = [
  {
    value: "en-US",
    label: "English",
    helper: "Best for English voice dictation.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    value: "ta-IN",
    label: "Tamil",
    helper: "Speak clearly in Tamil. Browser support may vary.",
    color: "from-cyan-500 to-cyan-700",
  },
  {
    value: "ur-PK",
    label: "Urdu",
    helper: "Speak clearly in Urdu. Browser support may vary.",
    color: "from-emerald-500 to-green-500",
  },
  {
    value: "ml-IN",
    label: "Malayalam",
    helper: "Speak clearly in Malayalam. Browser support may vary.",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    value: "te-IN",
    label: "Telugu",
    helper: "Speak clearly in Telugu. Browser support may vary.",
    color: "from-pink-500 to-rose-500",
  },
];

const getSpeechRecognitionCtor = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const isMobileSpeechDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
};

const getPlainTextFromHtml = (html = "") => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sanitizeTranscript = (text = "") =>
  String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();

const getSchoolLabel = (school) =>
  `${school.code} : ${school.nameEnglish || school.name || school.schoolName || ""}`;

export default function InspectionReportAdd() {
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const hadSpeechErrorRef = useRef(false);
  const manualStopRef = useRef(false);

  const [title, setTitle] = useState("");
  const [reportDate] = useState(getTodayDate());
  const [contentHtml, setContentHtml] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [schools, setSchools] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [selectedSchoolOption, setSelectedSchoolOption] = useState(null);
  const [loadingSchools, setLoadingSchools] = useState(false);

  const [voiceLanguage, setVoiceLanguage] = useState("en-US");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  useEffect(() => {
    handleRightClickAndFullScreen();

    if (checkAuth("inspectionReportAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }

    setSpeechSupported(!!getSpeechRecognitionCtor());

    const loadSchools = async () => {
      try {
        setLoadingSchools(true);

        const res = await getSchoolsFromCache();
        const list = Array.isArray(res) ? res : res?.schools || [];

        const role = String(localStorage.getItem("role") || "").toLowerCase();
        const rawSchoolIds = localStorage.getItem("schoolIds");
        const supSchoolIds = rawSchoolIds ? JSON.parse(rawSchoolIds) : [];
        const mySchoolId = localStorage.getItem("schoolId");

        const filtered =
          role === "supervisor" &&
          Array.isArray(supSchoolIds) &&
          supSchoolIds.length > 0
            ? list.filter((s) => s && supSchoolIds.includes(String(s._id)))
            : list;

        setSchools(filtered);

        if (filtered.length === 1) {
          const onlySchool = filtered[0];
          const option = {
            value: String(onlySchool._id),
            label: getSchoolLabel(onlySchool),
          };

          setSchoolId(option.value);
          setSelectedSchoolOption(option);
          return;
        }

        const found = filtered.find((s) => String(s._id) === String(mySchoolId));
        if (found) {
          const option = {
            value: String(found._id),
            label: getSchoolLabel(found),
          };

          setSchoolId(option.value);
          setSelectedSchoolOption(option);
        } else {
          setSchoolId("");
          setSelectedSchoolOption(null);
        }
      } catch (error) {
        showSwalAlert(
          "Error!",
          error?.message || "Failed to load Niswan list.",
          "error"
        );
      } finally {
        setLoadingSchools(false);
      }
    };

    loadSchools();

    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        }
      } catch (error) {
        console.log("Speech cleanup error:", error);
      }
    };
  }, [navigate]);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "align",
  ];

  const schoolOptions = useMemo(() => {
    return schools.map((school) => ({
      value: String(school._id),
      label: getSchoolLabel(school),
    }));
  }, [schools]);

  const customSelectStyles = useMemo(
    () => ({
      control: (provided, state) => ({
        ...provided,
        minHeight: "42px",
        borderRadius: "0.375rem",
        borderColor: state.isFocused ? "#94a3b8" : "#67e8f9",
        backgroundColor: state.isDisabled ? "#f1f5f9" : "#ecfeff",
        boxShadow: state.isFocused
          ? "0 0 0 1px #22d3ee"
          : "0 10px 15px -3px rgb(0 0 0 / 0.08)",
        fontSize: "12px",
        "&:hover": {
          borderColor: "#22d3ee",
        },
      }),
      valueContainer: (provided) => ({
        ...provided,
        padding: "0 10px",
      }),
      input: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0,
        color: "#0f172a",
      }),
      placeholder: (provided) => ({
        ...provided,
        color: "#64748b",
      }),
      singleValue: (provided) => ({
        ...provided,
        color: "#0f172a",
      }),
      menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        borderRadius: "0.75rem",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
      }),
      menuList: (provided) => ({
        ...provided,
        paddingTop: 4,
        paddingBottom: 4,
        fontSize: "12px",
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
          ? "#0891b2"
          : state.isFocused
          ? "#ecfeff"
          : "#ffffff",
        color: state.isSelected ? "#ffffff" : "#0f172a",
        cursor: "pointer",
      }),
      indicatorSeparator: () => ({
        display: "none",
      }),
      dropdownIndicator: (provided) => ({
        ...provided,
        color: "#0891b2",
      }),
      clearIndicator: (provided) => ({
        ...provided,
        color: "#ef4444",
      }),
    }),
    []
  );

  const appendTranscriptToEditor = (transcript = "") => {
    const cleanTranscript = sanitizeTranscript(transcript);
    if (!cleanTranscript) return;

    const editor = quillRef.current?.getEditor?.();

    if (editor) {
      editor.focus();

      const range = editor.getSelection(true);
      const currentLength = editor.getLength();
      const insertAt = range?.index ?? Math.max(currentLength - 1, 0);

      const textToInsert =
        insertAt > 0 ? `\n${cleanTranscript}\n` : `${cleanTranscript}\n`;

      editor.insertText(insertAt, textToInsert, "user");
      setContentHtml(editor.root.innerHTML);
      return;
    }

    const paragraph = `<p>${cleanTranscript.replace(/\n/g, "<br/>")}</p>`;
    setContentHtml((prev) => (prev ? `${prev}${paragraph}` : paragraph));
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const allowed = selected.filter((file) =>
      ["application/pdf", "image/png", "image/jpeg", "image/jpg"].includes(file.type)
    );

    if (allowed.length !== selected.length) {
      showSwalAlert("Info!", "Only pdf, jpg, jpeg, png files are allowed.", "info");
    }

    setFiles(allowed);
  };

  const startVoiceInput = () => {
    if (isListening) return;

    const SpeechRecognitionCtor = getSpeechRecognitionCtor();

    if (!SpeechRecognitionCtor) {
      showSwalAlert(
        "Info!",
        "Voice input is not supported in this browser. Please use latest Chrome or Edge.",
        "info"
      );
      return;
    }

    try {
      const isMobile = isMobileSpeechDevice();

      hadSpeechErrorRef.current = false;
      manualStopRef.current = false;
      finalTranscriptRef.current = "";
      setInterimTranscript("");
      setLastTranscript("");

      const recognition = new SpeechRecognitionCtor();
      recognitionRef.current = recognition;

      recognition.lang = voiceLanguage;
      recognition.continuous = true;
      recognition.interimResults = !isMobile;

      if ("maxAlternatives" in recognition) {
        recognition.maxAlternatives = 1;
      }

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";

        for (let i = 0; i < event.results.length; i += 1) {
          const transcript = sanitizeTranscript(
            event.results[i]?.[0]?.transcript || ""
          );

          if (!transcript) continue;

          if (event.results[i].isFinal) {
            finalText += `${transcript} `;
          } else {
            interimText += `${transcript} `;
          }
        }

        finalText = sanitizeTranscript(finalText);
        interimText = sanitizeTranscript(interimText);

        finalTranscriptRef.current = finalText;
        setInterimTranscript(interimText);
        setLastTranscript(sanitizeTranscript(`${finalText} ${interimText}`));
      };

      recognition.onerror = (event) => {
        hadSpeechErrorRef.current = true;
        setIsListening(false);
        setInterimTranscript("");

        const errorCode = event?.error || "";

        if (errorCode === "not-allowed" || errorCode === "service-not-allowed") {
          showSwalAlert(
            "Error!",
            "Microphone permission denied. Please allow microphone access and try again.",
            "error"
          );
        } else if (errorCode === "no-speech") {
          showSwalAlert(
            "Info!",
            "No speech detected. Please try again more clearly.",
            "info"
          );
        } else if (errorCode === "audio-capture") {
          showSwalAlert(
            "Error!",
            "Microphone not found or unavailable.",
            "error"
          );
        } else if (errorCode === "language-not-supported") {
          showSwalAlert(
            "Error!",
            "Selected voice language is not supported by this browser.",
            "error"
          );
        } else if (errorCode === "network") {
          showSwalAlert(
            "Error!",
            "Voice recognition network issue. Please try again.",
            "error"
          );
        } else if (errorCode === "aborted") {
          // silent
        } else {
          showSwalAlert(
            "Error!",
            `Voice input failed${errorCode ? `: ${errorCode}` : "."}`,
            "error"
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
        recognitionRef.current = null;

        const transcript = sanitizeTranscript(finalTranscriptRef.current);
        finalTranscriptRef.current = "";

        if (hadSpeechErrorRef.current) {
          hadSpeechErrorRef.current = false;
          return;
        }

        if (!manualStopRef.current && !transcript) {
          return;
        }

        manualStopRef.current = false;

        if (!transcript) {
          showSwalAlert(
            "Info!",
            "No final transcript was captured. Please try again.",
            "info"
          );
          return;
        }

        appendTranscriptToEditor(transcript);
        setLastTranscript(transcript);

        showSwalAlert(
          "Success!",
          "Voice text inserted into report content.",
          "success"
        );
      };

      recognition.start();
    } catch (error) {
      setIsListening(false);
      recognitionRef.current = null;

      showSwalAlert(
        "Error!",
        error?.message || "Failed to start voice input.",
        "error"
      );
    }
  };

  const stopVoiceInput = () => {
    if (!recognitionRef.current) return;

    try {
      manualStopRef.current = true;
      recognitionRef.current.stop();
    } catch (error) {
      setIsListening(false);
      recognitionRef.current = null;

      showSwalAlert(
        "Error!",
        error?.message || "Failed to stop voice input.",
        "error"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!schoolId.trim()) {
      showSwalAlert("Info!", "Niswan is required.", "info");
      return;
    }

    if (!title.trim()) {
      showSwalAlert("Info!", "Inspection report title is required.", "info");
      return;
    }

    if (!reportDate) {
      showSwalAlert("Info!", "Report date is required.", "info");
      return;
    }

    if (!contentHtml.trim() || !getPlainTextFromHtml(contentHtml)) {
      showSwalAlert("Info!", "Inspection report content is required.", "info");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("schoolId", schoolId);
      formData.append("title", title.trim());
      formData.append("reportDate", reportDate);
      formData.append("contentHtml", contentHtml);
      formData.append("contentText", getPlainTextFromHtml(contentHtml));

      files.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await addInspectionReport(formData);

      showSwalAlert(
        "Success!",
        res?.message || "Inspection report submitted successfully.",
        "success"
      );

      navigate("/dashboard/inspection-reports");
    } catch (error) {
      showSwalAlert(
        "Error!",
        error?.response?.data?.message ||
          error.message ||
          "Failed to submit inspection report.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return getPrcessing();
  }

  return (
    <div className="mt-1 bg-transparent md:p-5">
      <div className="mt-1 rounded-xl border border-slate-200 bg-transparent p-3 shadow-xl md:p-6">
        <div className="mb-5 flex items-center justify-center rounded-md bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-4 py-2 text-white shadow-lg">
          <h3 className="text-base font-semibold md:text-lg">
            Add Inspection Report
          </h3>
          <Link to="/dashboard/inspection-reports">
            <FaRegTimesCircle className="ml-4 rounded-full bg-white/90 p-1 text-2xl text-red-600 shadow-md md:ml-7" />
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-12 bg-white p-3 pb-4 rounded-lg shadow-xl">
            <Field label="Niswan" className="text-xs md:col-span-4">
              <Select
                options={schoolOptions}
                value={selectedSchoolOption}
                onChange={(selected) => {
                  setSelectedSchoolOption(selected || null);
                  setSchoolId(selected?.value || "");
                }}
                isDisabled={loadingSchools || schools.length === 1}
                isClearable={schools.length !== 1}
                isSearchable
                placeholder="Select Niswan"
                styles={customSelectStyles}
                className="text-xs"
                classNamePrefix="inspection-school-select"
                noOptionsMessage={() => "No Niswan found"}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              />
            </Field>

            <Field label="Report Title" className="text-xs md:col-span-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-violet-200 bg-violet-50 px-3 py-3 text-xs outline-none shadow-lg transition focus:border-violet-400 focus:bg-white"
              />
            </Field>

            <Field label="Report Date" className="md:col-span-2">
              <input
                type="date"
                value={reportDate}
                disabled
                className="w-full cursor-not-allowed rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs outline-none shadow-lg"
              />
            </Field>

            <Field label="Attachments (pdf / jpg / png)" className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-slate-700 shadow-lg transition hover:bg-emerald-100">
                <FaUpload className="text-emerald-600" />
                <span>Choose files</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </Field>
          </div>

          {files.length > 0 && (
            <div className="mt-4 rounded-lg border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Selected Files
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white bg-white px-3 py-2 text-sm shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FaFileAlt className="shrink-0 text-sky-600" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {Math.ceil(file.size / 1024)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 shadow-xl">
            <div className="grid grid-cols-1 gap-4 bg-slate-50 p-4 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Voice Input Language
                </label>
                <select
                  value={voiceLanguage}
                  onChange={(e) => setVoiceLanguage(e.target.value)}
                  disabled={isListening}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none shadow-sm transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {VOICE_LANGUAGE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 md:ml-3 lg:col-span-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={startVoiceInput}
                    disabled={isListening || !speechSupported}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xl transition hover:scale-[1.01] hover:from-emerald-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FaMicrophone />
                    {isListening ? "Listening..." : "Start Voice"}
                  </button>

                  <button
                    type="button"
                    onClick={stopVoiceInput}
                    disabled={!isListening}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xl transition hover:scale-[1.01] hover:from-red-600 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FaStop />
                    Stop
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Report Content
            </label>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={contentHtml}
                onChange={setContentHtml}
                modules={modules}
                formats={formats}
                className="min-h-[280px]"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={submitting || isListening}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01] hover:from-teal-700 hover:to-cyan-700 disabled:opacity-60"
            >
              <FaPaperPlane />
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}