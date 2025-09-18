import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function PostDetail({ user }) {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`/posts/${postId}`);
                setPost(res.data);
            } catch (err) {
                setError(err.response?.data?.error || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await axios.get(`/posts/${postId}/comments`);
                setComments(res.data.data || res.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchComments();
    }, [postId]);

    const handleDeletePost = async () => {
        if (!window.confirm("Sei sicuro di voler eliminare questo post?"))
            return;
        try {
            await axios.delete(`/posts/${postId}`);
            alert("Post eliminato!");
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            const res = await axios.post(`/posts/${postId}/comments`, {
                commenterName: `${user.firstName} ${user.lastName}`,
                commenterEmail: user.email,
                text: newComment,
            });
            setComments([...comments, res.data]);
            setNewComment("");
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        }
    };

    const handleEditComment = async (commentId) => {
        try {
            const res = await axios.put(
                `/posts/${postId}/comment/${commentId}`,
                { text: editingText }
            );
            setComments(
                comments.map((c) => (c._id === commentId ? res.data : c))
            );
            setEditingCommentId(null);
            setEditingText("");
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Vuoi davvero eliminare questo commento?")) return;
        try {
            await axios.delete(`/posts/${postId}/comment/${commentId}`);
            setComments(comments.filter((c) => c._id !== commentId));
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        }
    };

    if (loading) return <p>Loading post...</p>;
    if (error) return <p className="text-danger">{error}</p>;
    if (!post) return <p>Post non trovato</p>;

    const isAuthor = user?.email === post.author;

    return (
        <div className="container mt-5">
            {/* Post details */}
            <div className="card shadow-sm mb-4">
                {post.cover && (
                    <img
                        src={post.cover}
                        alt={post.title}
                        className="card-img-top"
                        style={{ maxHeight: 450, objectFit: "cover" }}
                    />
                )}
                <div className="card-body">
                    <h2 className="card-title">{post.title}</h2>
                    <div className="mb-3 text-muted small">
                        <span className="badge bg-secondary me-2">
                            {post.category}
                        </span>
                        <span className="me-2">
                            {post.readTime?.value} {post.readTime?.unit}
                        </span>
                        • <span>{post.authorName}</span>
                    </div>
                    <div
                        className="card-text"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    ></div>

                    {isAuthor && (
                        <div className="mt-4 d-flex gap-2">
                            <button
                                className="btn btn-outline-warning"
                                onClick={() => navigate(`/edit-post/${postId}`)}
                            >
                                Modifica
                            </button>
                            <button
                                className="btn btn-outline-danger"
                                onClick={handleDeletePost}
                            >
                                Elimina
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Comments section */}
            <div className="mb-5">
                <h4 className="mb-3">Commenti</h4>
                {comments.length === 0 && (
                    <p className="text-muted">Nessun commento</p>
                )}
                <ul className="list-group mb-3">
                    {comments.map((c) => {
                        const isCommentAuthor =
                            user?.email === c.commenterEmail;
                        return (
                            <li
                                key={c._id}
                                className="list-group-item shadow-sm mb-2 rounded"
                            >
                                <strong>{c.commenterName}</strong>
                                {editingCommentId === c._id ? (
                                    <>
                                        <textarea
                                            className="form-control mt-2"
                                            value={editingText}
                                            onChange={(e) =>
                                                setEditingText(e.target.value)
                                            }
                                        />
                                        <div className="mt-2 d-flex gap-2">
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() =>
                                                    handleEditComment(c._id)
                                                }
                                            >
                                                Salva
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() =>
                                                    setEditingCommentId(null)
                                                }
                                            >
                                                Annulla
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <p className="mb-1 mt-1">{c.text}</p>
                                )}
                                {isCommentAuthor &&
                                    editingCommentId !== c._id && (
                                        <div className="mt-1">
                                            <button
                                                className="btn btn-link btn-sm p-0 me-2"
                                                onClick={() => {
                                                    setEditingCommentId(c._id);
                                                    setEditingText(c.text);
                                                }}
                                            >
                                                Modifica
                                            </button>
                                            <button
                                                className="btn btn-link btn-sm text-danger p-0"
                                                onClick={() =>
                                                    handleDeleteComment(c._id)
                                                }
                                            >
                                                Elimina
                                            </button>
                                        </div>
                                    )}
                            </li>
                        );
                    })}
                </ul>

                {/* New comment */}
                <textarea
                    className="form-control mb-2 shadow-sm"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Scrivi un commento..."
                />
                <button className="btn btn-primary" onClick={handleAddComment}>
                    Invia commento
                </button>
            </div>
        </div>
    );
}
