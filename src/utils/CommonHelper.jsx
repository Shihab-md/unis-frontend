
export const getBaseUrl = async () => {
  return "https://unis-server.vercel.app/api/";
};

export const getRole = async () => {
  const role = localStorage.getItem("role");
  return role ? role : "";
};

