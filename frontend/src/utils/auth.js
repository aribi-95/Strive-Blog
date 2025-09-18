import axios from "../api/axios";
import { setAuthToken } from "../api/axios";

export const saveToken = (token) => {
    localStorage.setItem("token", token);
    setAuthToken(token);
};

export const getToken = () => localStorage.getItem("token");

export const logout = async () => {
    const token = getToken();
    if (token) await axios.post("/logout").catch(() => {});
    localStorage.removeItem("token");
    setAuthToken(null);
    window.history.replaceState({}, document.title, "/#/login");
    window.location.reload();
};
