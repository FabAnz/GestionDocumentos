import Documento, { DocumentoTexto, DocumentoImagen } from "../model/documento.js";
import { permissionError } from "../errors/403-error.js";
import { notFoundError } from "../errors/404-error.js";
import { badRequestError } from "../errors/400-error.js";
import mongoose from "mongoose";

const documentoRepository = {

    async createDocumento(documentoData, esImagen = false) {
        // Usar el modelo específico según el tipo de documento
        const ModeloDocumento = esImagen ? DocumentoImagen : DocumentoTexto;
        const documento = new ModeloDocumento(documentoData);
        const documentoGuardado = await documento.save();
        await documentoGuardado.populate('categoria');
        return documentoGuardado;
    },

    async getDocumentoById(idDocumento, userId) {
        try {

            if (!mongoose.Types.ObjectId.isValid(idDocumento)) {
                throw notFoundError("ID de documento inválido");
            }

            const documento = await Documento.findById(idDocumento).populate('categoria');
            if (!documento) {
                throw notFoundError("No se encontró el documento");
            }
            const usuarioDelDocumento = documento.usuario;
            if (usuarioDelDocumento.toString() !== userId.toString()) {
                throw permissionError("No tienes permisos para acceder a este documento");
            }
            return documento;
        } catch (error) {
            throw error;
        }
    },

    async getAllDocumentos(userId) {
        const documentos = await Documento.find({ usuario: userId }).populate('categoria');
        return documentos;
    },

    async deleteDocumento(idDocumento, userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(idDocumento)) {
                throw notFoundError("ID de documento inválido");
            }
            
            // Verificar que el documento existe y pertenece al usuario
            const documento = await Documento.findById(idDocumento);
            if (!documento) {
                throw notFoundError("No se encontró el documento");
            }
            if (documento.usuario.toString() !== userId.toString()) {
                throw permissionError("No tienes permisos para eliminar este documento");
            }
            
            // Eliminar el documento
            await Documento.findByIdAndDelete(idDocumento);
        } catch (error) {
            throw error;
        }
    },

    async updateDocumento(idDocumento, documentoData, userId) {
        try {
            if (!documentoData) {
                throw badRequestError("No se encontró el documento");
            }
            if (!mongoose.Types.ObjectId.isValid(idDocumento)) {
                throw notFoundError("ID de documento inválido");
            }

            // Verificar que el documento existe y pertenece al usuario
            const documento = await Documento.findById(idDocumento);
            if (!documento) {
                throw notFoundError("No se encontró el documento");
            }
            if (documento.usuario.toString() !== userId.toString()) {
                throw permissionError("No tienes permisos para modificar este documento");
            }

            // Hacer el update solo si tiene permisos
            const documentoActualizado = await Documento.findByIdAndUpdate(idDocumento, documentoData, { new: true }).populate('categoria');
            return documentoActualizado;
        } catch (error) {
            throw error;
        }
    }
}

export default documentoRepository;