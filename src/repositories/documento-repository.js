import Documento from "../model/documento.js";

const documentoRepository = {

    async createDocumento(documentoData) {
        const documento = new Documento(documentoData);
        const documentoGuardado = await documento.save();
        return documentoGuardado;
    },

    async getDocumentoById(id) {
        const documento = await Documento.findById(id).populate('categorias');
        return documento;
    },

    async getAllDocumentos() {
        const documentos = await Documento.find().populate('categorias');
        return documentos;
    },

    async deleteDocumento(id) {
        await Documento.findByIdAndDelete(id);
    }
}

export default documentoRepository;