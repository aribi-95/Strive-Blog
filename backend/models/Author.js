import mongoose from "mongoose";

const { Schema, model } = mongoose; // ✅ Schema è corretto

const authorSchema = new Schema(
    {
        nome: { type: String, required: true },
        cognome: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        dataDiNascita: { type: String, required: true },
        avatar: { type: String },
    },
    { timestamps: true }
);

export default model("Author", authorSchema);
