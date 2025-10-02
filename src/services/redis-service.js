import { redisClient } from '../config/redis-config.js';

/**
 * Guarda un valor en Redis con tiempo de expiración opcional
 * @param {string} key - Clave
 * @param {any} value - Valor (se serializará a JSON si es objeto)
 * @param {number|null} timeExpiration - Tiempo en segundos (null = sin expiración)
 */
export const setValue = async (key, value, timeExpiration = null) => {
    try {
        const serializedValue = typeof value === 'string' 
            ? value 
            : JSON.stringify(value);

        if (timeExpiration) {
            await redisClient.setEx(key, timeExpiration, serializedValue);
        } else {
            await redisClient.set(key, serializedValue);
        }
        
        console.log(`📝 Redis SET: ${key} (TTL: ${timeExpiration || 'sin expiración'})`);
    } catch (error) {
        console.error(`❌ Error al guardar en Redis [${key}]:`, error.message);
        throw error;
    }
};

/**
 * Obtiene un valor de Redis
 * @param {string} key - Clave a buscar
 * @returns {any} - Valor deserializado o null si no existe
 */
export const getValue = async (key) => {
    try {
        const value = await redisClient.get(key);
        
        if (!value) {
            console.log(`🔍 Redis GET: ${key} - NO ENCONTRADO`);
            return null;
        }

        // Intentar deserializar JSON
        try {
            const parsed = JSON.parse(value);
            console.log(`✅ Redis GET: ${key} - ENCONTRADO (cache hit)`);
            return parsed;
        } catch {
            // Si no es JSON, devolver string
            console.log(`✅ Redis GET: ${key} - ENCONTRADO (string)`);
            return value;
        }
    } catch (error) {
        console.error(`❌ Error al obtener de Redis [${key}]:`, error.message);
        return null; // Fallar silenciosamente
    }
};

/**
 * Elimina una o varias claves de Redis
 * @param {string|string[]} keys - Clave o array de claves a eliminar
 */
export const deleteValue = async (keys) => {
    try {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        const deleted = await redisClient.del(keysArray);
        console.log(`🗑️ Redis DEL: ${keysArray.join(', ')} - ${deleted} eliminadas`);
        return deleted;
    } catch (error) {
        console.error(`❌ Error al eliminar de Redis:`, error.message);
        throw error;
    }
};

/**
 * Verifica si una clave existe
 * @param {string} key - Clave a verificar
 * @returns {boolean}
 */
export const exists = async (key) => {
    try {
        const result = await redisClient.exists(key);
        return result === 1;
    } catch (error) {
        console.error(`❌ Error al verificar existencia en Redis [${key}]:`, error.message);
        return false;
    }
};

/**
 * Obtiene el TTL (tiempo de vida) de una clave
 * @param {string} key - Clave
 * @returns {number} - Segundos restantes (-1 = sin expiración, -2 = no existe)
 */
export const getTTL = async (key) => {
    try {
        return await redisClient.ttl(key);
    } catch (error) {
        console.error(`❌ Error al obtener TTL de Redis [${key}]:`, error.message);
        return -2;
    }
};

/**
 * Limpia todas las claves de Redis (¡USAR CON CUIDADO!)
 */
export const flushAll = async () => {
    try {
        await redisClient.flushAll();
        console.log('🧹 Redis: Todas las claves eliminadas');
    } catch (error) {
        console.error('❌ Error al limpiar Redis:', error.message);
        throw error;
    }
};