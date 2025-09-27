import chatRepository from "../repositories/chat-repository.js";
import REMITENTE from "../constants/mensaje-constant.js";
import mensajeRepository from "../repositories/mensaje-repository.js";
import fetchService from "./fetch-service.js";
import dotenv from "dotenv";

dotenv.config();

const urlIA = process.env.CHATBOT_URL;

const mensajeService = {
    async probarChat(idCliente, contenido, userId) {
        let chat = null;
        let mensajeCliente = null;
        let mensajeIA = null;
        try {
            chat = await chatRepository.getChatByIdCliente(idCliente, userId);
            //crear chat si no existe
            if (!chat) {
                const chatData = {
                    idCliente,
                    usuario: userId
                }
                chat = await chatRepository.createChat(chatData);
            }
            //crear mensaje
            const mensajeData = {
                remitente: REMITENTE.CLIENTE,
                contenido
            }
            mensajeCliente = await mensajeRepository.createMensaje(mensajeData);
            //actualizar chat
            chat = await chatRepository.updateChat(chat._id, { mensajes: [...chat.mensajes, mensajeCliente._id] });
            //Mandar a IA
            mensajeCliente = { ...mensajeCliente, idCliente };
            const response = await fetchService.post(urlIA, mensajeCliente);
            const mensajeIAData = { 
                remitente: REMITENTE.IA,
                contenido: response.output
            };
            mensajeIA = await mensajeRepository.createMensaje(mensajeIAData);
            //actualizar chat con respuesta de IA
            chat = await chatRepository.updateChat(chat._id, { mensajes: [...chat.mensajes, mensajeIA._id] });

            return mensajeIA;
        } catch (error) {
            throw error;
        }
    }
}

export default mensajeService;