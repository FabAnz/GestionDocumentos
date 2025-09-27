import Chat from "../model/chat.js";
import { permissionError } from "../errors/403-error.js";

const chatRepository = {
    async createChat(chatData) {
        const chat = new Chat(chatData);
        const chatGuardado = await chat.save();
        return chatGuardado;
    },
    async getChatByIdCliente(idCliente, userId) {
        try {
            const chat = await Chat.findOne({ idCliente }).populate('mensajes');
            if (chat && chat.usuario.toString() !== userId.toString()) {
                throw permissionError("No tienes permisos para acceder a este chat");
            }
            return chat;
        } catch (error) {
            throw error;
        }
    },
    async updateChat(idChat, chatData) {
        const chat = await Chat.findByIdAndUpdate(idChat, chatData, { new: true }).populate('mensajes');
        return chat;
    }
}

export default chatRepository;