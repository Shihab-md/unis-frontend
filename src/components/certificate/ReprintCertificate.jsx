import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper'
import axios from "axios";

const ReprintCertificate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handleReprint = async () => {
            try {
                const token = localStorage.getItem("token");
                const url = (await getBaseUrl()).toString() + `certificate/reprint/${id}`;
                const res = await axios.post(url,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res?.data?.success) {
                    if (res.data.downloadUrl) {
                        window.open(res.data.downloadUrl, "_blank");
                    }

                    navigate("/dashboard/certificates");
                } else {
                    alert(res?.data?.error || "Reprint failed.");
                    navigate("/dashboard/certificates");
                }
            } catch (error) {
                console.log(error);
                alert(error?.response?.data?.error || "Reprint failed.");
                navigate("/dashboard/certificates");
            }
        };

        if (id) {
            handleReprint();
        }
    }, [id, navigate]);

    return <div className="p-4 text-sm text-slate-600">Processing reprint...</div>;
};

export default ReprintCertificate;