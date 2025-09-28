import { connectMongo } from "./mongo-config.js";
import runSeeders from "../scripts/seed.js";
import Categoria from "../model/categoria.js";

const initializeApp = async () => {
    try {
        // Conectar a MongoDB
        await connectMongo();

        // Seeding automático solo en producción
        if (process.env.NODE_ENV === 'production') {
            console.log("🌱 Verificando datos iniciales...");
            
            const existingCategories = await Categoria.countDocuments();
            
            if (existingCategories === 0) {
                await runSeeders();
            } else {
                console.log("✅ Datos iniciales ya existen");
            }
        }
        
        console.log("🚀 Aplicación inicializada correctamente");
    } catch (error) {
        console.error("❌ Error crítico al inicializar la aplicación:", error);
        process.exit(1);
    }
};

export default initializeApp;
