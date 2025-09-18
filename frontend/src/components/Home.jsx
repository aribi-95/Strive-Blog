import BlogList from "./BlogList";

export default function Home({
    apiBase,
    selectedAuthorId,
    searchTerm,
    refreshKey,
}) {
    const token = localStorage.getItem("token");

    if (!token) {
        return (
            <div className="container mt-5 text-center">
                <div className="p-5">
                    <h2 className="mb-3 fw-bold">Benvenutə!</h2>
                    <p className="mb-4 lead">
                        Per accedere ai blog, effettua il login o registrati.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <a
                            href="#/login"
                            className="btn btn-primary btn-lg shadow-sm"
                        >
                            Login
                        </a>
                        <a
                            href="#/register"
                            className="btn btn-outline-primary btn-lg shadow-sm"
                        >
                            Registrati
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <BlogList
                apiBase={apiBase}
                selectedAuthorId={selectedAuthorId}
                search={searchTerm}
                key={refreshKey}
            />
        </div>
    );
}
