import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { saveToken } from "../utils/auth";

export default function Login({ setUser }) {
    const [form, setForm] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    // Se Google ci reindirizza con un jwt
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const jwt = params.get("jwt");
        if (jwt) {
            saveToken(jwt);
            setUser({ email: "Google user" });
            navigate("/");
        }
    }, [navigate, setUser]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/login", form);
            const token = res.data.accessToken;
            saveToken(token);
            setUser(res.data.user);
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "75vh" }}
        >
            <div className="card shadow-lg p-4" style={{ width: "350px" }}>
                <h3 className="text-center mb-4">Accedi a Strive Blog</h3>

                {/* Login classico */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Accedi
                    </button>
                </form>

                <div className="text-center my-3">
                    <small className="text-muted">oppure</small>
                </div>

                {/* Login con Google */}
                <a
                    className="btn btn-outline-danger w-100"
                    href={`${import.meta.env.VITE_API_URL}/login-google`}
                >
                    <i className="bi bi-google me-2"></i> Accedi con Google
                </a>
            </div>
        </div>
    );
}
