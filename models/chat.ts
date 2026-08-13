import mongoose, { Schema, models, model } from "mongoose";

const ChatSchema = new Schema(
    {
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