import { useNavigate } from "react-router-dom";
import defaultImg from "../assets/default.jpg";

function stripHtml(html = "") {
    return html.replace(/<[^>]+>/g, "");
}

export default function PostCard({ post }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/post/${post._id}`);
    };

    return (
        <article
            className="card mb-3 post-card border-0 shadow-sm"
            style={{
                cursor: "pointer",
                borderRadius: "0.5rem",
                overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onClick={handleClick}
        >
            <div className="row g-0 flex-md-row flex-column">
                <div className="col-md-9 d-flex flex-column p-3">
                    <h5 className="card-title">{post.title}</h5>
                    <div className="text-muted mb-2">
                        <span>{post.category}</span> •{" "}
                        <span>
                            {post.readTime?.value} {post.readTime?.unit}
                        </span>{" "}
                        • <span>{post.authorName}</span>
                    </div>
                    <p className="card-text">
                        {stripHtml(post.content).slice(0, 220)}
                        {stripHtml(post.content).length > 220 ? "..." : ""}
                    </p>
                </div>
                <div className="col-md-3 d-flex align-items-center justify-content-center p-3">
                    <img
                        src={post.cover || defaultImg}
                        alt={post.title}
                        className="img-fluid"
                        style={{
                            borderRadius: "0.5rem",
                            objectFit: "cover",
                            width: "100%",
                            aspectRatio: "3 / 2",
                        }}
                    />
                </div>
            </div>
            <style>
                {`
                    .post-card:hover {
                        transform: scale(1.02);
                        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.25);
                    }
                `}
            </style>
        </article>
    );
}
