import jwt from "jsonwebtoken";
import Author from "../models/Author.js";

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_THIS_SECRET";

// In-memory blacklist dei token (solo per esercizio)
export const tokenBlacklist = new Set();

// middleware: verifica JWT passato in Authorization: Bearer <token>
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer "))
            return res.status(401).json({ message: "No token" });

        const token = authHeader.split(" ")[1];

        if (tokenBlacklist.has(token))
            return res.status(401).json({ message: "Token invalidated" });

        const payload = jwt.verify(token, JWT_SECRET);
        const user = await Author.findById(payload._id).select("-password");
        if (!user) return res.status(401).json({ message: "User not found" });

        req.user = user;
        next();
    } catch (err) {
        return res
            .status(401)
            .json({ message: "Invalid or expired token", error: err.message });
    }
};

// utility per generare token
export const generateToken = (author) => {
    return jwt.sign({ _id: author._id, email: author.email }, JWT_SECRET, {
        expiresIn: "8h",
    });
};
