import mongoose from "mongoose";
import { connectMongo } from "../config/mongo-config.js";
import categoriaSeeder from "./seeders/categoria-seeder.js";

const runSeeders = async () => {
    try {
        console.log("🌱 Iniciando seeding de la base de datos...");
        
        // Conectar a MongoDB
        await connectMongo();
        console.log("✅ Conectado a MongoDB");

        // Ejecutar seeders
        await categoriaSeeder();

        console.log("🎉 Seeding completado exitosamente!");
        
    } catch (error) {
        console.error("❌ Error durante el seeding:", error);
    } finally {
        // Cerrar conexión
        await mongoose.connection.close();
        console.log("🔌 Conexión a MongoDB cerrada");
        process.exit(0);
    }
};

runSeeders();

export default runSeeders;