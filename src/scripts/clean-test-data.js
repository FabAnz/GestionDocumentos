import mongoose from "mongoose";
import dotenv from "dotenv";
import Usuario from "../model/usuario.js";
import Documento from "../model/documento.js";

// Cargar variables de entorno
dotenv.config();

// Emails de los usuarios de prueba a eliminar
const emailsUsuariosTest = [
    "maria.gonzalez@test.com",
    "juan.perez@test.com",
    "ana.martinez@test.com"
];

/**
 * Elimina los usuarios de prueba y sus documentos asociados
 */
async function limpiarDatosTest() {
    try {
        // Conectar a MongoDB
        console.log("🔌 Conectando a MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Conexión exitosa a MongoDB\n");

        console.log("🧹 Limpiando datos de prueba...\n");

        // Buscar usuarios de prueba
        const usuarios = await Usuario.find({ email: { $in: emailsUsuariosTest } });
        
        if (usuarios.length === 0) {
            console.log("⚠️  No se encontraron usuarios de prueba para eliminar");
            return;
        }

        console.log(`📋 Encontrados ${usuarios.length} usuarios de prueba`);

        // Obtener IDs de usuarios
        const usuarioIds = usuarios.map(u => u._id);

        // Eliminar documentos asociados a estos usuarios
        const resultDocumentos = await Documento.deleteMany({ usuario: { $in: usuarioIds } });
        console.log(`✅ ${resultDocumentos.deletedCount} documentos eliminados`);

        // Eliminar usuarios
        const resultUsuarios = await Usuario.deleteMany({ _id: { $in: usuarioIds } });
        console.log(`✅ ${resultUsuarios.deletedCount} usuarios eliminados`);

        console.log("\n🎉 ¡Limpieza completada exitosamente!");
        console.log("\n📊 Resumen:");
        console.log(`   - Usuarios eliminados: ${resultUsuarios.deletedCount}`);
        console.log(`   - Documentos eliminados: ${resultDocumentos.deletedCount}`);

    } catch (error) {
        console.error("\n❌ Error durante la limpieza:", error);
        process.exit(1);
    } finally {
        // Cerrar conexión
        await mongoose.connection.close();
        console.log("\n🔌 Conexión a MongoDB cerrada");
    }
}

// Ejecutar script
limpiarDatosTest();

