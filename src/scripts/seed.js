import categoriaSeeder from "./seeders/categoria-seeder.js";
// import planSeeder from "./seeders/plan-seeder.js";        // Futuro seeder
// import usuarioSeeder from "./seeders/usuario-seeder.js";  // Futuro seeder

const runSeeders = async () => {
    try {
        console.log("🌱 Ejecutando seeding automático...");
        
        // Ejecutar seeders en orden
        await categoriaSeeder();
        // await planSeeder();        // Futuro seeder
        // await usuarioSeeder();     // Futuro seeder

        console.log("✅ Seeding completado exitosamente");
        
    } catch (error) {
        console.error("❌ Error durante el seeding:", error);
        throw error; // Re-lanzar para que app-initializer.js lo maneje
    }
};

export default runSeeders;