import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";

import authorRouter from "./routers/author.router.js";
import postRouter from "./routers/post.router.js";
import authRouter from "./routers/auth.router.js";
import { authenticate } from "./utils/auth.js";
import { setupGoogleStrategy } from "./config/passport.config.js";

dotenv.config();

const server = express();
const PORT = process.env.PORT || 4000;

// Middlewares
server.use(express.json());
server.use(cors());

// Passport
setupGoogleStrategy();
server.use(passport.initialize());

// Connessione a MongoDB Atlas
try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_URI);
    console.log("Connesso a MongoDB Atlas");
} catch (err) {
    console.error("Errore connessione MongoDB:", err);
    process.exit(1);
}

// Rotta test
server.get("/", (req, res) => {
    res.send("Server funziona 🚀");
});

// Routes
server.use("/api/v1", authRouter); // include /login, /login-google, /callback-google, ecc.
server.use("/api/v1/authors", authenticate, authorRouter);
server.use("/api/v1/posts", authenticate, postRouter);

// Middleware di error handling
server.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
    });
});

// Avvio server
server.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});
