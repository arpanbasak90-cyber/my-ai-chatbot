import mongoose, { Schema, models, model } from "mongoose";

const ChatSchema = new Schema(
    {
        sessionId: {
            type: String,
            required: false,
            index: true,
        },
        title: {
            type: String,
            required: false,
            default: "New Chat",
        },
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Chat = models.Chat || model("Chat", ChatSchema);

export default Chat;