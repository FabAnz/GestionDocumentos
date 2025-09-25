import Documento from "../model/documento.js";
import { permissionError } from "../errors/403-error.js";
import { notFoundError } from "../errors/404-error.js";
import { badRequestError } from "../errors/400-error.js";
import mongoose from "mongoose";

const documentoRepository = {

    async createDocumento(documentoData) {
        const documento = new Documento(documentoData);
        const documentoGuardado = await documento.save();
        return documentoGuardado;
    },

    async getDocumentoById(idDocumento, userId) {
        try {

            if (!mongoose.Types.ObjectId.isValid(idDocumento)) {
                throw notFoundError("ID de documento inválido");
            }

            const documento = await Documento.findById(idDocumento).populate('categorias');
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
        const documentos = await Documento.find({ usuario: userId }).populate('categorias');
        return documentos;
    },

    async deleteDocumento(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw notFoundError("ID de documento inválido");
            }
            await Documento.findByIdAndDelete(id);
        } catch (error) {
            throw error;
        }
    },

    async updateDocumento(idDocumento, documentoData, userId) {
        try {
            if(!documentoData) {
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
            const documentoActualizado = await Documento.findByIdAndUpdate(idDocumento, documentoData, { new: true }).populate('categorias');
            return documentoActualizado;
        } catch (error) {
            throw error;
        }
    }
}

export default documentoRepository;