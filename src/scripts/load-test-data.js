import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Usuario from "../model/usuario.js";
import Documento from "../model/documento.js";
import Categoria from "../model/categoria.js";
import Plan, { PlanPlus, PlanPremium } from "../model/plan.js";

// Cargar variables de entorno
dotenv.config();

// Datos de usuarios de prueba
const usuariosTest = [
    {
        email: "maria.gonzalez@test.com",
        password: "Test123!@",
        nombre: "María",
        apellido: "González",
        tipoPlan: "plus"
    },
    {
        email: "juan.perez@test.com",
        password: "Secure456#$",
        nombre: "Juan",
        apellido: "Pérez",
        tipoPlan: "premium"
    },
    {
        email: "ana.martinez@test.com",
        password: "Strong789%&",
        nombre: "Ana",
        apellido: "Martínez",
        tipoPlan: "plus"
    }
];

// Datos de documentos de prueba (9 por usuario = 27 total)
const documentosTest = [
    // Documentos para María (Usuario 1) - 9 documentos
    {
        titulo: "Guía de inicio rápido para nuevos usuarios",
        contenido: "Este documento proporciona una guía completa para comenzar a utilizar nuestra plataforma. Incluye pasos detallados sobre cómo crear una cuenta, configurar tu perfil, y navegar por las principales funcionalidades. Es ideal para usuarios que están dando sus primeros pasos en el sistema.",
        categoriasNombres: ["F. A. Q."]
    },
    {
        titulo: "Solución de problemas comunes de conexión",
        contenido: "Si experimentas dificultades para conectarte a la plataforma, este documento te ayudará. Revisa tu conexión a internet, limpia el caché del navegador, y verifica que estés usando las credenciales correctas. Si el problema persiste, contacta con soporte técnico para obtener asistencia personalizada.",
        categoriasNombres: ["Soporte técnico", "F. A. Q."]
    },
    {
        titulo: "Preguntas frecuentes sobre la facturación",
        contenido: "Aquí encontrarás respuestas a las preguntas más comunes sobre facturación: ¿Cuándo se realiza el cobro? ¿Qué métodos de pago aceptamos? ¿Cómo puedo descargar mis facturas? ¿Existe algún período de prueba? Todas estas dudas y más están resueltas en este documento.",
        categoriasNombres: ["F. A. Q."]
    },
    {
        titulo: "Tutorial completo de funcionalidades básicas",
        contenido: "Aprende a utilizar todas las funcionalidades básicas de la plataforma. Desde la gestión de tu perfil, hasta la configuración de notificaciones, pasando por la organización de contenidos y el uso del buscador avanzado. Este tutorial te convertirá en un usuario experto en poco tiempo.",
        categoriasNombres: ["F. A. Q.", "Soporte técnico"]
    },
    {
        titulo: "Cómo actualizar tu información de perfil",
        contenido: "Mantén tu perfil actualizado para una mejor experiencia. Puedes cambiar tu nombre, apellido, foto de perfil, información de contacto y preferencias de notificación. Accede a la sección 'Mi Perfil' desde el menú principal y realiza los cambios que necesites. Los cambios se guardan automáticamente.",
        categoriasNombres: ["F. A. Q."]
    },
    {
        titulo: "Guía de navegación por la interfaz",
        contenido: "Familiarízate con cada sección de nuestra interfaz. El menú principal te da acceso a Dashboard, Documentos, Configuración y Soporte. La barra lateral muestra tus accesos rápidos y notificaciones. El pie de página contiene enlaces útiles y recursos adicionales. Navega con confianza conociendo cada elemento.",
        categoriasNombres: ["F. A. Q."]
    },
    {
        titulo: "Resolución de errores al cargar archivos",
        contenido: "Si encuentras problemas al cargar archivos, verifica que el tamaño no supere el límite establecido, que el formato sea compatible, y que tengas permisos suficientes. Los formatos soportados incluyen PDF, DOC, DOCX, TXT y imágenes. El tamaño máximo permitido es de 10MB por archivo.",
        categoriasNombres: ["Soporte técnico"]
    },
    {
        titulo: "Configuración de notificaciones personalizadas",
        contenido: "Personaliza las notificaciones según tus preferencias. Puedes elegir recibir notificaciones por email, push o SMS. Configura qué eventos deseas que te notifiquen: nuevos mensajes, actualizaciones del sistema, recordatorios, o alertas de seguridad. Accede a Configuración > Notificaciones para personalizar tu experiencia.",
        categoriasNombres: ["Soporte técnico", "F. A. Q."]
    },
    {
        titulo: "Preguntas sobre compatibilidad de navegadores",
        contenido: "Nuestra plataforma es compatible con las últimas versiones de Chrome, Firefox, Safari y Edge. Para una experiencia óptima, recomendamos mantener tu navegador actualizado. Si usas Internet Explorer, te sugerimos migrar a un navegador moderno. La plataforma también funciona correctamente en dispositivos móviles.",
        categoriasNombres: ["F. A. Q.", "Soporte técnico"]
    },
    
    // Documentos para Juan (Usuario 2) - 9 documentos
    {
        titulo: "Política de privacidad y protección de datos",
        contenido: "Nuestra empresa se compromete a proteger tu privacidad. Este documento detalla cómo recopilamos, almacenamos y utilizamos tu información personal. Cumplimos con todas las regulaciones de protección de datos vigentes, incluyendo GDPR. Tus datos nunca serán compartidos con terceros sin tu consentimiento explícito.",
        categoriasNombres: ["Políticas de la empresa"]
    },
    {
        titulo: "Términos y condiciones de uso del servicio",
        contenido: "Al utilizar nuestra plataforma, aceptas estos términos y condiciones. Este documento establece las reglas de uso, las responsabilidades del usuario, las limitaciones de responsabilidad, y los procedimientos de cancelación. Te recomendamos leer cuidadosamente este documento antes de continuar usando nuestros servicios.",
        categoriasNombres: ["Políticas de la empresa"]
    },
    {
        titulo: "Guía de configuración avanzada del sistema",
        contenido: "Para usuarios avanzados que desean personalizar su experiencia. Este documento cubre configuraciones de seguridad avanzadas, integraciones con sistemas externos, personalización de la interfaz, y optimización del rendimiento. Requiere conocimientos técnicos intermedios para su implementación correcta.",
        categoriasNombres: ["Soporte técnico"]
    },
    {
        titulo: "Política de uso aceptable de recursos",
        contenido: "Este documento establece las normas de uso aceptable de nuestros servicios. Está prohibido el uso para actividades ilegales, spam, distribución de malware, o cualquier actividad que comprometa la seguridad de la plataforma. El incumplimiento puede resultar en la suspensión inmediata de la cuenta.",
        categoriasNombres: ["Políticas de la empresa"]
    },
    {
        titulo: "Manual de integración con APIs externas",
        contenido: "Conecta nuestra plataforma con tus herramientas favoritas mediante API. Este manual técnico incluye autenticación OAuth2, endpoints disponibles, ejemplos de código en múltiples lenguajes, y límites de rate limiting. Requiere conocimientos de desarrollo web y APIs RESTful para su implementación.",
        categoriasNombres: ["Soporte técnico"]
    },
    {
        titulo: "Código de conducta de la comunidad",
        contenido: "Nuestra comunidad se basa en el respeto mutuo y la colaboración. Este código establece las expectativas de comportamiento para todos los usuarios. Promovemos un ambiente inclusivo, libre de acoso y discriminación. Cualquier violación será investigada y puede resultar en acciones disciplinarias.",
        categoriasNombres: ["Políticas de la empresa"]
    },
    {
        titulo: "Procedimientos de backup y recuperación de datos",
        contenido: "Realizamos backups automáticos diarios de todos los datos. En caso de pérdida de información, puedes solicitar la recuperación a través del panel de soporte. Los backups se conservan por 30 días. Para datos críticos, recomendamos mantener copias locales adicionales como medida de precaución.",
        categoriasNombres: ["Soporte técnico", "Políticas de la empresa"]
    },
    {
        titulo: "Guía de optimización de rendimiento",
        contenido: "Maximiza el rendimiento de la plataforma siguiendo estas recomendaciones: limpia regularmente el caché del navegador, cierra pestañas innecesarias, usa una conexión estable a internet, y mantén actualizado tu sistema operativo. Para operaciones pesadas, te recomendamos usar un equipo con al menos 8GB de RAM.",
        categoriasNombres: ["Soporte técnico"]
    },
    {
        titulo: "Acuerdo de nivel de servicio (SLA)",
        contenido: "Nuestro compromiso es mantener un uptime del 99.9% mensual. Este documento detalla los niveles de servicio garantizados, tiempos de respuesta para diferentes tipos de incidencias, y compensaciones en caso de incumplimiento. Para soporte crítico 24/7, considera actualizar a nuestro plan Premium.",
        categoriasNombres: ["Políticas de la empresa"]
    },
    
    // Documentos para Ana (Usuario 3) - 9 documentos
    {
        titulo: "Cómo recuperar tu contraseña olvidada",
        contenido: "¿Olvidaste tu contraseña? No te preocupes, es un problema común. Haz clic en 'Olvidé mi contraseña' en la página de inicio de sesión, ingresa tu correo electrónico, y recibirás un enlace para restablecer tu contraseña. El enlace es válido por 24 horas. Si no recibes el correo, verifica tu carpeta de spam.",
        categoriasNombres: ["F. A. Q.", "Soporte técnico"]
    },
    {
        titulo: "Política de reembolsos y cancelaciones",
        contenido: "Ofrecemos una garantía de satisfacción de 30 días. Si no estás satisfecho con nuestro servicio, puedes solicitar un reembolso completo dentro de este período. Las cancelaciones pueden realizarse en cualquier momento desde tu panel de usuario. Los reembolsos se procesan en un plazo de 5-10 días hábiles.",
        categoriasNombres: ["Políticas de la empresa", "F. A. Q."]
    },
    {
        titulo: "Mejores prácticas de seguridad para tu cuenta",
        contenido: "Protege tu cuenta siguiendo estas recomendaciones: utiliza una contraseña fuerte y única, activa la autenticación de dos factores, no compartas tus credenciales, cierra sesión en dispositivos compartidos, y revisa regularmente la actividad de tu cuenta. La seguridad es responsabilidad compartida entre la plataforma y el usuario.",
        categoriasNombres: ["Soporte técnico", "Políticas de la empresa"]
    },
    {
        titulo: "Gestión de múltiples dispositivos conectados",
        contenido: "Puedes acceder a tu cuenta desde múltiples dispositivos simultáneamente. Ve a Configuración > Dispositivos para ver todos los dispositivos conectados, su última actividad, y ubicación aproximada. Si detectas un dispositivo no autorizado, puedes cerrar su sesión inmediatamente desde este panel.",
        categoriasNombres: ["Soporte técnico", "F. A. Q."]
    },
    {
        titulo: "Preguntas frecuentes sobre planes y upgrades",
        contenido: "¿Pensando en actualizar tu plan? Aquí respondemos las dudas más comunes: diferencias entre planes, proceso de upgrade, cargos prorrateados, migración de datos, y beneficios adicionales. Puedes cambiar de plan en cualquier momento y solo pagarás la diferencia proporcional del período restante.",
        categoriasNombres: ["F. A. Q."]
    },
    {
        titulo: "Manual de uso del buscador avanzado",
        contenido: "El buscador avanzado te permite encontrar información rápidamente usando filtros y operadores especiales. Usa comillas para frases exactas, el operador AND para múltiples términos, y filtra por fecha, categoría o autor. También puedes guardar búsquedas frecuentes como favoritos para acceso rápido.",
        categoriasNombres: ["Soporte técnico", "F. A. Q."]
    },
    {
        titulo: "Política de retención y eliminación de datos",
        contenido: "Cuando eliminas contenido, este se mueve a la papelera por 30 días antes de la eliminación permanente. Durante este período puedes recuperar cualquier elemento eliminado. Después de 30 días, los datos se eliminan permanentemente de nuestros servidores. Las cuentas inactivas por más de 2 años pueden ser archivadas.",
        categoriasNombres: ["Políticas de la empresa"]
    },
    {
        titulo: "Solución de problemas de sincronización",
        contenido: "Si tus datos no se sincronizan correctamente entre dispositivos, verifica tu conexión a internet, cierra y vuelve a abrir la aplicación, y asegúrate de estar usando la última versión. Si el problema persiste, intenta cerrar sesión y volver a iniciarla. Como último recurso, contacta a soporte técnico.",
        categoriasNombres: ["Soporte técnico"]
    },
    {
        titulo: "Guía de exportación de datos personales",
        contenido: "Tienes derecho a exportar todos tus datos personales en cualquier momento. Ve a Configuración > Privacidad > Exportar Datos. El proceso puede tardar hasta 48 horas dependiendo del volumen de información. Recibirás un correo con un enlace de descarga cuando la exportación esté lista. El archivo estará en formato JSON.",
        categoriasNombres: ["F. A. Q.", "Políticas de la empresa"]
    }
];

/**
 * Crea los planes en la base de datos si no existen
 */
async function crearPlanes() {
    try {
        console.log("📋 Verificando planes...");
        
        // Verificar si ya existen planes
        const planExistente = await Plan.findOne({});
        if (planExistente) {
            console.log("✅ Los planes ya existen");
            return;
        }

        // Crear Plan Plus
        const planPlus = new PlanPlus({
            nombre: "plus",
            respuestaRestantesIA: 10,
            interaccionesConDocumentosRestantes: 10
        });

        // Crear Plan Premium
        const planPremium = new PlanPremium({
            nombre: "premium"
        });

        await planPlus.save();
        await planPremium.save();

        console.log("✅ Planes Plus y Premium creados exitosamente");
    } catch (error) {
        console.error("❌ Error al crear planes:", error);
        throw error;
    }
}

/**
 * Crea usuarios de prueba con contraseñas hasheadas
 */
async function crearUsuarios() {
    try {
        console.log("👥 Creando usuarios de prueba...");

        const usuariosCreados = [];
        const saltRounds = 10;

        for (const userData of usuariosTest) {
            // Verificar si el usuario ya existe
            const usuarioExistente = await Usuario.findOne({ email: userData.email });
            if (usuarioExistente) {
                console.log(`⚠️  Usuario ${userData.email} ya existe, se omite`);
                usuariosCreados.push(usuarioExistente);
                continue;
            }

            // Hashear contraseña
            const passwordHash = await bcrypt.hash(userData.password, saltRounds);

            // Obtener el plan correspondiente
            const plan = await Plan.findOne({ nombre: userData.tipoPlan });
            if (!plan) {
                throw new Error(`Plan ${userData.tipoPlan} no encontrado`);
            }

            // Crear usuario
            const nuevoUsuario = new Usuario({
                email: userData.email,
                password: passwordHash,
                nombre: userData.nombre,
                apellido: userData.apellido,
                plan: plan._id,
                documentos: [],
                chats: []
            });

            await nuevoUsuario.save();
            console.log(`✅ Usuario creado: ${userData.email} (Plan: ${userData.tipoPlan})`);
            usuariosCreados.push(nuevoUsuario);
        }

        return usuariosCreados;
    } catch (error) {
        console.error("❌ Error al crear usuarios:", error);
        throw error;
    }
}

/**
 * Crea documentos de prueba y los asigna a los usuarios
 */
async function crearDocumentos(usuarios) {
    try {
        console.log("📄 Creando documentos de prueba...");

        // Obtener todas las categorías existentes
        const categorias = await Categoria.find({});
        if (categorias.length === 0) {
            throw new Error("No hay categorías disponibles. Ejecuta primero el seed.");
        }

        const documentosCreados = [];
        let docIndex = 0;

        // Crear 9 documentos por cada usuario
        for (let i = 0; i < usuarios.length; i++) {
            const usuario = usuarios[i];
            const documentosUsuario = [];

            for (let j = 0; j < 9; j++) {
                const docData = documentosTest[docIndex];
                
                // Verificar si el documento ya existe
                const documentoExistente = await Documento.findOne({ 
                    titulo: docData.titulo,
                    usuario: usuario._id 
                });

                if (documentoExistente) {
                    console.log(`⚠️  Documento "${docData.titulo}" ya existe, se omite`);
                    documentosUsuario.push(documentoExistente._id);
                    docIndex++;
                    continue;
                }

                // Obtener IDs de las categorías por nombre
                const categoriasDoc = categorias.filter(cat => 
                    docData.categoriasNombres.includes(cat.nombre)
                );

                if (categoriasDoc.length === 0) {
                    console.error(`⚠️  No se encontraron categorías para el documento "${docData.titulo}"`);
                    docIndex++;
                    continue;
                }

                const categoriasIds = categoriasDoc.map(cat => cat._id);

                // Crear documento
                const nuevoDocumento = new Documento({
                    titulo: docData.titulo,
                    categorias: categoriasIds,
                    contenido: docData.contenido,
                    usuario: usuario._id
                });

                await nuevoDocumento.save();
                documentosUsuario.push(nuevoDocumento._id);
                documentosCreados.push(nuevoDocumento);
                
                console.log(`✅ Documento creado: "${docData.titulo}" para ${usuario.email}`);
                docIndex++;
            }

            // Actualizar usuario con los documentos creados
            usuario.documentos = documentosUsuario;
            await usuario.save();
        }

        return documentosCreados;
    } catch (error) {
        console.error("❌ Error al crear documentos:", error);
        throw error;
    }
}

/**
 * Función principal
 */
async function cargarDatosTest() {
    try {
        // Conectar a MongoDB
        console.log("🔌 Conectando a MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Conexión exitosa a MongoDB\n");

        // Ejecutar carga de datos
        await crearPlanes();
        const usuarios = await crearUsuarios();
        await crearDocumentos(usuarios);

        console.log("\n🎉 ¡Carga de datos de prueba completada exitosamente!");
        console.log("\n📊 Resumen:");
        console.log("   - Usuarios creados: 3");
        console.log("   - Documentos creados: 27 (9 por usuario)");
        console.log("   - Planes: Plus y Premium");
        console.log("\n👤 Credenciales de prueba:");
        usuariosTest.forEach(u => {
            console.log(`   - ${u.email} / ${u.password} (${u.tipoPlan})`);
        });

    } catch (error) {
        console.error("\n❌ Error durante la carga de datos:", error);
        process.exit(1);
    } finally {
        // Cerrar conexión
        await mongoose.connection.close();
        console.log("\n🔌 Conexión a MongoDB cerrada");
    }
}

// Ejecutar script
cargarDatosTest();

