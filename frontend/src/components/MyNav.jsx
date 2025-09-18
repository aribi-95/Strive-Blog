import { NavLink } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { logout } from "../utils/auth";

export default function MyNav({
    authors = [],
    selectedAuthorId,
    setSelectedAuthorId,
    search = "",
    setSearch,
    user,
}) {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
            <NavLink className="navbar-brand" to="/">
                Strive Blog
            </NavLink>
            <div className="collapse navbar-collapse">
                {user && (
                    <>
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/">
                                    Home
                                </NavLink>
                            </li>
                        </ul>

                        <div className="d-flex align-items-center gap-2 ms-auto">
                            {/* Dropdown Autori */}
                            <select
                                value={selectedAuthorId || ""}
                                onChange={(e) =>
                                    setSelectedAuthorId(e.target.value)
                                }
                                className="form-select"
                            >
                                <option value="">Tutti gli autori</option>
                                {authors.map((a) => (
                                    <option key={a._id} value={a._id}>
                                        {a.firstName} {a.lastName}
                                    </option>
                                ))}
                            </select>

                            {/* Search */}
                            <input
                                type="search"
                                placeholder="Cerca nel titolo..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="form-control"
                            />

                            {/* Dropdown utente */}
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="outline-secondary"
                                    className="d-flex align-items-center gap-2"
                                >
                                    {user.firstName}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item
                                        as={NavLink}
                                        to="/create-post"
                                    >
                                        Crea Post
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item
                                        onClick={() => logout(setUser)}
                                    >
                                        Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}
