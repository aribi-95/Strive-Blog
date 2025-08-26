import { useEffect, useState } from "react";
import axios from "axios";

const AuthorList = () => {
    const [authors, setAuthors] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:4000/authors")
            .then((res) => {
                console.log("Dati ricevuti:", res.data);
                setAuthors(res.data);
            })
            .catch((err) => console.error(err));
    }, []);

    return (
        <div>
            <h2>Lista Autori</h2>
            <ul>
                {authors.map((author) => (
                    <li key={author._id}>
                        {author.nome} {author.cognome} - {author.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AuthorList;
