import React from "react";
import { getFormattedDate } from "../../utils/CommonHelper";

const NiswanProfilePrint = ({ school }) => {
    const safeValue = (value) => {
        if (value === null || value === undefined || value === "") return "-";

        if (typeof value === "object") {
            return (
                value?.name ||
                value?.nameEnglish ||
                value?.userId?.name ||
                value?.supervisorId ||
                value?._id ||
                "-"
            );
        }

        return value;
    };

    const todayFormatted = () => {
        const d = new Date();
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getDistrictState = () => {
        if (school?.districtStateId?.district || school?.districtStateId?.state) {
            return `${school?.districtStateId?.district || ""}${school?.districtStateId?.district && school?.districtStateId?.state ? ", " : ""
                }${school?.districtStateId?.state || ""}`;
        }
        return "-";
    };

    const getSupervisorText = () => {
        if (school?.supervisorId?.supervisorId || school?.supervisorId?.userId?.name) {
            return `${school?.supervisorId?.supervisorId || ""}${school?.supervisorId?.supervisorId && school?.supervisorId?.userId?.name ? " : " : ""
                }${school?.supervisorId?.userId?.name || ""}`;
        }
        return "-";
    };

    const SectionTable = ({ title, rows }) => (
        <div className="mt-4">
            <div className="bg-gray-200 border border-gray-500 px-2 py-1 font-bold uppercase">
                {title}
            </div>

            <table className="w-full border-collapse text-[12px]">
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={`${title}-${index}`}>
                            <td className="w-[34%] border border-t-0 border-r border-gray-300 bg-gray-50 px-2 py-2 align-middle font-semibold leading-normal">
                                {row.label}
                            </td>
                            <td className="border border-t-0 border-gray-300 px-2 py-2 align-middle leading-normal break-words">
                                {safeValue(row.value)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const getInchargeRows = () => {
        const rows = [];

        for (let i = 1; i <= 7; i += 1) {
            const name = school?.[`incharge${i}`];
            const number = school?.[`incharge${i}Number`];
            const designation = school?.[`designation${i}`];

            if (name || number || designation) {
                rows.push(
                    { label: `Incharge-${i} Name`, value: name },
                    { label: "Mobile Number", value: number },
                    { label: "Designation", value: designation }
                );
            }
        }

        if (rows.length === 0) {
            rows.push({ label: "Incharge Details", value: "-" });
        }

        return rows;
    };

    return (
        <div className="print-page w-full max-w-[210mm] min-h-[297mm] bg-white mx-auto p-[12mm] text-[12px] text-gray-900">
            {/* Header */}
            <div className="border-b-2 border-gray-700 pb-3">
                <table className="w-full border-collapse">
                    <tbody>
                        <tr>
                            <td className="w-[18%] align-middle">
                                <img
                                    src={school?.logo || "/school-logo.png"}
                                    alt="School Logo"
                                    className="w-20 h-20 object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = "/school-logo.png";
                                    }}
                                />
                            </td>

                            <td className="w-[57%] align-middle text-center">
                                <h1 className="text-[20px] font-bold uppercase tracking-wide leading-tight">
                                    {school?.nameEnglish || "UNIS Academy"}
                                </h1>
                                <p className="text-[11px] mt-1">
                                    {school?.code ? `Niswan Code: ${school.code}` : ""}
                                </p>
                                <p className="text-[16px] font-semibold mt-2 uppercase">
                                    Niswan Profile Report
                                </p>
                            </td>

                            <td className="w-[25%] align-middle text-right">
                                <img
                                    src={school?.logo || "/school-logo.png"}
                                    alt="Niswan"
                                    className="w-24 h-28 object-contain border border-gray-400 inline-block p-1"
                                    onError={(e) => {
                                        e.currentTarget.src = "/school-logo.png";
                                    }}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Meta */}
            <table className="w-full border-collapse mt-4 text-[12px]">
                <tbody>
                    <tr>
                        <td className="w-1/2 border border-gray-400 px-2 py-2 align-middle">
                            <p>
                                <span className="font-semibold">Generated Date:</span>{" "}
                                {todayFormatted()}
                            </p>
                            <p>
                                <span className="font-semibold">Code:</span>{" "}
                                {safeValue(school?.code)}
                            </p>
                        </td>
                        <td className="w-1/2 border border-gray-400 px-2 py-2 align-middle">
                            <p>
                                <span className="font-semibold">Status:</span>{" "}
                                {safeValue(school?.active)}
                            </p>
                            <p>
                                <span className="font-semibold">Date of Establishment:</span>{" "}
                                {getFormattedDate(school?.doe)}
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>

            <SectionTable
                title="Basic Information"
                rows={[
                    { label: "Code", value: school?.code },
                    { label: "Date of Establishment", value: getFormattedDate(school?.doe) },
                    { label: "Status", value: school?.active },
                ]}
            />

            <SectionTable
                title="Name Details"
                rows={[
                    { label: "Name in English", value: school?.nameEnglish },
                    { label: "Name in Arabic", value: school?.nameArabic },
                    { label: "Name in Native", value: school?.nameNative },
                ]}
            />

            <SectionTable
                title="Contact Information"
                rows={[
                    { label: "Contact Number", value: school?.contactNumber },
                    { label: "Email", value: school?.email },
                ]}
            />

            <SectionTable
                title="Address Information"
                rows={[
                    { label: "Door No. & Street", value: school?.address },
                    { label: "Area & Town / City", value: school?.city },
                    { label: "Landmark", value: school?.landmark },
                    { label: "Pincode", value: school?.pincode },
                    { label: "State & District", value: getDistrictState() },
                ]}
            />

            <SectionTable
                title="Supervisor Information"
                rows={[
                    { label: "Supervisor", value: getSupervisorText() },
                ]}
            />

            <SectionTable
                title="Incharge Information"
                rows={getInchargeRows()}
            />

            {/* Footer */}
            <div className="mt-8 pt-2 border-t border-gray-400 text-center text-[10px] text-gray-700">
                <p>UNIS Academy - Niswan Profile Report</p>
                <p>Generated on {todayFormatted()}</p>
            </div>
        </div>
    );
};

export default NiswanProfilePrint;