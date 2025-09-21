import Usuario from "../model/usuario.js";

const usuarioRepository = {

    async createUsuario(data) {
        try {
            const usuario = new Usuario(data);
            const nuevoUsuario = await usuario.save();
            delete nuevoUsuario._doc.password;
            return nuevoUsuario;
        } catch (error) {
            throw error; // Re-lanzar el error para que se propague
        }
    },

    async updateUsuario(id, data) {
        try {
            const usuarioActualizado = await Usuario.findByIdAndUpdate(
                id, 
                data, 
                { new: true, runValidators: true }
            ).populate('plan');
            if (usuarioActualizado) {
                delete usuarioActualizado._doc.password;
            }
            return usuarioActualizado;
        } catch (error) {
            throw error; // Re-lanzar el error para que se propague
        }
    },

    async deleteUsuario(id) {
        try {
            return await Usuario.findByIdAndDelete(id);
        } catch (error) {
            throw error; // Re-lanzar el error para que se propague
        }
    },

    async getUserByEmail(email) {
        try {
            const usuario = await Usuario.findOne({ email }).populate('plan');
            if (!usuario) {
                return null;
            }
            return usuario;
        } catch (error) {
            throw error; // Re-lanzar el error para que se propague
        }
    },

    async getUserById(id) {
        try {
            const usuario = await Usuario.findById(id).populate('plan');
            if (!usuario) {
                return null;
            }
            delete usuario._doc.password;
            return usuario;
        } catch (error) {
            throw error; // Re-lanzar el error para que se propague
        }
    }

}

export default usuarioRepository;