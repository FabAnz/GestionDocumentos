import bcrypt from "bcrypt";
import usuarioService from "../services/usuario-service.js";
import jwt from "jsonwebtoken";
import usuarioRepository from "../repositories/usuario-repository.js";

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
            return res.status(409).json({ 
                message: "El email ya está registrado" 
            });
        }
        
        // Otros errores
        res.status(500).json({ message: error.message });
    }
}

export const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await usuarioRepository.getUserByEmail(email);
        if (!usuario) {
            return res.status(401).json({ message: "Usuario y/o contraseña incorrectos" });
        }
        const passwordMatch = await bcrypt.compare(password, usuario.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Usuario y/o contraseña incorrectos" });
        }
        const token = jwt.sign({ id: usuario._id, email: usuario.email }, process.env.JWT_SECRET);
        res.status(200).json({ 
            token, 
            usuario: {
                id: usuario._id,
                email: usuario.email,
                nombre: usuario.nombre,
                plan: {
                    id: usuario.plan._id,
                    nombre: usuario.plan.nombre                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const upgradePlan = async (req, res) => {
    try {
        const updatedUsuario = await usuarioService.upgradePlan(req.usuarioCompleto);
        res.status(200).json(updatedUsuario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
