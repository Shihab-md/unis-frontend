import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert, removeLocalStorage } from '../utils/CommonHelper'

const userContext = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(
            (await getBaseUrl()).toString() + "auth/verify",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data.success) {
            setUser(response.data.user);
          }
        } else {
          setUser(null);
          setLoading(false)
        }
      } catch (error) {
        console.log(error)
        if (error.response && !error.response.data.error) {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, []);

  const login = (user) => {
    setUser(user);
  };

  const logout = async () => {
    const result = await showConfirmationSwalAlert('Are you sure to Logout?', '', 'warning');

    if (result.isConfirmed) {
      showSwalAlert("Success!", "Successfully Logged out!", "success");

      setUser(null);
      removeLocalStorage();

      //  } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Swal.fire('Cancelled', 'Your file is safe!', 'error');
      // Handle cancellation logic (optional)
    }
  };

  return (
    <userContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </userContext.Provider>
  );
};

export const useAuth = () => userContext ? useContext(userContext) : null;
export default AuthContext;
