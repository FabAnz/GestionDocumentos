import documentoRepository from "../repositories/documento-repository.js";
import usuarioRepository from "../repositories/usuario-repository.js";
import fetchService from "./fetch-service.js";
import dotenv from "dotenv";

dotenv.config();

const documentoService = {

    async createDocumento(documentoData, usuarioId) {
        let documento = null;
        const url = process.env.RAG_URL;
        console.log(url);
        try {
            documento = await documentoRepository.createDocumento(documentoData);
            const usuario = await usuarioRepository.getUserById(usuarioId);
            await usuarioRepository.updateUsuario(
                usuarioId,
                { documentos: [...usuario.documentos, documento._id] }
            );
            const response = await fetchService.post(url, documento);
            //const response = await fetchService.post("https://n8n-personal.fantunez.com/webhook/c0b289b8-36dd-4a30-8d39-8a8a30994ca4", documento);
            console.log(response);
            return documento;
        } catch (error) {
            // Si falla la actualización del usuario, eliminar el documento creado
            if (documento && documento._id) {
                try {
                    await documentoRepository.deleteDocumento(documento._id);
                } catch (deleteError) {
                    console.error('Error al eliminar documento tras fallo en actualización de usuario:', deleteError);
                }
            }
            throw error;
        }
    }
}

export default documentoService;