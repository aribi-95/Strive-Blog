import { useState, useEffect, useCallback } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import axios, { setAuthToken } from "./api/axios";

import MyNav from "./components/MyNav.jsx";
import Home from "./components/Home.jsx";
import PostDetail from "./components/PostDetail.jsx";
import PostForm from "./components/PostForm.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";

export default function App() {
    const [authors, setAuthors] = useState([]);
    const [search, setSearch] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAuthorId, setSelectedAuthorId] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [user, setUser] = useState(null);

    const token = localStorage.getItem("token");

    // Recupera utente loggato da /me
    useEffect(() => {
        if (token) {
            setAuthToken(token);
            axios
                .get("/me")
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem("token");
                    setUser(null);
                });
        }
    }, [token]);

    // Carica autori
    const fetchAuthors = async () => {
        try {
            const res = await axios.get("/authors?page=1&limit=100");
            setAuthors(res.data.data ?? []);
        } catch (err) {
            console.error("Errore caricamento autori:", err.message);
        }
    };
    useEffect(() => {
        fetchAuthors();
    }, []);

    // Gestione ricerca con debounce
    useEffect(() => {
        const handler = setTimeout(() => setSearchTerm(search), 500);
        return () => clearTimeout(handler);
    }, [search]);

    // Quando viene creato un nuovo post, ricarico lista
    const handlePostCreated = useCallback(() => {
        setRefreshKey((k) => k + 1);
        fetchAuthors();
    }, []);

    return (
        <HashRouter>
            <div className="d-flex flex-column min-vh-100">
                <MyNav
                    authors={authors}
                    selectedAuthorId={selectedAuthorId}
                    setSelectedAuthorId={setSelectedAuthorId}
                    search={search}
                    setSearch={setSearch}
                    user={user}
                    setUser={setUser}
                />

                <main className="flex-grow-1 container mt-3">
                    <Routes>
                        {/* Home pubblica (mostra login/registrati se non loggato) */}
                        <Route
                            path="/"
                            element={
                                <Home
                                    apiBase="/posts"
                                    selectedAuthorId={selectedAuthorId}
                                    searchTerm={searchTerm}
                                    refreshKey={refreshKey}
                                />
                            }
                        />

                        {/* Auth */}
                        <Route
                            path="/login"
                            element={<Login setUser={setUser} />}
                        />
                        <Route
                            path="/register"
                            element={<Register setUser={setUser} />}
                        />

                        {/* Rotte protette */}
                        <Route
                            path="/create-post"
                            element={
                                user ? (
                                    <PostForm
                                        user={user}
                                        onPostCreated={handlePostCreated}
                                    />
                                ) : (
                                    <Navigate to="/login" />
                                )
                            }
                        />
                        <Route
                            path="/post/:postId"
                            element={
                                user ? (
                                    <PostDetail user={user} />
                                ) : (
                                    <Navigate to="/login" />
                                )
                            }
                        />
                        <Route
                            path="/edit-post/:postId"
                            element={
                                user ? (
                                    <PostForm
                                        user={user}
                                        editMode={true}
                                        onPostCreated={handlePostCreated}
                                    />
                                ) : (
                                    <Navigate to="/login" />
                                )
                            }
                        />

                        {/* Catch-all */}
                        <Route path="*" element={<h2>Page not found</h2>} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    );
}
