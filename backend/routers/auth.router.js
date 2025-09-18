import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import Author from "../models/Author.js";
import { generateToken, authenticate, tokenBlacklist } from "../utils/auth.js";

const router = express.Router();

/**
 * ---------------------------
 * POST /api/v1/authors  -> registrazione manuale
 * ---------------------------
 */
router.post("/authors", async (req, res) => {
    try {
        const { firstName, lastName, email, password, birthDate } = req.body;
        if (!email || !password || !firstName || !lastName || !birthDate) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const exists = await Author.findOne({ email });
        if (exists) {
            return res.status(409).json({ error: "Email already in use" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const created = await Author.create({
            firstName,
            lastName,
            email,
            password: hashed,
            birthDate,
        });

        const token = generateToken(created);
        res.status(201).json({
            accessToken: token,
            user: {
                _id: created._id,
                firstName: created.firstName,
                lastName: created.lastName,
                email: created.email,
                birthDate: created.birthDate,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * ---------------------------
 * POST /api/v1/login  -> login manuale
 * ---------------------------
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const user = await Author.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user);
        res.json({
            accessToken: token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                birthDate: user.birthDate,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * ---------------------------
 * POST /api/v1/logout
 * ---------------------------
 */
router.post("/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(400).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    tokenBlacklist.add(token);
    res.json({ message: "Logged out" });
});

/**
 * ---------------------------
 * GET /api/v1/me  -> dati utente loggato (protetto con JWT)
 * ---------------------------
 */
router.get("/me", authenticate, (req, res) => {
    res.json(req.user);
});

/**
 * ---------------------------
 * GOOGLE OAUTH2
 * ---------------------------
 */

// Step 1: avvia il login con Google
router.get(
    "/login-google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: callback da Google -> genera JWT e redirect al frontend
router.get(
    "/callback-google",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const token = req.user.jwt;
        res.redirect(`${process.env.FRONTEND_HOST}/?jwt=${token}`);
    }
);

export default router;
