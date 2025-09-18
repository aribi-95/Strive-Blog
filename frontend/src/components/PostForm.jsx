import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function PostForm({ user, onPostCreated, editMode = false }) {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        content: "",
    });
    const [cover, setCover] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setCover(e.target.files[0]);

    const estimateReadTime = (text) => {
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return {
            value: minutes,
            unit: minutes === 1 ? "minuto" : "minuti",
        };
    };

    // Se editMode, carica il post esistente
    useEffect(() => {
        if (editMode && postId) {
            const fetchPost = async () => {
                try {
                    const res = await axios.get(`/posts/${postId}`);
                    setFormData({
                        title: res.data.title,
                        category: res.data.category,
                        content: res.data.content,
                    });
                } catch (err) {
                    alert("Errore nel caricamento del post.");
                }
            };
            fetchPost();
        }
    }, [editMode, postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("Devi essere loggato.");

        setLoading(true);
        try {
            const postData = {
                ...formData,
                author: user.email,
                readTime: estimateReadTime(formData.content),
            };

            let res;
            if (editMode && postId) {
                res = await axios.put(`/posts/${postId}`, postData);
            } else {
                res = await axios.post("/posts", postData);
            }

            const currentPostId = editMode ? postId : res.data._id;

            if (cover) {
                const data = new FormData();
                data.append("cover", cover);
                await axios.patch(`/posts/${currentPostId}/cover`, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            alert(editMode ? "Post aggiornato!" : "Post creato!");
            onPostCreated?.();
            navigate(editMode ? `/post/${currentPostId}` : "/");
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <h3>{editMode ? "Modifica Post" : "Crea Post"}</h3>
            <input
                type="text"
                name="title"
                placeholder="Titolo"
                value={formData.title}
                onChange={handleChange}
                className="form-control mb-2"
                required
            />
            <input
                type="text"
                name="category"
                placeholder="Categoria"
                value={formData.category}
                onChange={handleChange}
                className="form-control mb-2"
                required
            />
            <textarea
                name="content"
                placeholder="Contenuto"
                value={formData.content}
                onChange={handleChange}
                className="form-control mb-2"
                required
            />
            <input type="file" onChange={handleFileChange} className="mb-2" />
            <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
            >
                {loading
                    ? "Salvando..."
                    : editMode
                    ? "Aggiorna Post"
                    : "Crea Post"}
            </button>
        </form>
    );
}
