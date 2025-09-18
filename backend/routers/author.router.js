import express from "express";
import { uploadCloudinary } from "../utils/cloudinary.js";
import Author from "../models/Author.js";

const router = express.Router();

// Helpers paginazione
const parsePage = (val) => Math.max(parseInt(val, 10) || 1, 1);
const parseLimit = (val) => Math.min(Math.max(parseInt(val, 10) || 10, 1), 100);

// GET lista autori
router.get("/", async (req, res) => {
    try {
        const page = parsePage(req.query.page);
        const limit = parseLimit(req.query.limit);
        const totalItems = await Author.countDocuments();
        const authors = await Author.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            data: authors,
            page,
            pageSize: authors.length,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET singolo autore
router.get("/:authorId", async (req, res) => {
    try {
        const author = await Author.findById(req.params.authorId);
        if (!author)
            return res.status(404).json({ message: "Autore non trovato" });
        res.json(author);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST crea autore
router.post("/", async (req, res) => {
    try {
        const newAuthor = new Author(req.body);
        await newAuthor.save();
        res.status(201).json(newAuthor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH upload avatar
router.patch(
    "/:authorId/avatar",
    uploadCloudinary.single("avatar"),
    async (req, res) => {
        try {
            if (!req.file)
                return res.status(400).json({ error: "Nessun file caricato" });

            const updated = await Author.findByIdAndUpdate(
                req.params.authorId,
                { avatar: req.file.path },
                { new: true, runValidators: true }
            );

            if (!updated)
                return res.status(404).json({ message: "Autore non trovato" });

            res.json(updated);
        } catch (err) {
            console.error("ERRORE CLOUDINARY:", err);
            res.status(500).json({ error: err.message, stack: err.stack });
        }
    }
);

// PUT modifica autore
router.put("/:authorId", async (req, res) => {
    try {
        const updated = await Author.findByIdAndUpdate(
            req.params.authorId,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated)
            return res.status(404).json({ message: "Autore non trovato" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE autore
router.delete("/:authorId", async (req, res) => {
    try {
        const deleted = await Author.findByIdAndDelete(req.params.authorId);
        if (!deleted)
            return res.status(404).json({ message: "Autore non trovato" });
        res.json({ message: "Autore eliminato" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
