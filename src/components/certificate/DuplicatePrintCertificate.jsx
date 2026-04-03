import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper'
import axios from "axios";

const base64ToBlob = (base64, mimeType = "application/pdf") => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

const downloadBlobFile = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "Duplicate_Certificate.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

const DuplicatePrintCertificate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handleDuplicatePrint = async () => {
            try {
                const token = localStorage.getItem("token");
                const url = (await getBaseUrl()).toString() + `certificate/duplicate-print/${id}`;
                const res = await axios.post(url,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res?.data?.success) {
                    if (res.data.type === "base64pdf" && res.data.file) {
                        const blob = base64ToBlob(res.data.file, res.data.mimeType || "application/pdf");
                        downloadBlobFile(blob, res.data.fileName || "Duplicate_Certificate.pdf");
                    }

                    navigate("/dashboard/certificates");
                } else {
                    alert(res?.data?.error || "Duplicate print failed.");
                    navigate("/dashboard/certificates");
                }
            } catch (error) {
                console.log(error);
                alert(error?.response?.data?.error || "Duplicate print failed.");
                navigate("/dashboard/certificates");
            }
        };

        if (id) {
            handleDuplicatePrint();
        }
    }, [id, navigate]);

    return <div className="p-4 text-sm text-slate-600">Preparing duplicate certificate...</div>;
};

export default DuplicatePrintCertificate;