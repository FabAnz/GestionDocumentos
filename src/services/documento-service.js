import documentoRepository from "../repositories/documento-repository.js";
import usuarioRepository from "../repositories/usuario-repository.js";

const documentoService = {

    async createDocumento(documentoData, usuarioId) {
        let documento = null;
        try {
            documento = await documentoRepository.createDocumento(documentoData);
            const usuario = await usuarioRepository.getUserById(usuarioId);
            await usuarioRepository.updateUsuario(
                usuarioId, 
                { documentos: [...usuario.documentos, documento._id] }
            );
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