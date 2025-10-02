import { createClient } from 'redis';

let redisClient;

export const connectRedis = async () => {
    try {
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
        });

        redisClient.on('reconnecting', () => {
            console.log('🔄 Reconectando a Redis...');
        });

        // Conectar
        await redisClient.connect();
        
        return redisClient;
    } catch (error) {
        console.error('❌ Error crítico al conectar Redis:', error);
        throw error;
    }
};

// Función helper para debug (opcional)
export const printAllRedisData = async () => {
    try {
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