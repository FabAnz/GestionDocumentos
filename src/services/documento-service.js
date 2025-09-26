import documentoRepository from "../repositories/documento-repository.js";
import planRepository from "../repositories/plan-repository.js";
import usuarioRepository from "../repositories/usuario-repository.js";
import fetchService from "./fetch-service.js";
import dotenv from "dotenv";
import { PLAN_TYPE } from "../constants/plan-constant.js";
import { badRequestError } from "../errors/400-error.js";

dotenv.config();
const urlCrearModificar = process.env.RAG_URL_CREAR_MODIFICAR;
const urlEliminar = process.env.RAG_URL_ELIMINAR;

const documentoService = {

    async createDocumento(documentoData) {
        let documento = null;
        try {
            // Validar límites
            const usuario = await usuarioRepository.getUserById(documentoData.usuario);
            const { _id, nombre, interaccionesConDocumentosRestantes } = usuario.plan;


            if (nombre === PLAN_TYPE.PLUS && interaccionesConDocumentosRestantes <= 0) {
                throw new Error("LIMITE_ALCANZADO");
            }

            // Crear documento
            documento = await documentoRepository.createDocumento(documentoData);

            // Actualizar usuario
            await usuarioRepository.updateUsuario(
                usuario._id,
                { documentos: [...usuario.documentos, documento._id] }
            );


            // Enviar a RAG
            const response = await fetchService.post(urlCrearModificar, documento);
            console.log(response);

            // Decrementar interacciones
            if (nombre === PLAN_TYPE.PLUS) {
                await planRepository.updatePlanPlus(
                    _id,
                    { interaccionesConDocumentosRestantes: interaccionesConDocumentosRestantes - 1 }
                );
            }
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
    },

    async updateDocumento(idDocumento, documentoData, userId) {
        let documento = null;
        try {
            documento = await documentoRepository.getDocumentoById(idDocumento, userId);
            if (!documento) {
                throw badRequestError("No se encontró el documento");
            }
            const documentoActualizado = await documentoRepository.updateDocumento(idDocumento, documentoData, userId);

            // Enviar a RAG
            const response = await fetchService.post(urlCrearModificar, documentoActualizado);
            console.log(response);

            return documentoActualizado;
        } catch (error) {
            // Si falla la actualización restaurar el documento
            if (documento && documento._id) {
                try {
                    await documentoRepository.updateDocumento(idDocumento, documento, userId);
                } catch (updateError) {
                    console.error('Error al restaurar documento tras fallo en actualización:', updateError);
                }
            }
            throw error;
        }
    },

    async deleteDocumento(idDocumento, userId) {
        let documento = null;
        try {
            documento = await documentoRepository.deleteDocumento(idDocumento, userId);

            //Eliminar del RAG
            const response = await fetchService.delete(`${urlEliminar}/${idDocumento}`);
            console.log(response);

        } catch (error) {
            if (documento && documento._id) {
                try {
                    await documentoRepository.createDocumento(documento);
                } catch (createError) {
                    console.error('Error al crear documento tras fallo en eliminación:', createError);
                }
            }
            throw error;
        }
    }
}

export default documentoService;