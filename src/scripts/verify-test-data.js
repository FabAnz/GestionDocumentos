import mongoose from "mongoose";
import dotenv from "dotenv";
import Usuario from "../model/usuario.js";
import Plan from "../model/plan.js";
import Documento from "../model/documento.js";

// Cargar variables de entorno
dotenv.config();

/**
 * Verifica que los usuarios de prueba existen y tienen planes asignados
 */
async function verificarDatosTest() {
    try {
        // Conectar a MongoDB
        console.log("🔌 Conectando a MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Conexión exitosa a MongoDB\n");

        console.log("🔍 Verificando usuarios de prueba...\n");

        const emailsTest = [
            "maria.gonzalez@test.com",
            "juan.perez@test.com",
            "ana.martinez@test.com"
        ];

        for (const email of emailsTest) {
            const usuario = await Usuario.findOne({ email }).populate('plan').populate('documentos');
            
            if (!usuario) {
                console.log(`❌ Usuario ${email} NO encontrado`);
                continue;
            }

            console.log(`✅ Usuario: ${usuario.email}`);
            console.log(`   - Nombre: ${usuario.nombre} ${usuario.apellido}`);
            console.log(`   - Plan: ${usuario.plan ? `${usuario.plan.nombre} (ID: ${usuario.plan._id})` : '❌ SIN PLAN'}`);
            console.log(`   - Documentos: ${usuario.documentos ? usuario.documentos.length : 0}`);
            console.log(`   - Password hash (primeros 20 chars): ${usuario.password.substring(0, 20)}...`);
            console.log("");
        }

    } catch (error) {
        console.error("\n❌ Error durante la verificación:", error);
        process.exit(1);
    } finally {
        // Cerrar conexión
        await mongoose.connection.close();
        console.log("🔌 Conexión a MongoDB cerrada");
    }
}

// Ejecutar script
verificarDatosTest();

