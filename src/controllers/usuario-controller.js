import bcrypt from "bcrypt";
import usuarioService from "../services/usuario-service.js";
import jwt from "jsonwebtoken";
import usuarioRepository from "../repositories/usuario-repository.js";
import { PLAN_TYPE } from "../constants/plan-constant.js";

export const createUsuario = async (req, res) => {
    try {
        const usuario = req.body;
        const { password } = usuario;
        const passwordHash = await bcrypt.hash(password, 10);
        usuario.password = passwordHash;
        const nuevoUsuario = await usuarioService.createUsuarioConPlan(usuario);

        const token = jwt.sign(
            { id: nuevoUsuario._id, email: nuevoUsuario.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        res.status(201).json({ token, usuario: nuevoUsuario });
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
        const token = jwt.sign(
            { id: usuario._id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        // Preparar respuesta del usuario
        const usuarioRespuesta = {
            id: usuario._id,
            email: usuario.email,
            nombre: usuario.nombre
        };

        // Agregar información del plan solo si existe
        if (usuario.plan) {
            const { plan } = usuario;
            const newPlan = {
                id: plan._id,
                nombre: plan.nombre,
            };
            if (plan.nombre === PLAN_TYPE.PLUS) {
                newPlan.cantidadMaximaDocumentos = plan.cantidadMaximaDocumentos;
                newPlan.interaccionesConDocumentosRestantes = plan.interaccionesConDocumentosRestantes;
            }
            usuarioRespuesta.plan = newPlan;
        }

        res.status(200).json({
            token,
            usuario: usuarioRespuesta
        });
    } catch (error) {
        console.error("Error en loginUsuario:", error);
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

export const getUsuarioPorId = async (req, res) => {
    console.log("req.user.id: ", req.user.id);
    try {
        const usuario = await usuarioService.getUsuarioPorId(req.user.id);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
