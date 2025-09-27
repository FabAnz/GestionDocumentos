import mongoose from "mongoose";
import chatSchema from "./schemas/chat-schema.js";
import "./mensaje.js";

const Chat = mongoose.model("Chat", chatSchema, "chats");

export default Chat;