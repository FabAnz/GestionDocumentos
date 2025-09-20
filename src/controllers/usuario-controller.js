import bcrypt from "bcrypt";
import usuarioService from "../services/usuario-service.js";

export const createUsuario = async (req, res) => {
    try {
        const usuario = req.body;
        const { password } = usuario;
        const passwordHash = await bcrypt.hash(password, 10);
        usuario.password = passwordHash;
        const nuevoUsuario = await usuarioService.createUsuarioConPlan(usuario);
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        // Manejar error de email duplicado
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: "El email ya está registrado" 
            });
        }
        
        // Otros errores
        res.status(500).json({ message: error.message });
    }
}
