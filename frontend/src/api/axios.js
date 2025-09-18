import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

const instance = axios.create({
    baseURL: API,
});

// Token header
export const setAuthToken = (token) => {
    if (token) {
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete instance.defaults.headers.common["Authorization"];
    }
};

// Set token iniziale
const token = localStorage.getItem("token");
if (token) setAuthToken(token);

export default instance;
