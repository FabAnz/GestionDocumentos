import chatRepository from "../repositories/chat-repository.js";
import REMITENTE from "../constants/mensaje-constant.js";
import mensajeRepository from "../repositories/mensaje-repository.js";
import fetchService from "./fetch-service.js";
import dotenv from "dotenv";
import usuarioRepository from "../repositories/usuario-repository.js";
import categoriaMensajeRepository from "../repositories/categoria-mensaje-repository.js";

dotenv.config();

const urlIA = process.env.CHATBOT_URL;
const n8nToken = process.env.N8N_JWT_TOKEN;

const mensajeService = {
    async getMensajesPrueba() {
        try {
            const mensajes = await mensajeRepository.getMensajesPrueba();
            return mensajes;
        } catch (error) {
            throw error;
        }
    },
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
                //actualizar usuario
                const usuario = await usuarioRepository.getUserById(userId);
                await usuarioRepository.updateUsuario(userId, { chats: [...usuario.chats, chat._id] });
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
            const mensajeParaIA = { contenido: mensajeData.contenido, idCliente, userId };
            const response = await fetchService.post(urlIA, mensajeParaIA, {
                headers: {
                    "Authorization": `Bearer ${n8nToken}`
                }
            });
            const mensajeIAData = {
                remitente: REMITENTE.IA,
                contenido: response.output
            };
            mensajeIA = await mensajeRepository.createMensaje(mensajeIAData);
            //actualizar chat con respuesta de IA
            chat = await chatRepository.updateChat(chat._id, { mensajes: [...chat.mensajes, mensajeIA._id] });

            //actualizar categoria mensaje
            let categoriaMensaje = null;
            if (response.text) {
                categoriaMensaje = await categoriaMensajeRepository.updateCategoriaMensaje(response.text, userId);
            }
            return { categoriaMensaje, mensajeIA };
        } catch (error) {
            throw error;
        }
    }
}

export default mensajeService;