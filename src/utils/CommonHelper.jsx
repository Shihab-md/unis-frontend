
export const getBaseUrl = async () => {
  return "https://unis-server.vercel.app/api/";
};

export const getRole = async () => {
  const token = localStorage.getItem("token");
  if (token) {
    if (response.data.user && response.data.user.role) {
      return response.data.user.role;
    }
  }
  return null;
};

