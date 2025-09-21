import jwt from "jsonwebtoken";
import "dotenv/config";

const { JWT_SECRET } = process.env;

export const authMiddleware = (req, res, next) => {
    try {
        // Verificar que existe el header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token de acceso requerido" });
        }

        // Verificar que el header tiene formato "Bearer token"
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Formato de token inválido. Use: Bearer <token>" });
        }

        // Extraer el token (segunda parte después del espacio)
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Asignar información del usuario al request
        req.user = {
            id: decoded.id,
            email: decoded.email
        };
        
        // Continuar con el siguiente middleware/controlador
        next();
        
    } catch (error) {
        // Manejar diferentes tipos de errores de JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expirado" });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Token inválido" });
        } else {
            return res.status(401).json({ message: "No se pudo autenticar" });
        }
    }
};