import documentoRepository from "../repositories/documento-repository.js";
import planRepository from "../repositories/plan-repository.js";
import usuarioRepository from "../repositories/usuario-repository.js";
import fetchService from "./fetch-service.js";
import dotenv from "dotenv";
import { PLAN_TYPE } from "../constants/plan-constant.js";
import DOCUMENT_TYPE from "../constants/document-constant.js";
import { badRequestError } from "../errors/400-error.js";
import { getValue, setValue, deleteValue } from "./redis-service.js";

dotenv.config();
const urlCrearModificar = process.env.RAG_URL_CREAR_MODIFICAR;
const urlEliminar = process.env.RAG_URL_ELIMINAR;
const n8nToken = process.env.N8N_JWT_TOKEN;

const documentoService = {

    // ============ MÉTODOS DE LECTURA (con caché) ============

    async getAllDocumentos(userId) {
        try {
            // TODO: Reestablecer redis
            /* const cacheKey = `documentos:usuario:${userId}`;

            // 1. Intentar obtener de caché
            const cachedDocumentos = await getValue(cacheKey);
            if (cachedDocumentos) {
                return cachedDocumentos;
            } */

            // 2. Consultar BD
            const documentos = await documentoRepository.getAllDocumentos(userId);

            // TODO: Reestablecer redis
            //await setValue(cacheKey, documentos, 3600);

            return documentos;
        } catch (error) {
            throw error;
        }
    },

    async getDocumentoById(idDocumento, userId) {
        try {
            const cacheKey = `documento:${idDocumento}:usuario:${userId}`;

            // 1. Intentar obtener de caché
            const cachedDocumento = await getValue(cacheKey);
            if (cachedDocumento) {
                return cachedDocumento;
            }

            // 2. Consultar BD
            const documento = await documentoRepository.getDocumentoById(idDocumento, userId);

            await setValue(cacheKey, documento, 3600);

            return documento;
        } catch (error) {
            throw error;
        }
    },

    // ============ MÉTODOS DE ESCRITURA (con invalidación de caché) ============

    async createDocumento(documentoData, esImagen = false) {
        let documento = null;
        let usuario = null;
        try {
            // Crear documento
            usuario = await usuarioRepository.getUserById(documentoData.usuario);
            documento = await documentoRepository.createDocumento(documentoData, esImagen);
            // Actualizar usuario
            await usuarioRepository.updateUsuario(
                usuario._id,
                { documentos: [...usuario.documentos, documento._id] }
            );

            // Enviar a RAG
            const n8nResponse = await fetchService.post(urlCrearModificar, documento, {
                headers: {
                    "Authorization": `Bearer ${n8nToken}`
                }
            });

            // Si es una imagen, actualizar contenido en la base de datos
            if (esImagen && n8nResponse && n8nResponse.contenido) {
                documento.contenido = n8nResponse.contenido;
                await documentoRepository.updateDocumento(documento._id, documento, documentoData.usuario);
                // Invalidar caché del documento actualizado
                await deleteValue(`documento:${documento._id}:usuario:${documentoData.usuario}`);
            }

            // Decrementar interacciones
            if (usuario.plan.nombre === PLAN_TYPE.PLUS) {
                await planRepository.updatePlanPlus(
                    usuario.plan._id,
                    { interaccionesConDocumentosRestantes: usuario.plan.interaccionesConDocumentosRestantes - 1 }
                );
            }

            // Invalidar caché del listado de documentos del usuario
            await deleteValue(`documentos:usuario:${documentoData.usuario}`);

            return documento;
        } catch (error) {
            // Si falla la actualización del usuario, eliminar el documento creado
            if (documento && documento._id) {
                try {
                    await documentoRepository.deleteDocumento(documento._id, usuario._id);
                } catch (deleteError) {
                    console.error('Error al eliminar documento tras fallo en actualización de usuario:', deleteError);
                }
            }
            throw error;
        }
    },

    async updateDocumento(idDocumento, documentoData, userId, esImagen = false, tieneArchivoNuevo = false) {
        let documento = null;
        let documentoOriginal = null;
        try {
            documentoOriginal = await documentoRepository.getDocumentoById(idDocumento, userId);
            if (!documentoOriginal) {
                throw badRequestError("No se encontró el documento");
            }

            // Si no hay archivo nuevo, mantener contenido y tipo original
            if (!tieneArchivoNuevo) {
                // Preservar contenido original si no se está actualizando
                if (!documentoData.contenido) {
                    documentoData.contenido = documentoOriginal.contenido;
                }
                // Preservar tipo original si no se está cambiando
                if (!documentoData.tipo) {
                    documentoData.tipo = documentoOriginal.tipo;
                    esImagen = documentoOriginal.tipo === DOCUMENT_TYPE.IMAGEN;
                }
                // Preservar urlImagen si es imagen y no se está actualizando
                if (documentoOriginal.tipo === DOCUMENT_TYPE.IMAGEN && !documentoData.urlImagen) {
                    documentoData.urlImagen = documentoOriginal.urlImagen;
                }
            }

            // Verificar si el tipo de documento está cambiando (solo si hay archivo nuevo)
            const tipoOriginal = documentoOriginal.tipo;
            const tipoNuevo = tieneArchivoNuevo ? (esImagen ? DOCUMENT_TYPE.IMAGEN : DOCUMENT_TYPE.TEXTO) : tipoOriginal;
            const cambiaTipo = tieneArchivoNuevo && tipoOriginal !== tipoNuevo;

            // Si cambia el tipo, necesitamos eliminar el antiguo y crear uno nuevo con el mismo ID
            if (cambiaTipo) {
                // Guardar el ID original
                const idOriginal = documentoOriginal._id;
                
                // Eliminar documento antiguo
                await documentoRepository.deleteDocumento(idDocumento, userId);
                
                // Crear nuevo documento con el tipo correcto y el mismo ID
                documentoData._id = idOriginal;
                documentoData.usuario = userId;
                documento = await documentoRepository.createDocumento(documentoData, esImagen);
            } else {
                // Actualizar documento existente usando el modelo específico
                documento = await documentoRepository.updateDocumento(idDocumento, documentoData, userId, esImagen);
            }

            // SIEMPRE enviar documento actualizado a RAG
            const n8nResponse = await fetchService.post(urlCrearModificar, documento, {
                headers: {
                    "Authorization": `Bearer ${n8nToken}`
                }
            });

            // Solo actualizar contenido si hay archivo nuevo y es imagen (esperar respuesta de n8n)
            if (tieneArchivoNuevo && esImagen && n8nResponse && n8nResponse.contenido) {
                documento.contenido = n8nResponse.contenido;
                const idParaActualizar = cambiaTipo ? documento._id : idDocumento;
                await documentoRepository.updateDocumento(idParaActualizar, { contenido: n8nResponse.contenido }, userId, esImagen);
                // Obtener documento actualizado
                documento = await documentoRepository.getDocumentoById(idParaActualizar, userId);
                // Invalidar caché del documento actualizado
                await deleteValue(`documento:${documento._id}:usuario:${userId}`);
            }

            // Invalidar cachés relacionados
            const idParaCache = cambiaTipo ? documento._id : idDocumento;
            await deleteValue([
                `documento:${idParaCache}:usuario:${userId}`,  // Caché del documento individual
                `documentos:usuario:${userId}`                  // Caché del listado del usuario
            ]);

            return documento;
        } catch (error) {
            // Si falla la actualización restaurar el documento original si existe
            if (documentoOriginal && documentoOriginal._id) {
                try {
                    // Si cambió el tipo y falló, intentar restaurar el documento original
                    // Esto es complejo porque ya eliminamos el antiguo, así que solo logueamos el error
                    console.error('Error al actualizar documento, documento original ya fue modificado:', error);
                } catch (restoreError) {
                    console.error('Error al restaurar documento tras fallo en actualización:', restoreError);
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
            await fetchService.delete(`${urlEliminar}/${idDocumento}`, {
                headers: {
                    "Authorization": `Bearer ${n8nToken}`
                }
            });

            // Invalidar cachés relacionados
            await deleteValue([
                `documento:${idDocumento}:usuario:${userId}`,  // Caché del documento individual
                `documentos:usuario:${userId}`                  // Caché del listado del usuario
            ]);

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