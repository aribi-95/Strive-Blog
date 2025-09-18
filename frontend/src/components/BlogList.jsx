import { useEffect, useState } from "react";
import axios from "../api/axios";
import PostCard from "./PostCard";

export default function BlogList({ apiBase, selectedAuthorId, search }) {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                let url;

                if (selectedAuthorId) {
                    // endpoint: /posts/author/:authorId
                    url = `${apiBase}/author/${selectedAuthorId}?page=${page}&limit=${limit}`;
                } else {
                    const params = new URLSearchParams({ page, limit });
                    if (search) params.append("title", search);
                    url = `${apiBase}?${params.toString()}`;
                }

                const res = await axios.get(url, { signal: controller.signal });

                setPosts(res.data.data ?? []);
                setTotalPages(res.data.totalPages ?? 1);
            } catch (err) {
                if (!axios.isCancel(err)) {
                    console.error("Errore fetch posts:", err);
                    setError(err.response?.data?.error || err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
        return () => controller.abort();
    }, [apiBase, selectedAuthorId, search, page, limit]);

    // Reset pagina quando cambio filtro o search
    useEffect(() => setPage(1), [selectedAuthorId, search]);

    return (
        <section className="blog-list">
            {loading && <p>Caricamento articoli...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && posts.length === 0 && <p>Nessun articolo trovato.</p>}

            {posts.map((post) => (
                <PostCard key={post._id} post={post} />
            ))}

            {posts.length > 0 && (
                <div className="pagination d-flex justify-content-center align-items-center gap-3 my-3">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        ← Prev
                    </button>
                    <span>
                        Pagina {page} / {totalPages || 1}
                    </span>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() =>
                            setPage((p) => Math.min(totalPages || 1, p + 1))
                        }
                        disabled={page >= totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}
        </section>
    );
}
