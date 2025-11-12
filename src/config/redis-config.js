import { createClient } from 'redis';

let redisClient;
let isReconnecting = false;

/**
 * Verifica si el cliente de Redis está conectado y listo
 * @returns {boolean}
 */
export const isRedisConnected = () => {
    return redisClient && redisClient.isReady;
};

/**
 * Verifica si el cliente de Redis está cerrado
 * @returns {boolean}
 */
export const isRedisClosed = () => {
    return !redisClient || redisClient.isOpen === false;
};

/**
 * Intenta reconectar Redis si está cerrado
 */
export const ensureRedisConnection = async () => {
    if (isRedisConnected()) {
        return true;
    }

    if (isRedisClosed() && !isReconnecting) {
        console.log('🔄 Redis desconectado, intentando reconectar...');
        isReconnecting = true;
        try {
            await connectRedis();
            isReconnecting = false;
            return true;
        } catch (error) {
            isReconnecting = false;
            console.error('❌ Error al reconectar Redis:', error.message);
            return false;
        }
    }

    return false;
};

export const connectRedis = async () => {
    try {
        // Si ya existe un cliente y está conectado, no hacer nada
        if (redisClient && redisClient.isReady) {
            return redisClient;
        }

        // Si existe un cliente pero está cerrado, crear uno nuevo
        if (redisClient && redisClient.isOpen === false) {
            try {
                await redisClient.quit();
            } catch (error) {
                // Ignorar errores al cerrar cliente anterior
            }
        }

        redisClient = createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.log('🔴 Redis: Máximo número de reintentos alcanzado');
                        return new Error('Demasiados reintentos');
                    }
                    return retries * 100; // Espera incremental
                }
            }
        });

        // Manejadores de eventos
        redisClient.on('error', (err) => {
            console.error('❌ Error de Redis:', err.message);
        });

        redisClient.on('connect', () => {
            console.log('🔌 Conectando a Redis...');
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis conectado y listo');
            isReconnecting = false;
        });

        redisClient.on('reconnecting', () => {
            console.log('🔄 Reconectando a Redis...');
        });

        redisClient.on('end', () => {
            console.log('⚠️ Redis: Conexión cerrada');
            isReconnecting = false;
        });

        redisClient.on('close', () => {
            console.log('⚠️ Redis: Cliente cerrado');
            isReconnecting = false;
        });

        // Conectar
        await redisClient.connect();
        
        return redisClient;
    } catch (error) {
        console.error('❌ Error crítico al conectar Redis:', error);
        isReconnecting = false;
        throw error;
    }
};

// Función helper para debug (opcional)
export const printAllRedisData = async () => {
    try {
        // Verificar y reconectar si es necesario
        await ensureRedisConnection();
        
        if (!isRedisConnected()) {
            console.warn('⚠️ Redis no está conectado, no se pueden leer datos');
            return;
        }

        const keys = await redisClient.keys('*');
        console.log('🔑 Claves en Redis:', keys.length);
        
        for (const key of keys) {
            const value = await redisClient.get(key);
            const ttl = await redisClient.ttl(key);
            console.log(`  ${key}: ${value} (TTL: ${ttl}s)`);
        }
    } catch (error) {
        console.error('Error al leer datos de Redis:', error);
    }
};

export { redisClient };