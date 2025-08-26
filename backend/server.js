import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json()); // per leggere JSON nel body
app.use(cors());

// Connessione ad Atlas
mongoose.connect(process.env.MONGODB_CONNECTION_URI);

// Evento connessione
mongoose.connection.on("connected", () => {
    console.log("Connesso a MongoDB Atlas");
});

mongoose.connection.on("error", (err) => {
    console.error("❌ Errore connessione MongoDB:", err);
});

// Rotta test
app.get("/", (req, res) => {
    res.send("Server funziona 🚀");
});

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});

// ------------------------------------------------------------------------ //

import Author from "./models/Author.js";

// GET /authors -> lista
app.get("/authors", async (req, res) => {
    const authors = await Author.find();
    res.json(authors);
});

// GET /authors/:id -> singolo autore
app.get("/authors/:id", async (req, res) => {
    const author = await Author.findById(req.params.id);
    if (author) res.json(author);
    else res.status(404).json({ message: "Autore non trovato" });
});

// POST /authors -> crea nuovo autore
app.post("/authors", async (req, res) => {
    try {
        const newAuthor = new Author(req.body);
        await newAuthor.save();
        res.status(201).json(newAuthor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /authors/:id -> modifica autore
app.put("/authors/:id", async (req, res) => {
    try {
        const updated = await Author.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (updated) res.json(updated);
        else res.status(404).json({ message: "Autore non trovato" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /authors/:id -> cancella autore
app.delete("/authors/:id", async (req, res) => {
    try {
        const deleted = await Author.findByIdAndDelete(req.params.id);
        if (deleted) res.json({ message: "Autore eliminato" });
        else res.status(404).json({ message: "Autore non trovato" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
