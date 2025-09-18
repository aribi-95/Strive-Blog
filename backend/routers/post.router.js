import express from "express";
import BlogPost from "../models/Post.js";
import Author from "../models/Author.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import mailer from "../utils/mailer.js";

const router = express.Router();

// Helpers per la paginazione
const parsePage = (val) => Math.max(parseInt(val, 10) || 1, 1);
const parseLimit = (val) => Math.min(Math.max(parseInt(val, 10) || 10, 1), 100);

// ------------------------------
// GET /posts?title=&page=&limit
// Lista post con authorName e filtro per titolo
// ------------------------------
router.get("/", async (req, res) => {
    try {
        const page = parsePage(req.query.page);
        const limit = parseLimit(req.query.limit);
        const filter = {};

        if (req.query.title) {
            filter.title = { $regex: req.query.title, $options: "i" };
        }

        const totalItems = await BlogPost.countDocuments(filter);
        const posts = await BlogPost.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const postsWithAuthor = await Promise.all(
            posts.map(async (p) => {
                const author = await Author.findOne({ email: p.author });
                return {
                    ...p.toObject(),
                    authorName: author
                        ? `${author.firstName} ${author.lastName}`
                        : p.author,
                };
            })
        );

        res.json({
            data: postsWithAuthor,
            page,
            pageSize: postsWithAuthor.length,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------------
// GET /posts/:postId
// Singolo post con authorName
// ------------------------------
router.get("/:postId", async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post non trovato" });

        const author = await Author.findOne({ email: post.author });
        const postWithAuthor = {
            ...post.toObject(),
            authorName: author
                ? `${author.firstName} ${author.lastName}`
                : post.author,
        };

        res.json(postWithAuthor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------------
// POST /posts
// Crea nuovo post e invia email all’autore
// ------------------------------
router.post("/", async (req, res) => {
    try {
        const authorEmail = req.body.author;
        const authorExists = await Author.findOne({ email: authorEmail });
        if (!authorExists) {
            return res
                .status(400)
                .json({ error: "Email autore non trovata tra gli Authors" });
        }

        const created = await BlogPost.create(req.body);

        // invio email tramite Nodemailer (SendGrid SMTP)
        await mailer.sendMail({
            from: "aribilleci@gmail.com",
            to: authorExists.email,
            subject: "Il tuo nuovo post è online!",
            text: `Ciao ${authorExists.firstName}, il tuo post "${created.title}" è stato pubblicato!`,
            html: `<p>Ciao ${authorExists.firstName}, il tuo post "<strong>${created.title}</strong>" è stato pubblicato!</p>`,
        });

        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ------------------------------
// PATCH /posts/:postId/cover
// Upload cover tramite Cloudinary
// ------------------------------
router.patch(
    "/:postId/cover",
    uploadCloudinary.single("cover"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "Nessun file caricato" });
            }

            const updated = await BlogPost.findByIdAndUpdate(
                req.params.postId,
                { cover: req.file.path },
                { new: true, runValidators: true }
            );

            if (!updated) {
                return res.status(404).json({ message: "Post non trovato" });
            }

            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// ------------------------------
// PUT /posts/:postId
// Modifica post
// ------------------------------
router.put("/:postId", async (req, res) => {
    try {
        const updated = await BlogPost.findByIdAndUpdate(
            req.params.postId,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ message: "Post non trovato" });
        }
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ------------------------------
// DELETE /posts/:postId
// Cancella post
// ------------------------------
router.delete("/:postId", async (req, res) => {
    try {
        const deleted = await BlogPost.findByIdAndDelete(req.params.postId);
        if (!deleted) {
            return res.status(404).json({ message: "Post non trovato" });
        }
        res.json({ message: "Post eliminato" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------------
// GET /posts/author/:authorId
// Tutti i post di un autore con authorName
// ------------------------------
router.get("/author/:authorId", async (req, res) => {
    try {
        const author = await Author.findById(req.params.authorId);
        if (!author) {
            return res.status(404).json({ message: "Autore non trovato" });
        }

        const posts = await BlogPost.find({ author: author.email }).sort({
            createdAt: -1,
        });

        const postsWithAuthor = posts.map((p) => ({
            ...p.toObject(),
            authorName: `${author.firstName} ${author.lastName}`,
        }));

        res.json({
            author,
            data: postsWithAuthor,
            totalItems: postsWithAuthor.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------------
// GET /posts/:postId/comments
// Tutti i commenti di un post
// ------------------------------
router.get("/:postId/comments", async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.postId, {
            comments: 1,
        });
        if (!post) return res.status(404).json({ message: "Post non trovato" });
        res.json({ data: post.comments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------------
// GET /posts/:postId/comments/:commentId
// Singolo commento di un post
// ------------------------------
router.get("/:postId/comments/:commentId", async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.postId, {
            comments: 1,
        });
        if (!post) return res.status(404).json({ message: "Post non trovato" });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Commento non trovato" });
        }

        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------------
// POST /posts/:postId/comments
// Aggiunge un commento a un post
// body: { commenterName, commenterEmail, text }
// ------------------------------
router.post("/:postId/comments", async (req, res) => {
    try {
        const { commenterName, commenterEmail, text } = req.body;
        if (!commenterName || !commenterEmail || !text) {
            return res
                .status(400)
                .json({ error: "Campi mancanti nel commento" });
        }

        const post = await BlogPost.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post non trovato" });

        const newComment = { commenterName, commenterEmail, text };
        post.comments.push(newComment);
        await post.save();

        const savedComment = post.comments[post.comments.length - 1];
        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------------
// PUT /posts/:postId/comment/:commentId
// Modifica un commento
// body: { text }
// ------------------------------
router.put("/:postId/comment/:commentId", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text)
            return res.status(400).json({ error: "Campo text mancante" });

        const post = await BlogPost.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post non trovato" });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Commento non trovato" });
        }

        comment.text = text;
        await post.save();

        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------------
// DELETE /posts/:postId/comment/:commentId
// Elimina un commento
// ------------------------------
router.delete("/:postId/comment/:commentId", async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post non trovato" });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Commento non trovato" });
        }

        await comment.deleteOne();
        await post.save();

        res.json({ message: "Commento eliminato" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
