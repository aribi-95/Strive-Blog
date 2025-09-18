import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { saveToken } from "../utils/auth";

export default function Register({ setUser }) {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        birthDate: "",
    });
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/authors", form);
            const token = res.data.accessToken;
            saveToken(token);
            setUser(res.data.user);
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        }
    };

    return (
        <div className="container mt-4">
            <h3>Registrazione</h3>
            <form onSubmit={handleSubmit}>
                <input
                    name="firstName"
                    placeholder="Nome"
                    value={form.firstName}
                    onChange={handleChange}
                    className="form-control mb-2"
                    required
                />
                <input
                    name="lastName"
                    placeholder="Cognome"
                    value={form.lastName}
                    onChange={handleChange}
                    className="form-control mb-2"
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="form-control mb-2"
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="form-control mb-2"
                    required
                />
                <input
                    name="birthDate"
                    type="date"
                    placeholder="Data di nascita"
                    value={form.birthDate}
                    onChange={handleChange}
                    className="form-control mb-2"
                    required
                />
                <button type="submit" className="btn btn-primary">
                    Registrati
                </button>
            </form>
        </div>
    );
}
