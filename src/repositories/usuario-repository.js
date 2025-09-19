import Usuario from "../model/usuario.js";

const usuarioRepository = {

    async createUsuario(data) {
        try {
            const usuario = new Usuario(data);
            const nuevoUsuario = await usuario.save();
            delete nuevoUsuario._doc.password;
            return nuevoUsuario;
        } catch (error) {
            console.log('No se pudo crear el usuario en la base de datos', error);
        }
    }
}

export default usuarioRepository;