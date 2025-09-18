import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String },
        googleId: { type: String, unique: true, sparse: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        birthDate: { type: String },
        avatar: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model("Author", authorSchema);
