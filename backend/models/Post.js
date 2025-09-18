import mongoose from "mongoose";
const { Schema, model } = mongoose;

const commentSchema = new Schema(
    {
        commenterName: { type: String, required: true },
        commenterEmail: { type: String, required: true },
        text: { type: String, required: true },
    },
    { timestamps: true }
);

const blogPostSchema = new Schema(
    {
        category: { type: String, required: true, trim: true },
        title: { type: String, required: true, trim: true },
        cover: { type: String },
        readTime: {
            value: { type: Number, required: true, min: 1 },
            unit: { type: String, required: true, default: "minuti" },
        },
        author: { type: String, required: true, lowercase: true, trim: true }, // email
        content: { type: String, required: true },
        comments: [commentSchema],
    },
    { timestamps: true }
);

export default model("BlogPost", blogPostSchema);
