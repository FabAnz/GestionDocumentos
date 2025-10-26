import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Usuario from "../model/usuario.js";
import Categoria from "../model/categoria.js";
import Plan, { PlanPlus, PlanPremium } from "../model/plan.js";
import documentoService from "../services/documento-service.js";
import { connectRedis } from "../config/redis-config.js";

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
      contenido: `MANUAL DE BIENVENIDA Y CONFIGURACIÓN INICIAL

1. INTRODUCCIÓN
Bienvenido a TechCorp Solutions. Este manual ha sido diseñado para facilitar tu integración a nuestra plataforma empresarial de gestión documental y comunicación interna. Nuestro sistema ha sido implementado en más de 500 empresas a nivel global y procesamos más de 2 millones de documentos mensualmente.

2. REQUISITOS DEL SISTEMA
Antes de comenzar, asegúrate de contar con:
- Navegador web actualizado (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Conexión a internet estable (mínimo 5 Mbps)
- Resolución de pantalla mínima de 1280x720 píxeles
- JavaScript y cookies habilitados en tu navegador

3. CREACIÓN DE CUENTA
3.1. Acceso al portal
Ingresa a https://app.techcorp.com y haz clic en "Crear cuenta nueva". Serás redirigido al formulario de registro.

3.2. Datos requeridos
- Correo electrónico corporativo válido
- Contraseña segura (mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos)
- Nombre y apellido completos
- Departamento o área de trabajo

3.3. Verificación de correo
Revisa tu bandeja de entrada y haz clic en el enlace de verificación. Si no recibes el correo en 5 minutos, revisa la carpeta de spam o solicita un nuevo envío.

4. CONFIGURACIÓN DEL PERFIL
Una vez verificada tu cuenta, completa tu perfil:
- Sube una foto de perfil profesional (formato JPG/PNG, máx. 2MB)
- Configura tu zona horaria
- Establece tu idioma preferido
- Define tu cargo y área de responsabilidad

5. NAVEGACIÓN BÁSICA
El menú principal se encuentra en la barra lateral izquierda:
- Dashboard: Vista general de tu actividad
- Documentos: Biblioteca de archivos personales y compartidos
- Chats: Sistema de mensajería con IA integrada
- Configuración: Preferencias y ajustes de cuenta

6. PRIMEROS PASOS RECOMENDADOS
- Completa tu perfil al 100%
- Explora el tutorial interactivo
- Revisa las políticas de la empresa
- Configura tus notificaciones
- Únete a los canales de tu departamento

7. SOPORTE TÉCNICO
Si necesitas ayuda, contacta a soporte@techcorp.com o utiliza el chat en vivo disponible 24/7.`,
      categoriasNombres: ["F. A. Q."]
   },
   {
      titulo: "Solución de problemas comunes de conexión",
      contenido: `GUÍA DE RESOLUCIÓN DE PROBLEMAS DE CONECTIVIDAD

DOCUMENTO TÉCNICO - DEPARTAMENTO DE SOPORTE
Última actualización: 2025 | Versión 3.2

1. DIAGNÓSTICO INICIAL
Cuando experimentes problemas de conexión a la plataforma TechCorp, realiza primero estos pasos básicos de diagnóstico antes de contactar al soporte técnico.

2. PROBLEMAS MÁS COMUNES Y SOLUCIONES

2.1. ERROR: "No se puede establecer conexión con el servidor"
CAUSAS POSIBLES:
- Conexión a internet interrumpida o inestable
- Firewall corporativo bloqueando el acceso
- Servidor en mantenimiento programado

SOLUCIONES:
a) Verifica tu conexión a internet abriendo otros sitios web
b) Desactiva temporalmente el VPN si lo estás usando
c) Consulta el estado del servidor en status.techcorp.com
d) Intenta acceder desde una red diferente

2.2. ERROR: "Tiempo de espera agotado"
Este error indica que la solicitud al servidor tardó demasiado en responder.

PASOS A SEGUIR:
1. Cierra todas las pestañas innecesarias del navegador
2. Limpia la caché y cookies del navegador
3. Reinicia tu router/módem
4. Si el problema persiste, contacta a tu administrador de red

2.3. ERROR: "Credenciales inválidas"
Aunque tus credenciales sean correctas, pueden aparecer errores de autenticación.

VERIFICACIONES:
- Asegúrate de que la tecla Bloq Mayús no está activada
- Copia y pega tu contraseña desde un gestor de contraseñas
- Utiliza la función "Olvidé mi contraseña" para restablecer acceso
- Verifica que tu cuenta no haya sido bloqueada por intentos fallidos

3. PROBLEMAS DE RENDIMIENTO LENTO

3.1. Limpieza de caché del navegador
CHROME: Settings > Privacy and Security > Clear browsing data
FIREFOX: Options > Privacy & Security > Cookies and Site Data
SAFARI: Preferences > Privacy > Manage Website Data
EDGE: Settings > Privacy > Choose what to clear

3.2. Desactivar extensiones conflictivas
Algunas extensiones del navegador pueden interferir con la plataforma. Desactívalas temporalmente:
- Bloqueadores de publicidad agresivos
- Extensiones de seguridad de terceros
- Modificadores de proxy o VPN

4. VERIFICACIÓN DE REQUISITOS DEL SISTEMA
Confirma que cumples con los requisitos mínimos:
- Ancho de banda: mínimo 5 Mbps (recomendado 10 Mbps)
- Latencia: máximo 150ms al servidor
- Navegador: versión lanzada en los últimos 12 meses

5. HERRAMIENTAS DE DIAGNÓSTICO
Utiliza estas herramientas para identificar problemas:
- speedtest.net para medir tu velocidad de internet
- ping techcorp.com para verificar conectividad
- Modo incógnito del navegador para descartar problemas de extensiones

6. CUÁNDO CONTACTAR A SOPORTE
Contacta al equipo de soporte técnico si:
- Los problemas persisten después de seguir todos los pasos
- Recibes mensajes de error no documentados aquí
- Múltiples usuarios reportan el mismo problema
- El servicio está caído según status.techcorp.com

INFORMACIÓN A PROPORCIONAR AL SOPORTE:
- Capturas de pantalla de los errores
- Navegador y versión que estás usando
- Pasos exactos para reproducir el problema
- Hora aproximada en que comenzó el inconveniente

Ticket de soporte: support.techcorp.com
Email: soporte@techcorp.com
Teléfono: +1-800-TECH-CORP (disponible 24/7)`,
      categoriasNombres: ["Soporte técnico", "F. A. Q."]
   },
   {
      titulo: "Preguntas frecuentes sobre la facturación",
      contenido: `FAQ - DEPARTAMENTO DE ADMINISTRACIÓN Y FINANZAS
Documento oficial | Última revisión: Enero 2025

P1: ¿Cuándo se realiza el cobro de mi suscripción?
R: Los cobros se realizan el mismo día del mes en que contrataste el servicio. Por ejemplo, si te suscribiste el 15 de enero, se te cobrará el 15 de cada mes. Enviamos notificaciones 7 días antes, 3 días antes y confirmación 1 día después del cobro.

P2: ¿Qué métodos de pago aceptan?
R: Aceptamos tarjetas de crédito/débito (Visa, MasterCard, American Express), PayPal, transferencias bancarias (planes anuales), y criptomonedas (Bitcoin, Ethereum) para planes Premium. Para tarjetas corporativas, debes proporcionar razón social, NIF/CIF y dirección fiscal.

P3: ¿Cómo descargo mis facturas?
R: Accede a Configuración > Facturación > Historial de facturas. Todas las facturas están disponibles en formato PDF con firma digital, 24 horas después de cada pago. Se conservan durante toda la vida de la cuenta más 5 años adicionales.

P4: ¿Existe período de prueba?
R: Sí, ofrecemos 14 días completos de prueba con acceso a todas las funcionalidades Premium. No requiere tarjeta de crédito para empezar. Límites durante la prueba: 5 documentos y 20 consultas a IA. Obtén 20% de descuento si contratas un plan anual durante el período de prueba.

P5: ¿Cuál es su política de reembolsos?
R: Garantizamos reembolso completo dentro de los primeros 30 días si no estás satisfecho. Condiciones: no haber excedido el 50% del uso mensual y no haber violado los términos de servicio. El reembolso se procesa en 5-10 días hábiles al método de pago original.

P6: ¿Qué sucede si falla el pago?
R: Intentamos procesar el cargo nuevamente después de 24 horas. Después de 3 intentos fallidos (72 horas), la cuenta se suspende temporalmente. Tienes 15 días adicionales para regularizar el pago antes de la cancelación definitiva.

P7: ¿Aplican impuestos a mi factura?
R: Sí, aplicamos impuestos locales según tu ubicación: IVA europeo, Sales Tax en USA, GST 10% en Australia. El sistema detecta automáticamente tu ubicación y aplica la tasa correspondiente.

P8: ¿Puedo cambiar mi método de pago?
R: Sí, en cualquier momento desde Configuración > Facturación > Métodos de pago. Los cambios surten efecto inmediatamente para el próximo ciclo.

P9: ¿Facturan en mi moneda local?
R: Soportamos USD, EUR, GBP, CAD, AUD, BRL, MXN, COP, ARS, CLP, PEN. Usamos el tipo de cambio de Visa/MasterCard del día de la transacción sin recargos adicionales.

Para consultas específicas: billing@techcorp.com | Tel: +1-800-BILLING`,
      categoriasNombres: ["F. A. Q."]
   },
   {
      titulo: "Tutorial completo de funcionalidades básicas",
      contenido: `TUTORIAL INTERACTIVO - FUNCIONALIDADES ESENCIALES
Manual de usuario v4.0 | TechCorp Solutions

MÓDULO 1: GESTIÓN DEL PERFIL
Tu perfil es el centro de tu identidad en la plataforma. Mantenerlo actualizado mejora tu experiencia y colaboración con el equipo.

PASOS PARA EDITAR TU PERFIL:
1. Haz clic en tu avatar (esquina superior derecha)
2. Selecciona "Mi Perfil"
3. Campos editables:
   - Nombre y apellido
   - Foto de perfil (JPG/PNG, máx 2MB)
   - Cargo y departamento
   - Teléfono de contacto
   - Bio profesional (máx 500 caracteres)
   - Enlaces a redes sociales

CONFIGURACIÓN DE PRIVACIDAD:
Define quién puede ver tu información:
- Público: Visible para toda la empresa
- Equipo: Solo tu departamento
- Privado: Solo administradores

MÓDULO 2: GESTIÓN DE DOCUMENTOS
El corazón de la plataforma. Organiza, comparte y colabora en documentos.

CREAR UN DOCUMENTO:
1. Dashboard > Botón "Nuevo Documento"
2. Introduce título descriptivo (máx 200 caracteres)
3. Selecciona al menos una categoría
4. Escribe o pega el contenido (máx 10,000 caracteres)
5. Haz clic en "Guardar"

ORGANIZACIÓN POR CATEGORÍAS:
- F.A.Q.: Preguntas frecuentes
- Soporte técnico: Manuales y guías técnicas
- Políticas de la empresa: Normas y procedimientos

COMPARTIR DOCUMENTOS:
- Opción "Compartir" en cada documento
- Genera enlace público o privado
- Define permisos: Solo lectura / Edición
- Establece fecha de expiración del enlace

MÓDULO 3: SISTEMA DE BÚSQUEDA AVANZADA
Encuentra información rápidamente con nuestro potente buscador.

BÚSQUEDA BÁSICA:
Escribe términos en la barra de búsqueda. El sistema busca en títulos y contenido de todos tus documentos.

OPERADORES AVANZADOS:
- Comillas "": busca frase exacta
- AND: todos los términos deben aparecer
- OR: cualquier término puede aparecer
- NOT: excluye términos específicos
- Asterisco *: comodín para cualquier palabra

FILTROS DISPONIBLES:
- Por categoría
- Por fecha de creación/modificación
- Por autor
- Por estado (borrador/publicado)

MÓDULO 4: NOTIFICACIONES
Mantente informado de eventos importantes sin saturar tu bandeja de entrada.

CANALES DE NOTIFICACIÓN:
- Email: Resúmenes diarios o alertas inmediatas
- Push: Notificaciones en tiempo real en navegador
- In-app: Centro de notificaciones dentro de la plataforma

TIPOS DE EVENTOS CONFIGURABLES:
- Nuevos comentarios en tus documentos
- Documentos compartidos contigo
- Menciones con @tunombre
- Actualizaciones del sistema
- Alertas de seguridad
- Recordatorios personalizados

CONFIGURAR NOTIFICACIONES:
Configuración > Notificaciones > Personalizar eventos
Activa/desactiva según tu preferencia y establece horario de silencio (ej: 22:00 - 8:00).

MÓDULO 5: CHAT CON IA
Interactúa con nuestro asistente de inteligencia artificial para obtener respuestas instantáneas.

INICIAR UN CHAT:
1. Haz clic en el ícono de chat (esquina inferior derecha)
2. Escribe tu pregunta en lenguaje natural
3. La IA busca en tu biblioteca de documentos
4. Recibes respuesta con referencias a documentos originales

MEJORES PRÁCTICAS:
- Sé específico en tus preguntas
- Proporciona contexto cuando sea necesario
- Usa el historial de chat para continuidad
- Califica las respuestas para mejorar el sistema

Completar este tutorial: 15-20 minutos
Certificación disponible al finalizar los 5 módulos`,
      categoriasNombres: ["F. A. Q.", "Soporte técnico"]
   },
   {
      titulo: "Cómo actualizar tu información de perfil",
      contenido: `GUÍA DE ACTUALIZACIÓN DE PERFIL CORPORATIVO

1. IMPORTANCIA DE MANTENER TU PERFIL ACTUALIZADO
Un perfil completo y actualizado facilita la colaboración, mejora la comunicación entre equipos y ayuda a otros a conocer tu rol en la organización. Los perfiles completos tienen 3 veces más interacciones que los perfiles básicos.

2. ACCESO A CONFIGURACIÓN DE PERFIL
Existen tres formas de acceder:
a) Haz clic en tu avatar (esquina superior derecha) > "Mi Perfil"
b) Menú lateral > Configuración > Perfil de usuario
c) Atajo de teclado: Ctrl+P (Cmd+P en Mac)

3. SECCIONES EDITABLES DEL PERFIL

3.1. INFORMACIÓN PERSONAL
- Nombre: Entre 2-50 caracteres
- Apellido: Entre 2-50 caracteres
- Email: No modificable (contacta a RRHH para cambios)
- Teléfono: Formato internacional (+código país)
- Fecha de nacimiento: Opcional, solo visible para RRHH

3.2. INFORMACIÓN PROFESIONAL
- Cargo actual: Selecciona de la lista predefinida o personaliza
- Departamento: Asignado por tu gerente
- Ubicación: Oficina principal, sede o remoto
- Fecha de inicio: Se completa automáticamente al crear la cuenta
- Gerente directo: Asignado automáticamente, no editable

3.3. FOTO DE PERFIL
REQUISITOS TÉCNICOS:
- Formatos aceptados: JPG, JPEG, PNG
- Tamaño máximo: 2MB
- Dimensiones recomendadas: 400x400 píxeles (cuadrado)
- La imagen se recorta automáticamente a circular

RECOMENDACIONES PARA UNA BUENA FOTO:
✓ Usa una foto profesional reciente
✓ Fondo neutro y bien iluminado
✓ Tu rostro debe ocupar el 60-70% del encuadre
✓ Vestimenta profesional acorde al código de la empresa
✗ Evita fotos de cuerpo completo o muy lejanas
✗ No uses filtros excesivos o efectos
✗ Evita fotos en eventos sociales o casuales

3.4. BIOGRAFÍA PROFESIONAL
Espacio para describir tu experiencia y especialización (máximo 500 caracteres).

ESTRUCTURA SUGERIDA:
- Rol actual y responsabilidades principales
- Áreas de especialización o experticia
- Proyectos destacados en los que has trabajado
- Intereses profesionales

EJEMPLO:
"Especialista en Análisis de Datos con 8 años de experiencia. Lidero el equipo de Business Intelligence enfocado en optimización de procesos. Experto en Python, SQL y herramientas de visualización. Apasionado por convertir datos en decisiones estratégicas."

3.5. CONTACTO Y REDES SOCIALES
Opcional, pero recomendado para networking interno:
- LinkedIn: URL completa de tu perfil
- Twitter/X: @usuario (solo profesional)
- GitHub: Para roles técnicos
- Portfolio: Sitio web personal o Behance

4. CONFIGURACIÓN DE PRIVACIDAD

NIVELES DE VISIBILIDAD:
- Público: Todos en la organización pueden ver tu perfil completo
- Equipo: Solo miembros de tu departamento
- Gerencia: Solo tu gerente y superiores
- Privado: Solo tú y recursos humanos

POR DEFECTO: Modo "Público" para fomentar colaboración.

5. PREFERENCIAS REGIONALES

ZONA HORARIA:
Crítico para colaboración en equipos distribuidos. Selecciona tu ubicación actual. Si viajas frecuentemente, actualiza según tu ubicación.

IDIOMA DE INTERFAZ:
- Español (España/Latinoamérica)
- English (US/UK)
- Português (Brasil/Portugal)
- Français

FORMATO DE FECHA Y HORA:
- DD/MM/AAAA o MM/DD/AAAA
- 24 horas o 12 horas (AM/PM)

6. NOTIFICACIONES DE PERFIL

ALERTAS AUTOMÁTICAS:
Recibirás notificaciones cuando:
- Alguien visita tu perfil (si está activo el seguimiento)
- Recibes una mención en documentos
- Te agregan a un nuevo equipo o proyecto

7. SINCRONIZACIÓN CON SISTEMAS CORPORATIVOS

INTEGRACIÓN ACTIVA DIRECTORY:
Si tu empresa usa AD, algunos campos se sincronizan automáticamente:
- Nombre y apellido
- Email corporativo
- Departamento y cargo
- Gerente directo

Estos campos tienen un candado 🔒 y requieren aprobación de RRHH para modificar.

8. GUARDAR Y VALIDAR CAMBIOS

AUTOGUARDADO:
Los cambios se guardan automáticamente cada 30 segundos mientras editas. Verás un indicador "Guardando..." en la esquina superior.

VALIDACIÓN DE DATOS:
El sistema valida que:
- Los campos obligatorios estén completos
- Los formatos sean correctos (email, teléfono, URLs)
- Las imágenes cumplan los requisitos técnicos

ERROR COMÚN: "Email no válido"
SOLUCIÓN: Usa tu correo corporativo (@techcorp.com). Correos personales no son aceptados.

9. EXPORTAR TU INFORMACIÓN

Puedes solicitar una copia de toda tu información de perfil:
Configuración > Privacidad > Exportar datos personales

Recibirás un archivo JSON con todos tus datos en 24-48 horas.

¿Necesitas ayuda? Contacta a support@techcorp.com`,
      categoriasNombres: ["F. A. Q."]
   },
   {
      titulo: "Guía de navegación por la interfaz",
      contenido: `MANUAL DE NAVEGACIÓN - INTERFAZ TECHCORP SOLUTIONS
Versión 5.0 | Optimizada para productividad

RESUMEN EJECUTIVO:
Esta guía te ayudará a dominar todos los elementos de la interfaz de TechCorp Solutions. La plataforma está diseñada siguiendo principios de UX/UI modernos para maximizar tu eficiencia. Tiempo estimado de lectura: 10 minutos.

===== ANATOMÍA DE LA INTERFAZ =====

1. BARRA DE NAVEGACIÓN SUPERIOR
Ubicada en la parte superior, siempre visible (fixed).

ELEMENTOS DE IZQUIERDA A DERECHA:
- Logo TechCorp: Click para volver al Dashboard
- Selector de workspace: Cambia entre diferentes espacios de trabajo si perteneces a múltiples
- Barra de búsqueda global: Busca documentos, usuarios, configuraciones
- Ícono de notificaciones 🔔: Badge numérico indica notificaciones no leídas
- Ícono de ayuda ❓: Acceso directo a documentación y soporte
- Avatar de usuario: Menú desplegable con opciones de cuenta

2. MENÚ LATERAL IZQUIERDO
Navegación principal de la aplicación. Puede colapsarse para ganar espacio (icono ☰).

SECCIONES PRINCIPALES:
📊 Dashboard: Vista general y métricas
📄 Mis Documentos: Biblioteca personal
👥 Compartidos conmigo: Documentos de colaboración
💬 Chats: Conversaciones con IA
⚙️ Configuración: Preferencias y ajustes
📚 Recursos: Manuales y tutoriales

ESTADOS VISUALES:
- Elemento activo: Resaltado en azul con barra lateral
- Hover: Fondo gris claro al pasar el mouse
- Badges: Números rojos indican items nuevos o pendientes

3. ÁREA DE CONTENIDO PRINCIPAL
Ocupa el centro de la pantalla, contenido dinámico según sección activa.

TIPOS DE VISTAS:
- Vista de lista: Documentos en formato tabla
- Vista de tarjetas: Documentos en cards visuales
- Vista de detalles: Contenido completo del documento
- Vista de edición: Editor WYSIWYG (What You See Is What You Get)

BARRAS DE HERRAMIENTAS CONTEXTUALES:
Aparecen según la acción que estés realizando:
- Modo lectura: Compartir, Exportar, Imprimir
- Modo edición: Formato de texto, Insertar elementos, Guardar

4. PANEL LATERAL DERECHO (CONTEXTUAL)
Se muestra solo cuando es relevante:
- Propiedades del documento seleccionado
- Historial de versiones
- Comentarios y colaboradores
- Metadatos y etiquetas

Para cerrar: Click en X o fuera del panel.

5. PIE DE PÁGINA
Información fija en la parte inferior:
- Links a políticas y términos legales
- Estado del servicio (🟢 Operacional / 🟡 Degradado / 🔴 Caído)
- Versión de la aplicación
- Selector de idioma
- Enlaces a redes sociales corporativas

===== ATAJOS DE TECLADO =====

NAVEGACIÓN RÁPIDA:
- Ctrl + K (Cmd + K Mac): Búsqueda universal
- Ctrl + N (Cmd + N Mac): Nuevo documento
- Ctrl + / (Cmd + / Mac): Lista de atajos disponibles
- Esc: Cerrar modales y paneles

EDICIÓN:
- Ctrl + S (Cmd + S Mac): Guardar cambios
- Ctrl + Z / Y (Cmd + Z / Y Mac): Deshacer/Rehacer
- Ctrl + B / I / U: Negrita / Cursiva / Subrayado

NAVEGACIÓN ENTRE SECCIONES:
- Alt + 1-9: Saltar a diferentes secciones del menú lateral
- Tab / Shift + Tab: Navegar entre elementos interactivos
- Enter: Activar elemento seleccionado

===== PERSONALIZACIÓN DE LA INTERFAZ =====

TEMAS VISUALES:
Configuración > Apariencia > Tema
- Claro: Óptimo para ambientes bien iluminados
- Oscuro: Reduce fatiga visual en ambientes con poca luz
- Auto: Cambia según hora del día (oscuro 20:00-8:00)

DENSIDAD DE INTERFAZ:
Configuración > Apariencia > Densidad
- Cómoda: Más espaciado, ideal para pantallas grandes
- Compacta: Más información visible, ideal para portátiles
- Personalizada: Define tu propio espaciado

ORDENAR MENÚ LATERAL:
Puedes reorganizar elementos del menú mediante drag & drop:
1. Click prolongado en un elemento (2 segundos)
2. Arrastra a la posición deseada
3. Suelta para confirmar
4. Los cambios se guardan automáticamente

ANCLAR ELEMENTOS:
Items usados frecuentemente pueden anclarse arriba del menú:
Click derecho > "Anclar elemento" (máximo 5 anclajes)

===== MODOS DE VISUALIZACIÓN =====

MODO ENFOQUE:
Oculta distracciones para concentrarte en el contenido.
Activar: F11 o ícono de pantalla completa
Características:
- Oculta menú lateral y barra de herramientas
- Solo contenido visible
- Atajos de teclado permanecen activos
Salir: Esc o F11

MODO PRESENTACIÓN:
Comparte tu pantalla en reuniones ocultando información personal.
Activar: Configuración > Modo presentación
Oculta automáticamente:
- Notificaciones
- Información de perfil
- Chats y mensajes privados

===== WIDGETS Y COMPONENTES INTERACTIVOS =====

TARJETAS DE DOCUMENTO:
Cada documento se representa con una tarjeta que incluye:
- Icono de categoría (código de colores)
- Título del documento
- Extracto de primeras líneas
- Autor y fecha de creación/modificación
- Indicadores: 👁️ vistas, 💬 comentarios, ⭐ favoritos

ACCIONES RÁPIDAS (Hover sobre tarjeta):
- Compartir
- Duplicar
- Mover a carpeta
- Eliminar

BREADCRUMBS (Migas de pan):
Ubicadas sobre el contenido principal, muestran tu ubicación actual:
Home > Documentos > Soporte Técnico > Manual de Usuario
Click en cualquier nivel para navegar hacia atrás.

TOOLTIPS:
Información emergente al pasar el mouse sobre elementos:
- Explicación de iconos
- Atajos de teclado asociados
- Estado o advertencias

===== RESPONSIVE DESIGN =====

ADAPTACIÓN POR TAMAÑO DE PANTALLA:

DESKTOP (>1280px):
- Vista completa con todos los paneles
- Menú lateral siempre visible
- Panel derecho contextual disponible

TABLET (768px - 1279px):
- Menú lateral colapsable
- Panel derecho se sobrepone al contenido
- Algunos elementos se agrupan en menús desplegables

MÓVIL (<768px):
- Menú hamburguesa (☰) para navegación principal
- Vista de una columna
- Gestos táctiles: swipe para cambiar entre secciones

===== SOLUCIÓN DE PROBLEMAS VISUALES =====

"No veo el menú lateral"
→ Click en ícono ☰ arriba a la izquierda o presiona Ctrl + B

"Los textos se ven muy pequeños"
→ Configuración > Accesibilidad > Tamaño de fuente (80% - 150%)

"La interfaz se ve descuadrada"
→ Refresca la página (Ctrl + F5) para limpiar caché

"No puedo encontrar una función"
→ Usa búsqueda global (Ctrl + K) y escribe lo que buscas

Para más ayuda: help.techcorp.com`,
      categoriasNombres: ["F. A. Q."]
   },
   {
      titulo: "Resolución de errores al cargar archivos",
      contenido: `TROUBLESHOOTING - PROBLEMAS DE CARGA DE ARCHIVOS
Departamento de Soporte Técnico | Documento ID: ST-045

INTRODUCCIÓN:
Los problemas al cargar archivos son uno de los motivos de consulta más frecuentes. Esta guía proporciona soluciones paso a paso para los escenarios más comunes, permitiéndote resolver el 90% de los casos sin necesidad de contactar a soporte.

===== ESPECIFICACIONES TÉCNICAS =====

FORMATOS SOPORTADOS:
Documentos:
- PDF (Adobe Portable Document Format)
- DOC, DOCX (Microsoft Word)
- XLS, XLSX (Microsoft Excel)
- PPT, PPTX (Microsoft PowerPoint)
- TXT (Texto plano)
- RTF (Rich Text Format)
- ODT, ODS, ODP (OpenOffice/LibreOffice)

Imágenes:
- JPG, JPEG (fotografías)
- PNG (gráficos con transparencia)
- GIF (animaciones ligeras)
- SVG (gráficos vectoriales)
- WEBP (formato moderno optimizado)

Otros:
- ZIP, RAR (archivos comprimidos)
- CSV (datos tabulares)
- JSON, XML (datos estructurados)
- MD (Markdown)

LÍMITES DE TAMAÑO:
- Plan Plus: Máximo 10MB por archivo individual
- Plan Premium: Máximo 50MB por archivo individual
- Almacenamiento total Plan Plus: 5GB
- Almacenamiento total Plan Premium: Ilimitado
- Carga simultánea: Hasta 10 archivos a la vez

RESTRICCIONES DE SEGURIDAD:
Por motivos de seguridad, estos formatos están BLOQUEADOS:
- Ejecutables: .exe, .bat, .cmd, .msi
- Scripts potencialmente peligrosos: .js, .vbs, .ps1
- Archivos del sistema: .dll, .sys
- Archivos temporales: .tmp, .temp

===== DIAGNÓSTICO POR MENSAJE DE ERROR =====

ERROR 1: "Archivo demasiado grande"
CAUSA: El archivo excede el límite de tu plan.

SOLUCIONES:
a) COMPRIMIR EL ARCHIVO:
   - Documentos: Usar herramientas como PDF Compressor, Smallpdf
   - Imágenes: Reducir resolución o calidad en Photoshop/GIMP
   - Videos: Cambiar codec o reducir bitrate con HandBrake
   
b) DIVIDIR EL ARCHIVO:
   - Archivos ZIP: Dividir en partes usando WinRAR o 7-Zip
   - Documentos largos: Separar en secciones lógicas
   
c) ACTUALIZAR PLAN:
   - Upgrade a Premium para límite de 50MB
   - Costo adicional: $10/mes

ERROR 2: "Formato de archivo no soportado"
CAUSA: Intentas subir un tipo de archivo no permitido.

SOLUCIONES:
a) CONVERTIR A FORMATO COMPATIBLE:
   - Word a PDF: Usar "Guardar como PDF" en Word
   - Imágenes: Convertir con herramientas online (convertio.co)
   - Audio/Video: Usar ffmpeg o VLC para transcoding
   
b) COMPRIMIR EN ZIP:
   - Si necesitas subir múltiples formatos no soportados
   - Click derecho > Enviar a > Carpeta comprimida (ZIP)

ERROR 3: "Error de conexión durante la carga"
CAUSA: Pérdida de conectividad o timeout de red.

DIAGNÓSTICO:
1. Prueba tu velocidad de internet: speedtest.net
   Mínimo requerido: 2 Mbps upload
2. Ping al servidor: ping upload.techcorp.com
   Latencia aceptable: < 300ms

SOLUCIONES:
a) REINTENTAR CARGA:
   - El sistema implementa auto-retry 3 veces
   - Espera 30 segundos entre intentos
   
b) CAMBIAR DE RED:
   - Cambia de WiFi a ethernet (cable)
   - Prueba desde otra ubicación
   - Desactiva VPN si lo estás usando
   
c) MODO ROBUSTO:
   - Configuración > Avanzado > Activar "Modo de carga resistente"
   - Divide archivos grandes en chunks más pequeños
   - Más lento pero más confiable

ERROR 4: "No tienes permisos suficientes"
CAUSA: Tu rol de usuario no tiene autorización para subir archivos a esa ubicación.

VERIFICAR:
- Tu rol actual: Configuración > Perfil > Ver permisos
- Roles con permiso de carga: Editor, Administrador
- Rol sin permiso: Lector

SOLUCIONES:
a) SOLICITAR UPGRADE DE PERMISOS:
   - Contacta a tu gerente o administrador del sistema
   - Email modelo: "Solicito permisos de editor para subir documentación"
   
b) USAR CARPETA PERSONAL:
   - Todos los usuarios pueden subir a "Mis Documentos"
   - Luego solicita que un editor lo mueva a carpetas compartidas

ERROR 5: "Espacio de almacenamiento insuficiente"
CAUSA: Has alcanzado el límite de almacenamiento de tu plan.

VERIFICAR ESPACIO USADO:
Dashboard > Widget "Almacenamiento"
Muestra: 4.2GB / 5GB usados (84%)

SOLUCIONES:
a) LIBERAR ESPACIO:
   - Eliminar archivos antiguos no usados
   - Vaciar papelera (archivos eliminados ocupan espacio 30 días)
   - Comprimir archivos duplicados
   
b) SOLICITAR MÁS ESPACIO:
   - Contactar a billing@techcorp.com
   - Costo de expansión: $2/mes por 5GB adicionales
   
c) UPGRADE A PREMIUM:
   - Almacenamiento ilimitado
   - Sin preocupaciones de cuotas

===== PROBLEMAS DE RENDIMIENTO =====

CARGA MUY LENTA (> 5 minutos para 10MB)
POSIBLES CAUSAS Y SOLUCIONES:

1. VELOCIDAD DE INTERNET:
   Test: speedtest.net
   Si upload < 2 Mbps:
   - Cierra otras aplicaciones que usen internet
   - Pausa descargas de torrents o streaming
   - Evita horas pico (18:00 - 22:00)

2. MÚLTIPLES CARGAS SIMULTÁNEAS:
   - Sube archivos de uno en uno
   - Si necesitas subir muchos, comprime en un solo ZIP
   
3. EXTENSIONES DE NAVEGADOR:
   - Desactiva extensiones como adblockers
   - Prueba en modo incógnito
   - Usa Chrome o Firefox (mejores rendimientos que Safari/IE)

4. ANTIVIRUS O FIREWALL:
   - Algunos AV escanean archivos durante carga
   - Agrega techcorp.com a lista blanca
   - Desactiva temporalmente para probar

===== BUENAS PRÁCTICAS =====

ANTES DE SUBIR:
✓ Verifica que el archivo está completo y no corrupto
✓ Revisa que el nombre sea descriptivo (evita "doc1.pdf")
✓ Comprueba que tienes permisos en la carpeta destino
✓ Cierra el archivo si está abierto en otra aplicación
✓ Ten conexión estable (WiFi con buena señal)

DURANTE LA CARGA:
✓ No cierres la pestaña del navegador
✓ No apagues o suspendas el equipo
✓ Mantén el navegador en primer plano
✓ Si tarda mucho, observa la barra de progreso

DESPUÉS DE SUBIR:
✓ Espera la confirmación "Archivo subido exitosamente"
✓ Refresca la página para verificar que aparece
✓ Abre el archivo para confirmar integridad
✓ Comparte con colaboradores si es necesario

===== HERRAMIENTAS DE TERCEROS RECOMENDADAS =====

COMPRESIÓN:
- PDFCompressor.com - Reduce PDFs hasta 90%
- TinyPNG.com - Optimiza imágenes PNG/JPG
- Handbrake - Comprime videos sin pérdida visual

CONVERSIÓN:
- Convertio.co - Convierte entre 300+ formatos
- CloudConvert - Conversión en la nube
- OnlineConvert.com - Herramientas especializadas

DIAGNÓSTICO:
- SpeedTest.net - Velocidad de internet
- PingPlotter - Diagnóstico de red avanzado
- Can I Use - Compatibilidad de navegadores

===== CASOS ESPECIALES =====

SUBIR DESDE MÓVIL:
- Usa la app nativa (mejor que navegador)
- Conéctate a WiFi (no uses datos móviles)
- Ten al menos 20% de batería

SUBIR DESDE APLICACIONES DE TERCEROS:
- Integración con Google Drive, Dropbox disponible
- Configuración > Integraciones > Conectar servicio
- Los archivos se sincronizan automáticamente

SUBIR ARCHIVOS MUY GRANDES (>50MB):
- Disponible solo Plan Premium
- Usa "Carga por partes" automática
- El sistema divide en chunks de 10MB
- Puedes pausar y reanudar

===== SOPORTE AVANZADO =====

Si ninguna solución funciona:
1. Captura de pantalla del error
2. Nota el código de error (ej: ERR_UPLOAD_512)
3. Información del archivo: nombre, tamaño, formato
4. Navegador y versión
5. Sistema operativo

Envía todo esto a: upload-support@techcorp.com
Tiempo de respuesta: < 4 horas hábiles
Soporte prioritario Premium: < 1 hora

Línea directa: +1-800-TECH-CORP (opción 2)`,
      categoriasNombres: ["Soporte técnico"]
   },
   {
      titulo: "Configuración de notificaciones personalizadas",
      contenido: `GUÍA COMPLETA DE NOTIFICACIONES INTELIGENTES
Sistema de Alertas TechCorp v3.5

FILOSOFÍA DEL SISTEMA:
Mantente informado sin saturación. Nuestro sistema de notificaciones está diseñado para darte la información relevante en el momento adecuado, sin convertirse en una distracción constante.

PARTE 1: CANALES DE NOTIFICACIÓN

1.1. NOTIFICACIONES POR EMAIL
Las más tradicionales pero efectivas.

MODOS DISPONIBLES:
- Tiempo Real: Cada evento genera un email inmediato
- Resumen Diario: Un solo email a las 9:00 AM con todas las actualizaciones del día anterior
- Resumen Semanal: Lunes 9:00 AM con resumen de la semana
- Desactivado: Sin emails (solo notificaciones in-app)

CONFIGURAR:
Configuración > Notificaciones > Email > Seleccionar modo

PERSONALIZAR HORARIO:
Si eliges resumen diario/semanal, puedes cambiar la hora:
- Temprano: 6:00 AM (para madrugadores)
- Estándar: 9:00 AM (mayoría de usuarios)
- Tarde: 14:00 PM (después del almuerzo)
- Personalizado: Define tu propia hora

FILTROS DE EMAIL:
Para evitar spam, puedes filtrar:
✓ Solo eventos importantes (prioridad alta)
✓ Solo menciones directas a tu nombre
✓ Solo documentos que creaste o editas
✗ Excluir notificaciones sociales (likes, vistas)

1.2. NOTIFICACIONES PUSH (NAVEGADOR)
Alertas emergentes en tu escritorio, incluso si no estás en la aplicación.

REQUISITOS:
- Navegador compatible (Chrome, Firefox, Edge, Safari 16+)
- Permiso otorgado al sitio web
- Sistema operativo con notificaciones habilitadas

PRIMERA CONFIGURACIÓN:
1. El navegador pedirá permiso la primera vez
2. Click en "Permitir" en el popup del navegador
3. Define tu preferencia de sonido (silencioso, discreto, audible)

GESTIÓN DE PERMISOS:
Chrome: Configuración > Privacidad > Configuración de sitios > Notificaciones
Firefox: Preferencias > Privacidad > Permisos > Notificaciones

PERSONALIZACIÓN:
- Duración en pantalla: 3s, 5s, 10s, hasta cerrar manualmente
- Sonido: 8 tonos diferentes o silencioso
- Posición: Esquina superior derecha/izquierda (según SO)
- Modo No Molestar: Desactiva entre horarios específicos

1.3. NOTIFICACIONES IN-APP (Dentro de la plataforma)
El centro de notificaciones interno.

ACCESO:
Click en ícono de campana 🔔 (esquina superior derecha)
Badge rojo indica cantidad de notificaciones no leídas.

ORGANIZACIÓN:
Las notificaciones se agrupan en tabs:
- Todas: Vista completa
- Menciones: Donde te nombraron con @tunombre
- Documentos: Actividad en tus archivos
- Sistema: Actualizaciones y mantenimientos

ACCIONES RÁPIDAS:
Sobre cada notificación:
- Marcar como leída/no leída
- Ir al documento relacionado
- Archivar (ocultar sin eliminar)
- Eliminar permanentemente

GESTIÓN MASIVA:
Botones superiores:
- "Marcar todas como leídas" (descansa ese badge)
- "Archivar leídas" (limpieza automática)
- "Limpiar todo" (borrón y cuenta nueva)

1.4. NOTIFICACIONES POR SMS (Plan Premium)
Para eventos críticos que requieren atención inmediata.

CONFIGURACIÓN INICIAL:
1. Configuración > Notificaciones > SMS
2. Verificar número de teléfono (código OTP)
3. Seleccionar solo eventos críticos:
   - Alertas de seguridad
   - Aprobaciones urgentes pendientes
   - Caída del sistema
   - Recordatorios de deadlines (opcional)

COSTO:
Incluido en Plan Premium: 50 SMS/mes
SMS adicionales: $0.10 c/u

IMPORTANTE:
Por costos y para evitar spam, SMS solo se usa para eventos realmente importantes. No actives para todo tipo de notificación.

PARTE 2: TIPOS DE EVENTOS NOTIFICABLES

2.1. ACTIVIDAD EN DOCUMENTOS
Notificaciones relacionadas con documentos que creaste o en los que colaboras.

EVENTOS DISPONIBLES:
□ Nuevo comentario en tus documentos
□ Alguien editó un documento compartido
□ Documento compartido contigo
□ Cambios en permisos de acceso
□ Documento movido o renombrado
□ Documento eliminado (papelera)
□ Vencimiento de enlace compartido
□ Documento alcanzó X vistas (configurable)

GRANULARIDAD:
Para cada evento, define:
- ¿Notificar siempre o solo si es importante?
- ¿Qué canales usar? (email, push, in-app)
- ¿Agrupar notificaciones similares?

EJEMPLO DE CONFIGURACIÓN:
"Nuevo comentario":
- In-app: SÍ (ver inmediatamente si estás conectado)
- Push: SÍ (enterarte si no estás en la app)
- Email: NO (evitar spam en bandeja)
- SMS: NO (no es crítico)

2.2. MENCIONES Y COLABORACIÓN
Cuando alguien te menciona o te involucra directamente.

MENCIONES CON @:
Escribe @nombre en un comentario para notificar a esa persona.
Todos reciben notificación cuando son mencionados.

Ejemplo: "@Juan puedes revisar el informe financiero cuando tengas tiempo?"

CONFIGURACIÓN RECOMENDADA:
Menciones suelen ser importantes, activa todos los canales excepto SMS.

2.3. NOTIFICACIONES DEL SISTEMA
Eventos técnicos y administrativos.

TIPOS:
□ Actualización de la plataforma
□ Mantenimiento programado
□ Nueva función disponible
□ Cambios en términos de servicio
□ Problemas de seguridad detectados
□ Backup completado exitosamente
□ Cuota de almacenamiento al 80%
□ Renovación de suscripción próxima
□ Cambios en tu plan o permisos

CONFIGURACIÓN SUGERIDA:
Eventos de seguridad y críticos: Todos los canales
Informativos: Solo email (resumen semanal)

2.4. RECORDATORIOS PERSONALIZADOS
Tú defines qué y cuándo te recuerdan.

CREAR RECORDATORIO:
1. En cualquier documento: Menú ⋮ > "Crear recordatorio"
2. Define fecha y hora
3. Opción de repetir: diario, semanal, mensual
4. Elige canal de notificación

CASOS DE USO:
- Revisar documento antes de reunión
- Actualizar información mensualmente
- Seguimiento de tareas pendientes
- Renovaciones anuales de contratos

2.5. NOTIFICACIONES SOCIALES (Opcionales)
Interacciones más ligeras, menos críticas.

EVENTOS:
□ Alguien dio "like" a tu documento
□ Nuevo seguidor a tus publicaciones
□ Documento alcanzó milestone de vistas (100, 500, 1000)
□ Tu perfil fue visitado

RECOMENDACIÓN:
Desactiva para reducir ruido, o usa solo resumen semanal.

PARTE 3: CONFIGURACIONES AVANZADAS

3.1. MODO NO MOLESTAR
Silencia todas las notificaciones en horarios específicos.

CONFIGURAR:
Configuración > Notificaciones > No Molestar
- Activo de 22:00 a 8:00 (horario típico de descanso)
- Días: Lunes a Domingo
- Excepción: Permitir notificaciones críticas de seguridad

MODO VACACIONES:
Activa "ausente" y todas las notificaciones se pausan.
Los eventos se acumulan y recibes un resumen cuando regreses.

3.2. AGRUPACIÓN INTELIGENTE
El sistema agrupa notificaciones similares para evitar spam.

EJEMPLO:
En vez de 15 notificaciones de "nuevo comentario" en el mismo documento,
recibes una: "15 nuevos comentarios en 'Reporte Trimestral'"

CONFIGURAR:
Configuración > Notificaciones > Avanzado > Agrupación
- Agrupar por documento: SÍ
- Agrupar por usuario: Opcional
- Tiempo de agrupación: 5min, 15min, 1hora

3.3. NOTIFICACIONES CONDICIONALES
Crea reglas personalizadas complejas.

EJEMPLOS DE REGLAS:
IF documento contiene "urgente" THEN notificar por SMS
IF comentario de [Jefe] THEN notificar inmediatamente
IF después de 18:00 THEN solo acumular para resumen mañana
IF día es "Viernes" THEN agrupar más (fin de semana próximo)

CONFIGURAR:
Configuración > Notificaciones > Reglas personalizadas > Nueva regla

3.4. PRIORIZACIÓN AUTOMÁTICA
IA clasifica notificaciones por importancia.

CRITERIOS DE IA:
- Menciones directas: ALTA prioridad
- Comentarios de superiores: ALTA
- Comentarios en documentos antiguos: BAJA
- Likes y vistas: BAJA

Puedes entrenar al sistema marcando notificaciones:
Click derecho > "Esto es importante" o "Esto no es importante"

PARTE 4: CENTRO DE NOTIFICACIONES

FILTROS:
- Ver solo no leídas
- Ver solo prioridad alta
- Ver por tipo de evento
- Ver por documento específico

BÚSQUEDA:
Busca en historial de notificaciones (últimos 90 días):
"comentario AND reporte financiero AND @Juan"

CONFIGURACIÓN RÁPIDA:
Cada notificación tiene un engranaje ⚙️:
Click para ajustar configuración de ese tipo de evento sin ir a menú general.

PARTE 5: SOLUCIÓN DE PROBLEMAS

"No recibo notificaciones por email"
→ Revisa carpeta de spam
→ Verifica que email es correcto en tu perfil
→ Whitelist: notifications@techcorp.com

"Recibo demasiadas notificaciones"
→ Cambia a modo resumen diario
→ Desactiva eventos sociales
→ Activa agrupación inteligente

"Las notificaciones push no aparecen"
→ Verifica permisos del navegador
→ Revisa configuración de sistema operativo
→ Prueba en otro navegador

"No veo el badge de notificaciones"
→ Refresca la página (Ctrl + F5)
→ Cierra sesión y vuelve a entrar
→ Limpia caché del navegador

PARTE 6: MEJORES PRÁCTICAS

PARA PRODUCTIVIDAD MÁXIMA:
✓ Usa modo No Molestar en horarios de concentración
✓ Activa solo lo esencial: menciones y documentos propios
✓ Revisa notificaciones 2-3 veces al día (mañana, mediodía, tarde)
✓ Archiva leídas diariamente para mantener limpio el centro

PARA COLABORACIÓN EFECTIVA:
✓ Activa notificaciones de documentos compartidos
✓ Responde a menciones en < 24 horas
✓ Usa menciones con @ cuando necesites respuesta de alguien

PARA EQUILIBRIO VIDA-TRABAJO:
✓ Desactiva notificaciones fuera del horario laboral
✓ No instales notificaciones en teléfono personal
✓ Usa modo vacaciones cuando estés ausente

Soporte: notifications@techcorp.com
Feedback: Ayúdanos a mejorar reportando falsos positivos`,
      categoriasNombres: ["Soporte técnico", "F. A. Q."]
   },
   {
      titulo: "Preguntas sobre compatibilidad de navegadores",
      contenido: `MATRIZ DE COMPATIBILIDAD - NAVEGADORES WEB
TechCorp Solutions | Actualizado: Enero 2025

RESUMEN EJECUTIVO:
TechCorp Solutions es una aplicación web moderna que aprovecha las últimas tecnologías HTML5, CSS3 y JavaScript ES2020+. Para garantizar la mejor experiencia, recomendamos usar navegadores actualizados. Esta guía detalla la compatibilidad con cada navegador y sus versiones.

===== NAVEGADORES OFICIALMENTE SOPORTADOS =====

🟢 GOOGLE CHROME (RECOMENDADO)
Versión mínima: 90 (Abril 2021)
Versión recomendada: 120+ (Diciembre 2023 o posterior)
Plataformas: Windows, macOS, Linux, ChromeOS
Soporte: ⭐⭐⭐⭐⭐ (Excelente)

CARACTERÍSTICAS:
- Mejor rendimiento general
- Todas las funcionalidades habilitadas
- Actualizaciones automáticas
- Soporte completo de PWA (Progressive Web App)
- Extensiones oficiales disponibles

NOTA: Chrome actualiza automáticamente. Si usas una versión desactualizada:
Menu (⋮) > Ayuda > Información de Google Chrome > Actualizar

🟢 MOZILLA FIREFOX
Versión mínima: 88 (Abril 2021)
Versión recomendada: 120+ (Diciembre 2023 o posterior)
Plataformas: Windows, macOS, Linux
Soporte: ⭐⭐⭐⭐ (Muy bueno)

CARACTERÍSTICAS:
- Excelente privacidad por defecto
- Buen rendimiento
- Todas las funcionalidades soportadas
- Tracking protection puede interferir (ver sección troubleshooting)

ACTUALIZAR FIREFOX:
Menu (☰) > Ayuda > Acerca de Firefox > Actualización automática

🟡 MICROSOFT EDGE (Chromium)
Versión mínima: 90 (Abril 2021)
Versión recomendada: 120+ (Diciembre 2023 o posterior)
Plataformas: Windows, macOS
Soporte: ⭐⭐⭐⭐ (Muy bueno)

CARACTERÍSTICAS:
- Basado en Chromium (mismo motor que Chrome)
- Integración nativa con Windows
- Buen rendimiento
- Collections y otras características exclusivas funcionan bien

NOTA IMPORTANTE:
Hablamos de Edge moderno (Chromium, 2020+), no Edge Legacy (2015-2020).
Edge Legacy ya no recibe soporte de Microsoft ni de TechCorp.

🟡 SAFARI (Solo macOS y iOS)
Versión mínima macOS: 14 (macOS Big Sur, Noviembre 2020)
Versión mínima iOS: 14 (Septiembre 2020)
Versión recomendada: 16+ (Septiembre 2022)
Soporte: ⭐⭐⭐ (Bueno, con limitaciones)

CARACTERÍSTICAS:
- Optimizado para dispositivos Apple
- Buena eficiencia energética (mayor duración de batería)
- Algunas características avanzadas no disponibles
- Actualizaciones limitadas a actualizaciones del SO

LIMITACIONES CONOCIDAS:
- Notificaciones push limitadas en iOS
- IndexedDB con menor rendimiento que otros navegadores
- Algunas animaciones CSS pueden verse diferentes

ACTUALIZAR SAFARI:
Safari se actualiza con el sistema operativo.
macOS: System Preferences > Software Update
iOS: Settings > General > Software Update

🔴 INTERNET EXPLORER (NO SOPORTADO)
Todas las versiones: NO COMPATIBLE
Estado: Descontinuado por Microsoft (Junio 2022)

MOTIVO:
Internet Explorer no soporta tecnologías modernas que usamos:
- ES6+ JavaScript
- CSS Grid y Flexbox avanzado
- Fetch API y Promises
- WebSockets modernos

MIGRACIÓN RECOMENDADA:
Si aún usas IE, migra a Microsoft Edge (viene pre-instalado en Windows 10/11).

MENSAJE AL DETECTAR IE:
"Tu navegador no es compatible. Por favor actualiza a Edge, Chrome o Firefox para continuar."

===== COMPATIBILIDAD POR PLATAFORMA =====

WINDOWS 10/11:
✅ Chrome (recomendado)
✅ Edge (recomendado para Windows)
✅ Firefox
❌ Internet Explorer

MACOS:
✅ Chrome (recomendado)
✅ Safari (nativo)
✅ Firefox
✅ Edge

LINUX:
✅ Chrome / Chromium
✅ Firefox (recomendado para Linux)

CHROMEOS:
✅ Chrome (nativo, único navegador)

===== DISPOSITIVOS MÓVILES =====

ANDROID:
✅ Chrome (pre-instalado)
✅ Firefox
✅ Samsung Internet
✅ Edge
⚠️ Opera (funcional, pero no optimizado)

REQUISITOS ANDROID:
- Android 8.0 (Oreo) o superior
- Recomendado: Android 11+

IOS / IPADOS:
✅ Safari (nativo)
✅ Chrome (en realidad usa motor Safari en iOS)
✅ Firefox (en realidad usa motor Safari en iOS)
✅ Edge (en realidad usa motor Safari en iOS)

NOTA TÉCNICA iOS:
Apple requiere que todos los navegadores en iOS usen WebKit (motor de Safari).
Por lo tanto, Chrome/Firefox/Edge en iOS tienen rendimiento similar entre sí.

REQUISITOS iOS:
- iOS 14.0 o superior
- Recomendado: iOS 16+

TABLETS:
Las mismas recomendaciones que smartphones aplican para tablets.
La interfaz se adapta automáticamente al tamaño de pantalla.

===== CARACTERÍSTICAS POR NAVEGADOR =====

TABLA COMPARATIVA:

Característica               Chrome  Firefox  Edge  Safari
────────────────────────────────────────────────────────
Carga de documentos           ✅      ✅      ✅    ✅
Chat con IA                   ✅      ✅      ✅    ✅
Notificaciones Push           ✅      ✅      ✅    ⚠️
Modo Offline                  ✅      ✅      ✅    ❌
Compartir pantalla            ✅      ✅      ✅    ⚠️
Shortcuts de teclado          ✅      ✅      ✅    ✅
Arrastrar y soltar archivos   ✅      ✅      ✅    ✅
Edición colaborativa          ✅      ✅      ✅    ✅
Exportación a PDF             ✅      ✅      ✅    ✅
Integraciones externas        ✅      ✅      ✅    ⚠️
PWA (instalar como app)       ✅      ❌      ✅    ⚠️

LEYENDA:
✅ Totalmente soportado
⚠️ Soportado con limitaciones
❌ No soportado

===== REQUISITOS DEL SISTEMA =====

MÁS ALLÁ DEL NAVEGADOR:

JAVASCRIPT:
Debe estar habilitado (99.9% de usuarios lo tiene activo).
Sin JavaScript, la aplicación no funcionará.

Verificar: Ir a https://www.enable-javascript.com/

COOKIES:
Requeridas para autenticación y preferencias.
Cookies de terceros no son necesarias.

CONFIGURAR:
Chrome: Settings > Privacy > Cookies > Allow all cookies
Firefox: Options > Privacy > Custom > Accept cookies from sites

LOCAL STORAGE:
Usado para caché y modo offline.
Requerido: Mínimo 50MB disponible

CONEXIÓN A INTERNET:
- Mínima: 2 Mbps
- Recomendada: 5 Mbps
- Óptima: 10 Mbps+
- Latencia: < 300ms

RESOLUCIÓN DE PANTALLA:
- Mínima: 1280x720 (HD)
- Recomendada: 1920x1080 (Full HD)
- Soportada: Hasta 4K (3840x2160)

HARDWARE MÍNIMO:
- CPU: Dual-core 2GHz
- RAM: 4GB (8GB recomendado)
- GPU: Cualquier GPU moderna con aceleración WebGL

===== TROUBLESHOOTING =====

PROBLEMA: "Algunas funciones no están disponibles"
CAUSA: Navegador desactualizado o extensiones bloqueando funcionalidades.

SOLUCIÓN:
1. Actualiza tu navegador a la última versión
2. Prueba en modo incógnito (desactiva extensiones temporalmente)
3. Verifica que JavaScript y cookies estén habilitados

PROBLEMA: "La aplicación se ve mal o descuadrada"
CAUSA: Caché desactualizado o zoom del navegador incorrecto.

SOLUCIÓN:
1. Presiona Ctrl + 0 (cero) para resetear zoom
2. Limpia caché: Ctrl + Shift + Delete > Cached images
3. Refresca con Ctrl + F5 (hard reload)

PROBLEMA: "Notificaciones no funcionan"
CAUSA: Permisos no otorgados o bloqueados por el navegador.

SOLUCIÓN CHROME:
Settings > Privacy and Security > Site Settings > Notifications
Busca techcorp.com y cambia a "Allow"

SOLUCIÓN FIREFOX:
Menu > Preferences > Privacy & Security > Permissions > Notifications
Busca techcorp.com y cambia a "Allow"

PROBLEMA: "Rendimiento lento"
CAUSAS COMUNES:
- Múltiples tabs abiertas (cierra las innecesarias)
- Extensiones consumiendo recursos (desactiva temporalmente)
- Hardware insuficiente
- Conexión lenta

SOLUCIONES:
1. Chrome Task Manager (Shift + Esc) para ver qué consume recursos
2. Cierra tabs no usadas
3. Desactiva extensiones pesadas
4. Considera actualizar hardware si es muy antiguo

===== MODOS DE DESARROLLO =====

PARA DESARROLLADORES O USUARIOS AVANZADOS:

CONSOLA DE DESARROLLO:
Chrome/Edge/Firefox: F12 o Ctrl + Shift + I
Safari: Cmd + Option + I (requiere habilitar en preferencias)

Útil para:
- Ver errores de JavaScript
- Inspeccionar network requests
- Debug de problemas complejos

MODO RESPONSIVE:
Simula diferentes tamaños de pantalla:
Chrome: F12 > Toggle device toolbar (Ctrl + Shift + M)

===== EXTENSIONES RECOMENDADAS =====

CHROME WEB STORE:
- TechCorp Enhancer: Atajos adicionales y temas
- Dark Reader: Modo oscuro mejorado
- Grammarly: Corrección ortográfica en tiempo real

FIREFOX ADD-ONS:
- TechCorp Connector: Integración con apps externas
- uBlock Origin: Bloqueo de ads sin interferir con TechCorp

NOTA:
Extensiones de terceros no son oficialmente soportadas.
Si tienes problemas, prueba desactivándolas primero.

===== FUTURO Y DEPRECIACIONES =====

NAVEGADORES EN VIGILANCIA:
Estos navegadores aún funcionan pero eventualmente perderán soporte:
- Chrome < 100 (Marzo 2022): Soporte hasta Diciembre 2025
- Firefox < 100 (Mayo 2022): Soporte hasta Diciembre 2025
- Safari < 15: Soporte hasta Junio 2025

PRÓXIMAS MEJORAS:
Con navegadores más nuevos, habilitaremos:
- WebGPU para renderizado más rápido
- WebAssembly para procesamiento local
- Web Bluetooth (compartir a dispositivos)

===== REPORTE DE INCOMPATIBILIDADES =====

Si encuentras problemas específicos de un navegador:

INFORMACIÓN A PROPORCIONAR:
- Navegador y versión exacta (ej: Chrome 120.0.6099.109)
- Sistema operativo y versión
- Descripción detallada del problema
- Captura de pantalla o video
- Pasos para reproducir

ENVIAR A: browser-support@techcorp.com

Alternativa: Help > Report Bug > Selecciona "Browser compatibility"

===== RECURSOS ADICIONALES =====

VERIFICAR TU NAVEGADOR:
https://www.whatismybrowser.com/
Te muestra navegador, versión, sistema operativo

TEST DE COMPATIBILIDAD:
https://test.techcorp.com/browser-check
Ejecuta pruebas automáticas de compatibilidad (2 minutos)

ESTADÍSTICAS DE USO:
Entre nuestros usuarios:
- 62% Chrome
- 18% Edge
- 12% Safari
- 7% Firefox
- 1% Otros

Tu navegador es el corazón de la experiencia TechCorp.
Mantenerlo actualizado garantiza seguridad, rendimiento y acceso a nuevas funcionalidades.

¿Dudas sobre tu navegador? → support@techcorp.com`,
      categoriasNombres: ["F. A. Q.", "Soporte técnico"]
   },

   // Documentos para Juan (Usuario 2) - 9 documentos
   {
      titulo: "Política de privacidad y protección de datos",
      contenido: `POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS PERSONALES
TechCorp Solutions Inc. | Versión 4.0 | Vigencia: Enero 2025

INTRODUCCIÓN
En TechCorp Solutions valoramos y respetamos tu privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos, compartimos y protegemos tu información personal cuando utilizas nuestros servicios. Cumplimos con todas las regulaciones internacionales de protección de datos, incluyendo GDPR (Europa), CCPA (California), LGPD (Brasil) y leyes locales aplicables.

ÚLTIMA ACTUALIZACIÓN: 15 de Enero de 2025
Al continuar usando nuestros servicios, aceptas esta política actualizada.

===== 1. RESPONSABLE DEL TRATAMIENTO =====

EMPRESA: TechCorp Solutions Inc.
DOMICILIO: 123 Tech Avenue, San Francisco, CA 94102, USA
EMAIL: privacy@techcorp.com
DELEGADO DE PROTECCIÓN DE DATOS (DPO): dpo@techcorp.com
REGISTRO: Inscrita en el Registro de Protección de Datos bajo el código DPA-2024-TECH-001

===== 2. INFORMACIÓN QUE RECOPILAMOS =====

2.1. INFORMACIÓN QUE PROPORCIONAS DIRECTAMENTE:
a) Datos de Registro:
   - Nombre y apellido completos
   - Dirección de correo electrónico corporativo
   - Contraseña (almacenada con hash bcrypt, nunca en texto plano)
   - Información de la empresa (opcional)
   - Cargo y departamento

b) Datos de Perfil:
   - Foto de perfil
   - Biografía profesional
   - Enlaces a redes sociales profesionales
   - Zona horaria y preferencias de idioma
   - Teléfono de contacto (opcional)

c) Contenido Generado por el Usuario:
   - Documentos que creas o subes
   - Comentarios y conversaciones
   - Mensajes en chats con IA
   - Configuraciones y preferencias

d) Información de Pago (procesada por terceros):
   - Tarjeta de crédito/débito (solo últimos 4 dígitos)
   - Dirección de facturación
   - Información fiscal (NIF/CIF para facturas)

2.2. INFORMACIÓN RECOPILADA AUTOMÁTICAMENTE:
a) Datos de Uso:
   - Páginas visitadas y tiempo de permanencia
   - Documentos accedidos y descargados
   - Funcionalidades utilizadas
   - Búsquedas realizadas
   - Interacciones con el sistema

b) Información Técnica:
   - Dirección IP (anonimizada después de 90 días)
   - Tipo y versión de navegador
   - Sistema operativo
   - Resolución de pantalla
   - Proveedor de servicios de Internet (ISP)
   - Identificadores únicos de dispositivo

c) Cookies y Tecnologías Similares:
   - Cookies de sesión (esenciales)
   - Cookies de preferencias
   - Cookies analíticas (Google Analytics)
   - Local Storage para caché offline

2.3. INFORMACIÓN DE TERCEROS:
- Datos de autenticación SSO (Single Sign-On)
- Información de Active Directory corporativo
- Datos de integraciones con herramientas externas (Google Drive, Dropbox)

===== 3. CÓMO USAMOS TU INFORMACIÓN =====

3.1. FINES PRINCIPALES:
a) Prestación del Servicio:
   - Crear y gestionar tu cuenta
   - Autenticarte de forma segura
   - Procesar tus solicitudes y transacciones
   - Proporcionar funcionalidades de IA y búsqueda
   - Habilitar colaboración con otros usuarios

b) Mejora del Servicio:
   - Analizar patrones de uso para optimizar la plataforma
   - Desarrollar nuevas funcionalidades
   - Personalizar tu experiencia
   - Realizar pruebas A/B de mejoras

c) Comunicación:
   - Enviar notificaciones relacionadas con tu cuenta
   - Responder a tus consultas de soporte
   - Informar sobre actualizaciones importantes
   - Enviar información sobre nuevas funcionalidades
   - Marketing (solo si diste consentimiento explícito)

d) Seguridad:
   - Detectar y prevenir fraudes
   - Proteger contra accesos no autorizados
   - Investigar actividades sospechosas
   - Hacer cumplir nuestros Términos de Servicio

e) Cumplimiento Legal:
   - Cumplir con obligaciones legales
   - Responder a requerimientos judiciales
   - Proteger nuestros derechos legales
   - Prevenir actividades ilegales

3.2. BASE LEGAL PARA EL PROCESAMIENTO (GDPR):
- Ejecución de contrato: Necesario para proporcionar el servicio
- Interés legítimo: Mejoras, seguridad, prevención de fraude
- Consentimiento: Marketing, cookies no esenciales
- Obligación legal: Cumplimiento de leyes aplicables

===== 4. COMPARTICIÓN DE INFORMACIÓN =====

4.1. NUNCA VENDEMOS TU INFORMACIÓN PERSONAL

4.2. COMPARTIMOS CON:
a) Proveedores de Servicios (Data Processors):
   - Servicios de hosting (AWS, Google Cloud)
   - Procesadores de pago (Stripe, PayPal)
   - Servicios de email (SendGrid)
   - Herramientas de análisis (Google Analytics)
   - Proveedores de CDN (Cloudflare)
   
   NOTA: Todos los proveedores están obligados contractualmente a proteger tus datos.

b) Integraciones que Autorices:
   - Google Drive, Dropbox, OneDrive (solo si conectas)
   - Herramientas de productividad que integres
   - Single Sign-On (SSO) corporativo

c) Otros Usuarios (según tu configuración):
   - Información de perfil público
   - Documentos que compartas explícitamente
   - Comentarios en documentos colaborativos

d) Requerimientos Legales:
   - Autoridades gubernamentales (con orden judicial)
   - Procesos legales (citaciones, mandatos)
   - Protección de derechos (disputas legales)

===== 5. TRANSFERENCIAS INTERNACIONALES =====

TechCorp opera globalmente. Tus datos pueden ser transferidos y procesados en:
- Estados Unidos (servidores principales)
- Unión Europea (servidores de respaldo)
- Otros países donde operamos

GARANTÍAS:
- Cláusulas Contractuales Estándar (SCC) de la UE
- Certificación Privacy Shield (cuando aplique)
- Medidas de seguridad equivalentes a GDPR

===== 6. SEGURIDAD DE TUS DATOS =====

6.1. MEDIDAS TÉCNICAS:
- Cifrado en tránsito (TLS 1.3)
- Cifrado en reposo (AES-256)
- Contraseñas hasheadas con bcrypt (salt rounds: 10)
- Autenticación de dos factores (2FA) disponible
- Firewalls y sistemas de detección de intrusiones
- Auditorías de seguridad regulares
- Pruebas de penetración anuales

6.2. MEDIDAS ORGANIZATIVAS:
- Acceso limitado solo a personal autorizado
- Capacitación en seguridad para empleados
- Políticas de confidencialidad estrictas
- Monitoreo continuo de sistemas
- Plan de respuesta a incidentes

6.3. CERTIFICACIONES:
- ISO 27001 (Gestión de Seguridad de la Información)
- SOC 2 Type II (Controles de seguridad y disponibilidad)
- GDPR Compliant

===== 7. TUS DERECHOS =====

TIENES DERECHO A:

a) ACCESO: Solicitar copia de tus datos personales
   Plazo de respuesta: 30 días
   Formato: JSON exportable

b) RECTIFICACIÓN: Corregir datos inexactos o incompletos
   Puedes hacerlo directamente desde tu perfil

c) SUPRESIÓN ("Derecho al Olvido"):
   Solicitar eliminación de tus datos
   Excepciones: obligaciones legales, disputas pendientes

d) PORTABILIDAD:
   Recibir tus datos en formato estructurado (JSON)
   Transferir a otro servicio

e) OPOSICIÓN:
   Oponerte al procesamiento de tus datos
   Especialmente para marketing directo

f) RESTRICCIÓN:
   Limitar cómo usamos tus datos en ciertas circunstancias

g) NO DECISIONES AUTOMATIZADAS:
   No tomar decisiones basadas únicamente en procesamiento automatizado

EJERCER TUS DERECHOS:
Email: rights@techcorp.com
Formulario web: techcorp.com/privacy/request
Respuesta en: 30 días máximo (puede extenderse 60 días en casos complejos)

===== 8. RETENCIÓN DE DATOS =====

CONSERVAMOS TUS DATOS MIENTRAS:
- Tu cuenta esté activa
- Sea necesario para proporcionar el servicio
- Lo requiera la ley

PERÍODOS DE RETENCIÓN:
- Datos de cuenta activa: Mientras esté activa
- Datos de cuentas cerradas: 90 días (luego eliminación)
- Backups: 30 días
- Logs de acceso: 90 días
- Datos fiscales/facturación: 7 años (obligación legal)
- Datos de marketing: Hasta revocación de consentimiento

ELIMINACIÓN SEGURA:
Los datos se eliminan de forma permanente e irrecuperable usando métodos de borrado seguro.

===== 9. COOKIES Y TECNOLOGÍAS SIMILARES =====

TIPOS DE COOKIES QUE USAMOS:

a) ESENCIALES (No requieren consentimiento):
   - Sesión y autenticación
   - Seguridad CSRF
   - Balance de carga

b) FUNCIONALES (Requieren consentimiento):
   - Preferencias de idioma
   - Configuraciones de interfaz
   - Zona horaria

c) ANALÍTICAS (Requieren consentimiento):
   - Google Analytics (anonimizado)
   - Hotjar (mapas de calor)

d) MARKETING (Requieren consentimiento explícito):
   - Remarketing (si aplica)
   - Seguimiento de conversiones

GESTIONAR COOKIES:
Configuración > Privacidad > Preferencias de Cookies
Puedes aceptar/rechazar cada categoría individualmente.

===== 10. MENORES DE EDAD =====

Nuestros servicios están dirigidos a empresas y profesionales mayores de 18 años.
NO recopilamos intencionalmente información de menores de 18 años.

Si detectamos una cuenta de un menor, la eliminaremos inmediatamente.

Si eres padre/tutor y crees que tu hijo proporcionó información, contacta: privacy@techcorp.com

===== 11. CAMBIOS A ESTA POLÍTICA =====

Podemos actualizar esta política ocasionalmente.

NOTIFICACIÓN DE CAMBIOS:
- Cambios menores: Aviso en la plataforma
- Cambios significativos: Email + aviso destacado + 30 días de aviso previo

HISTORIAL DE VERSIONES:
Versión 4.0: Enero 2025 - Actualización por nuevas regulaciones AI Act
Versión 3.0: Junio 2023 - Incorporación CCPA
Versión 2.0: Mayo 2018 - Adaptación GDPR

===== 12. CONTACTO =====

PREGUNTAS SOBRE PRIVACIDAD:
Email: privacy@techcorp.com
Teléfono: +1-800-PRIVACY
Dirección postal: Privacy Team, TechCorp Solutions, 123 Tech Avenue, SF, CA 94102

DELEGADO DE PROTECCIÓN DE DATOS (DPO):
Email: dpo@techcorp.com
Respuesta en 48 horas hábiles

AUTORIDAD DE CONTROL (Para residentes UE):
Tienes derecho a presentar una queja ante tu autoridad local de protección de datos.
España: AEPD (www.aepd.es)
Lista completa: https://edpb.europa.eu/

===== CONSENTIMIENTO =====

Al crear una cuenta y usar nuestros servicios, confirmas que:
- Has leído y comprendido esta Política de Privacidad
- Aceptas la recopilación y uso de tu información como se describe
- Tienes al menos 18 años de edad
- Tienes autoridad para aceptar en nombre de tu organización (si aplica)

Puedes retirar tu consentimiento en cualquier momento cerrando tu cuenta o contactando privacy@techcorp.com

Última revisión: 15 de Enero de 2025
Próxima revisión programada: Enero 2026`,
      categoriasNombres: ["Políticas de la empresa"]
   },
   {
      titulo: "Términos y condiciones de uso del servicio",
      contenido: `TÉRMINOS Y CONDICIONES DE SERVICIO
TechCorp Solutions Inc. | Versión 5.0 | Efectivo desde: 01 Enero 2025

ACUERDO LEGAL VINCULANTE
Estos Términos de Servicio ("Términos", "TOS") constituyen un acuerdo legal entre tú ("Usuario", "Tú", "Cliente") y TechCorp Solutions Inc. ("TechCorp", "Nosotros", "Compañía"). Al acceder o usar nuestra plataforma, aceptas estar legalmente vinculado por estos términos. SI NO ESTÁS DE ACUERDO, NO USES NUESTROS SERVICIOS.

===== 1. ACEPTACIÓN DE LOS TÉRMINOS =====

1.1. ALCANCE
Estos Términos aplican a:
- Plataforma web (app.techcorp.com)
- Aplicaciones móviles (iOS, Android)
- APIs y servicios relacionados
- Cualquier otro servicio de TechCorp

1.2. CAPACIDAD LEGAL
Declaras que:
- Tienes al menos 18 años de edad
- Tienes capacidad legal para celebrar contratos
- No estás prohibido por ley de usar nuestros servicios
- Si actúas en nombre de una empresa, tienes autoridad para vincularla

1.3. MODIFICACIONES
Nos reservamos el derecho de modificar estos Términos en cualquier momento.
NOTIFICACIÓN: Te avisaremos con 30 días de anticipación para cambios materiales.
USO CONTINUADO: El uso después de los cambios constituye aceptación.

===== 2. DESCRIPCIÓN DEL SERVICIO =====

2.1. QUÉ OFRECEMOS
TechCorp es una plataforma SaaS de gestión documental que proporciona:
- Almacenamiento y organización de documentos
- Sistema de búsqueda avanzada con IA
- Colaboración en tiempo real
- Chat inteligente con asistente IA
- Integraciones con servicios terceros

2.2. DISPONIBILIDAD
- Objetivo de uptime: 99.9% mensual
- Mantenimientos programados: Notificados con 48h de anticipación
- Downtime no programado: Comunicado inmediatamente

2.3. MODIFICACIÓN DEL SERVICIO
Podemos:
- Agregar o eliminar funcionalidades
- Modificar características existentes
- Discontinuar servicios con 90 días de aviso
- Realizar mejoras sin previo aviso

===== 3. CUENTAS DE USUARIO =====

3.1. CREACIÓN DE CUENTA
Requisitos:
- Email válido (preferentemente corporativo)
- Contraseña segura (min 8 caracteres, mayúsculas, minúsculas, números, símbolos)
- Información verídica y actualizada
- Aceptación de estos Términos y Política de Privacidad

3.2. RESPONSABILIDADES DEL USUARIO
Debes:
✓ Mantener la seguridad de tus credenciales
✓ Notificar inmediatamente cualquier acceso no autorizado
✓ Actualizar tu información de contacto
✓ Cumplir con todas las leyes aplicables
✓ No compartir tu cuenta con terceros

No debes:
✗ Crear cuentas múltiples para evadir límites
✗ Usar cuentas de otros usuarios
✗ Vender, transferir o ceder tu cuenta
✗ Usar información falsa o engañosa

3.3. TERMINACIÓN DE CUENTA
Puedes cerrar tu cuenta en cualquier momento desde Configuración.
Podemos suspender o terminar tu cuenta si:
- Violas estos Términos
- Realizas actividades fraudulentas
- No pagas las tarifas adeudadas
- Por solicitud de autoridades legales
- Por razones de seguridad

===== 4. PLANES Y PAGOS =====

4.1. PLANES DISPONIBLES
- PLUS: $9.99/mes - Características básicas con límites
- PREMIUM: $24.99/mes - Características completas ilimitadas
- ENTERPRISE: Contactar ventas - Soluciones personalizadas

4.2. FACTURACIÓN
- Ciclos: Mensual o anual (ahorra 20% anual)
- Fecha de cargo: Mismo día del mes de suscripción
- Método de pago: Tarjeta, PayPal, transferencia (anual), cripto (Premium+)
- Renovación automática: Salvo cancelación

4.3. REEMBOLSOS
Política de garantía de 30 días:
- Solicitud dentro de 30 días del pago inicial
- No haber excedido 50% del uso mensual
- Sin violaciones de estos Términos
- Procesamiento en 5-10 días hábiles

NO reembolsable después de 30 días del pago inicial.

4.4. CAMBIOS DE PLAN
- Upgrade: Efectivo inmediatamente, pago prorrateado
- Downgrade: Efectivo al inicio del próximo ciclo
- Cancelación: Acceso hasta fin del período pagado

4.5. IMPAGOS
Tras fallo de pago:
- Día 1: Intento automático de recargo
- Día 3: Segundo intento + notificación
- Día 5: Tercer intento + advertencia
- Día 7: Suspensión temporal de cuenta
- Día 15: Cancelación de cuenta y eliminación de datos

===== 5. USO ACEPTABLE =====

5.1. USOS PERMITIDOS
✓ Almacenar documentación empresarial legítima
✓ Colaborar con colegas y equipos
✓ Integrar con herramientas de productividad
✓ Automatizar flujos de trabajo
✓ Uso comercial dentro de tu organización

5.2. USOS PROHIBIDOS
✗ Actividades ilegales o fraudulentas
✗ Violación de derechos de terceros (propiedad intelectual)
✗ Spam, phishing, malware
✗ Scraping no autorizado de la plataforma
✗ Ingeniería inversa o descompilación
✗ Sobrecarga intencional de sistemas
✗ Reventa del servicio sin autorización escrita
✗ Uso para competir con TechCorp
✗ Almacenamiento de contenido ilegal
✗ Acoso, contenido ofensivo, discriminatorio

5.3. CONTENIDO PROHIBIDO
No puedes almacenar:
- Material con derechos de autor sin autorización
- Información confidencial de terceros sin permiso
- Datos personales violando leyes de privacidad
- Contenido terrorista, violento, abusivo
- Malware, virus, código malicioso

5.4. CONSECUENCIAS DE VIOLACIÓN
Primera violación menor: Advertencia
Violación grave o reincidente: Suspensión inmediata
Violación criminal: Reporte a autoridades + terminación

===== 6. PROPIEDAD INTELECTUAL =====

6.1. PROPIEDAD DE TECHCORP
TechCorp posee:
- Plataforma, código fuente, diseño
- Marca "TechCorp" y logos
- Documentación y materiales de marketing
- Modelos de IA y algoritmos
- Patentes y secretos comerciales

Licencia otorgada: Uso limitado, no exclusivo, revocable durante tu suscripción.

6.2. TU CONTENIDO
Tú retienes todos los derechos sobre el contenido que subes.

Licencia que nos otorgas:
- Almacenar y procesar tu contenido
- Mostrar tu contenido según tus configuraciones
- Crear backups
- Usar contenido anonimizado para mejorar servicios
- Cumplir con obligaciones legales

NO usamos tu contenido para:
- Venderlo a terceros
- Entrenamiento de IA externa
- Marketing sin tu permiso

6.3. RETROALIMENTACIÓN
Si envías sugerencias o feedback, nos otorgas derecho perpetuo para usarlas sin compensación.

===== 7. PRIVACIDAD Y DATOS =====

Ver nuestra Política de Privacidad completa en: techcorp.com/privacy

RESUMEN:
- Procesamos datos según Política de Privacidad
- Cumplimos GDPR, CCPA, LGPD
- No vendemos tus datos personales
- Cifrado end-to-end en tránsito y reposo
- Derecho a acceso, rectificación, supresión

===== 8. CONFIDENCIALIDAD =====

8.1. INFORMACIÓN CONFIDENCIAL
Tu contenido es confidencial. No lo revelaremos excepto:
- Con tu autorización explícita
- Por requerimiento legal válido
- Para proveedores bajo NDA (hosting, procesamiento)
- En caso de emergencia de seguridad

8.2. EXCEPCIONES
No es confidencial si:
- Es público o se hace público sin culpa nuestra
- Lo poseíamos antes de tu divulgación
- Lo recibimos legítimamente de terceros
- Lo desarrollamos independientemente

===== 9. LIMITACIONES DEL SERVICIO =====

9.1. LÍMITES TÉCNICOS
PLAN PLUS:
- 10MB por archivo
- 5GB almacenamiento total
- 10 respuestas IA/mes
- 10 interacciones con documentos/mes

PLAN PREMIUM:
- 50MB por archivo
- Almacenamiento ilimitado
- Respuestas IA ilimitadas
- Interacciones ilimitadas

9.2. LÍMITES DE USO JUSTO
Uso "ilimitado" sujeto a uso razonable.
Uso abusivo (>10TB/mes individual, >1M requests/día) puede resultar en throttling o terminación.

===== 10. GARANTÍAS Y DESCARGOS =====

10.1. SERVICIO "TAL CUAL"
El servicio se proporciona "AS IS" y "AS AVAILABLE".
NO GARANTIZAMOS:
- Funcionamiento ininterrumpido o libre de errores
- Que satisfaga tus requisitos específicos
- Que sea seguro al 100% (ningún sistema lo es)
- Resultados particulares

10.2. GARANTÍA LIMITADA
Garantizamos:
- Esfuerzo comercialmente razonable para uptime 99.9%
- Implementación de medidas de seguridad estándar
- Cumplimiento con leyes aplicables

===== 11. LIMITACIÓN DE RESPONSABILIDAD =====

EN LA MÁXIMA MEDIDA PERMITIDA POR LEY:

11.1. NO SEREMOS RESPONSABLES POR:
- Daños indirectos, incidentales, consecuentes
- Lucro cesante, pérdida de datos, pérdida de goodwill
- Interrupciones de negocio
- Daños por virus o malware
- Acceso no autorizado por terceros

11.2. LÍMITE MÁXIMO
Nuestra responsabilidad total no excederá:
- Cantidad pagada en los 12 meses previos, O
- $100 USD
Lo que sea mayor.

11.3. EXCEPCIONES
Límites no aplican a:
- Fraude o mala conducta intencional
- Violación de derechos de propiedad intelectual
- Muerte o lesión personal por negligencia
- Responsabilidades que no puedan limitarse legalmente

===== 12. INDEMNIZACIÓN =====

Aceptas indemnizar y eximir a TechCorp de:
- Reclamaciones derivadas de tu uso del servicio
- Tu violación de estos Términos
- Tu violación de derechos de terceros
- Contenido que subas o compartas
- Acciones de otros usuarios usando tu cuenta

===== 13. RESOLUCIÓN DE DISPUTAS =====

13.1. LEY APLICABLE
Estos Términos se rigen por las leyes del Estado de California, USA, sin considerar conflictos de leyes.

13.2. JURISDICCIÓN
Jurisdicción exclusiva: Cortes estatales y federales de San Francisco County, California.

13.3. ARBITRAJE OBLIGATORIO
Disputas serán resueltas mediante arbitraje vinculante (AAA rules).
Excepción: Reclamaciones de propiedad intelectual.

Renuncia a juicio por jurado y acciones colectivas.

13.4. PERÍODO DE RECLAMACIONES
Cualquier reclamación debe iniciarse dentro de 1 año desde que surgió.

===== 14. MISCELÁNEA =====

14.1. INTEGRALIDAD
Estos Términos + Política de Privacidad = Acuerdo completo.
Reemplaza acuerdos previos.

14.2. DIVISIBILIDAD
Si alguna disposición es inválida, las demás permanecen en vigor.

14.3. RENUNCIA
Falta de ejercicio de un derecho no constituye renuncia.

14.4. CESIÓN
No puedes ceder este acuerdo sin nuestro consentimiento.
Podemos ceder libremente (ej: adquisición, fusión).

14.5. FUERZA MAYOR
No somos responsables por incumplimientos debido a circunstancias fuera de control razonable.

14.6. SUPERVIVENCIA
Secciones 6, 10, 11, 12, 13 sobreviven a la terminación.

14.7. IDIOMA
Versión en inglés prevalece en caso de conflicto con traducciones.

===== 15. CONTACTO =====

PREGUNTAS SOBRE ESTOS TÉRMINOS:
Email: legal@techcorp.com
Tel: +1-800-TECHCORP
Dirección: Legal Department, TechCorp Solutions Inc., 123 Tech Avenue, San Francisco, CA 94102, USA

SOPORTE GENERAL:
Email: support@techcorp.com
Chat en vivo: 24/7 en la plataforma

NOTIFICACIONES LEGALES:
Enviar a: legal@techcorp.com (email requerido para validez)

===== HISTORIAL DE VERSIONES =====
v5.0 - Enero 2025: Actualización de política de IA, límites de uso
v4.0 - Junio 2023: Cambios en facturación, nuevos planes
v3.0 - Mayo 2022: Incorporación de arbitraje obligatorio
v2.0 - Enero 2021: Adición de límites de uso justo
v1.0 - Marzo 2019: Lanzamiento inicial

FECHA DE VIGOR: 01 de Enero de 2025
PRÓXIMA REVISIÓN: Enero 2026

Al hacer clic en "Acepto" o usar nuestros servicios, confirmas que has leído, comprendido y aceptado estos Términos de Servicio.`,
      categoriasNombres: ["Políticas de la empresa"]
   },
   {
      titulo: "Guía de configuración avanzada del sistema",
      contenido: `MANUAL DE CONFIGURACIÓN AVANZADA
TechCorp Solutions | Documento Técnico v2.5 | Para usuarios avanzados

ADVERTENCIA: Este documento contiene configuraciones avanzadas que pueden afectar el rendimiento y comportamiento de la plataforma. Solo procede si tienes conocimientos técnicos. Configuraciones incorrectas pueden degradar tu experiencia. TechCorp no se responsabiliza por configuraciones erróneas realizadas por usuarios.

NIVEL REQUERIDO: Intermedio a Avanzado
TIEMPO ESTIMADO: 45-60 minutos
PREREQUISITOS: Conocimientos básicos de APIs, JSON, OAuth, redes

===== TABLA DE CONTENIDOS =====
1. Configuración de seguridad avanzada
2. Integraciones con sistemas externos
3. Personalización de interfaz
4. Optimización de rendimiento
5. Configuración de red y proxies
6. Gestión avanzada de datos
7. Automatizaciones y webhooks
8. Configuración de CLI (Command Line Interface)

===== 1. CONFIGURACIÓN DE SEGURIDAD AVANZADA =====

1.1. AUTENTICACIÓN DE DOS FACTORES (2FA)
Habilitar 2FA:
Configuración > Seguridad > Autenticación de dos factores

MÉTODOS DISPONIBLES:
a) TOTP (Time-based One-Time Password):
   - Apps compatibles: Google Authenticator, Authy, 1Password
   - Escanea código QR o ingresa clave manualmente
   - Genera códigos de 6 dígitos cada 30 segundos
   - Códigos de respaldo: Guárdalos en lugar seguro (uso único)

b) SMS (menos seguro):
   - Requiere verificación de número telefónico
   - Códigos enviados vía SMS
   - No recomendado para cuentas críticas (vulnerabilidad SIM swapping)

c) Llaves de seguridad (FIDO2/WebAuthn):
   - Hardware: YubiKey, Google Titan Key
   - Más seguro, resistente a phishing
   - Configurar al menos 2 llaves (una de respaldo)

RECUPERACIÓN:
Códigos de respaldo: 10 códigos de uso único
CRÍTICO: Descarga y almacena offline antes de habilitar 2FA

1.2. SESIONES Y TOKENS
Configuración > Seguridad > Sesiones activas

GESTIÓN DE SESIONES:
- Ver dispositivos conectados (ubicación, IP, última actividad)
- Cerrar sesiones remotamente
- Configurar expiración automática:
  * Agresiva: 1 hora de inactividad
  * Normal: 24 horas
  * Extendida: 7 días
  * Persistente: 30 días (no recomendado)

API TOKENS:
Para integraciones y automatización:
1. Configuración > Desarrollador > Tokens de API
2. Generar nuevo token
3. Seleccionar permisos (principio de mínimo privilegio):
   - read:documents
   - write:documents
   - manage:users (solo administradores)
   - access:chats
4. COPIAR TOKEN INMEDIATAMENTE (se muestra una sola vez)
5. Almacenar de forma segura (gestor de contraseñas, variable de entorno)

REVOCACIÓN:
Tokens comprometidos pueden revocarse instantáneamente sin afectar otros tokens.

1.3. ALLOWLIST DE IPs
Para cuentas enterprise con requisitos de seguridad estrictos:

Configuración > Seguridad > Control de acceso por IP

CONFIGURAR:
1. Habilitar "Restringir acceso por IP"
2. Agregar rangos CIDR:
   Ejemplo: 192.168.1.0/24 (toda la subred)
   Ejemplo: 10.0.0.50/32 (IP única)
3. Agregar múltiples rangos (oficinas, VPN corporativa)

IMPORTANTE:
- Asegúrate de incluir tu IP actual
- Considera IPs dinámicas (pueden cambiar)
- VPN corporativa: Añadir IP de salida
- Trabajo remoto: Puede requerir desactivación temporal

BYPASS DE EMERGENCIA:
Contacta soporte con verificación de identidad si quedas bloqueado.

1.4. REGISTRO DE AUDITORÍA
Solo Plan Premium y Enterprise:

Configuración > Seguridad > Registro de actividad

EVENTOS REGISTRADOS:
- Inicio/cierre de sesión
- Cambios de contraseña
- Modificación de configuraciones sensibles
- Creación/eliminación de documentos
- Compartir/descompartir recursos
- Cambios de permisos
- Acceso a API

EXPORTAR LOGS:
- Formato: JSON o CSV
- Retención: 90 días (Premium), 365 días (Enterprise)
- Cumplimiento: SOC 2, ISO 27001

===== 2. INTEGRACIONES CON SISTEMAS EXTERNOS =====

2.1. SINGLE SIGN-ON (SSO)
Solo Enterprise. Contacta a ventas para habilitación.

PROTOCOLOS SOPORTADOS:
- SAML 2.0
- OAuth 2.0 / OpenID Connect
- LDAP (Active Directory)

CONFIGURACIÓN SAML:
1. Obtén metadata XML de tu IdP (Okta, Azure AD, Google Workspace)
2. Configuración > Integraciones > SSO > SAML
3. Carga metadata XML o ingresa datos manualmente:
   - SSO URL
   - Entity ID
   - Certificado X.509
4. Obtén nuestra URL de consumidor de aserción (ACS):
   https://app.techcorp.com/auth/saml/acs
5. Configura en tu IdP:
   - ACS URL: [URL de arriba]
   - Entity ID: https://app.techcorp.com
   - Mapeo de atributos:
     * email -> NameID o email attribute
     * firstName -> firstName
     * lastName -> lastName

PRUEBA ANTES DE FORZAR:
Permite SSO opcional hasta confirmar que funciona correctamente.

2.2. INTEGRACIONES DE ALMACENAMIENTO
Sincroniza con servicios en la nube:

GOOGLE DRIVE:
Configuración > Integraciones > Google Drive > Conectar
1. Autoriza acceso (OAuth)
2. Selecciona carpetas a sincronizar
3. Dirección de sincronización:
   - Solo lectura: TechCorp lee archivos de Drive
   - Bidireccional: Cambios sincronizados ambas direcciones
4. Frecuencia: Tiempo real, cada hora, manual

DROPBOX, ONEDRIVE:
Proceso similar. Ver documentación específica de cada integración.

ADVERTENCIA BIDIRECCIONAL:
Sincronización bidireccional puede causar conflictos si archivos se editan simultáneamente.

2.3. WEBHOOKS
Notificaciones en tiempo real de eventos:

Configuración > Integraciones > Webhooks > Nuevo webhook

CONFIGURAR:
1. URL de destino: https://tu-servidor.com/webhook
2. Eventos a escuchar:
   - document.created
   - document.updated
   - document.deleted
   - chat.message.received
   - user.login
3. Secreto: Generado automáticamente para verificar firma HMAC
4. Headers personalizados (opcional)
5. Reintentos: Automático con backoff exponencial (3 intentos)

VERIFICACIÓN DE FIRMA:

Ejemplo en JavaScript:
const crypto = require('crypto');
const signature = req.headers['x-techcorp-signature'];
const payload = JSON.stringify(req.body);
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid signature');
}

PAYLOAD EJEMPLO:

{
  "event": "document.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "document_id": "doc_abc123",
    "title": "Nuevo documento",
    "user_id": "user_xyz789"
  }
}

2.4. API REST
Documentación completa: api.techcorp.com/docs

ENDPOINT BASE: https://api.techcorp.com/v1

AUTENTICACIÓN:

Authorization: Bearer YOUR_API_TOKEN

EJEMPLOS:

Listar documentos:

curl -H "Authorization: Bearer TOKEN" 
  https://api.techcorp.com/v1/documents

Crear documento:

curl -X POST -H "Authorization: Bearer TOKEN" 
  -H "Content-Type: application/json" 
  -d '{"title": "Título", "content": "Contenido", "categories": ["cat_123"]}'
  https://api.techcorp.com/v1/documents

RATE LIMITING:
- Plan Plus: 1000 requests/hora
- Plan Premium: 10,000 requests/hora
- Enterprise: Personalizado

Headers de rate limit:
- X-RateLimit-Limit: Límite total
- X-RateLimit-Remaining: Requests restantes
- X-RateLimit-Reset: Timestamp de reset

===== 3. PERSONALIZACIÓN DE INTERFAZ =====

3.1. CSS PERSONALIZADO (Enterprise)
Configuración > Apariencia > CSS personalizado

Inyecta estilos CSS personalizados para branding corporativo:

Ejemplo CSS:
/* Cambiar colores primarios */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
}

/* Cambiar fuente */
body {
  font-family: 'Roboto', sans-serif;
}

/* Ocultar elementos específicos */
.social-share-buttons {
  display: none !important;
}

LÍMITES:
- Máximo 10KB de CSS
- No puede afectar funcionalidad crítica
- Validación automática antes de aplicar

3.2. LOGO Y BRANDING
Configuración > Apariencia > Branding

- Logo principal: 200x50px, PNG transparente
- Favicon: 32x32px, ICO o PNG
- Colores corporativos: Paleta de 5 colores
- Fuente personalizada: Carga fonts via Google Fonts o self-hosted

3.3. IDIOMA Y LOCALIZACIÓN
Configuración > Regional > Idioma

MÁS ALLÁ DE IDIOMA DE INTERFAZ:
- Formato de fecha: DD/MM/AAAA vs MM/DD/AAAA
- Formato de hora: 24h vs 12h (AM/PM)
- Separador decimal: coma vs punto
- Moneda: Símbolo y posición
- Primera día de semana: Domingo vs Lunes

===== 4. OPTIMIZACIÓN DE RENDIMIENTO =====

4.1. CACHÉ Y OFFLINE
Configuración > Avanzado > Caché

MODO OFFLINE:
- Habilitar: Almacena documentos localmente (IndexedDB)
- Espacio reservado: 50MB - 500MB
- Sincronización: Automática cuando vuelve conexión

CACHÉ AGRESIVO:
- Precarga: Carga documentos frecuentes en background
- Prefetch: Anticipa documentos que probablemente abras
- Trade-off: Mayor consumo de ancho de banda/almacenamiento

4.2. COMPRESIÓN
Configuración > Avanzado > Compresión

- Brotli (recomendado): Mejor compresión, navegadores modernos
- Gzip (fallback): Compatibilidad universal
- Sin compresión: Solo para debugging

4.3. LAZY LOADING
Configuración > Avanzado > Carga de imágenes

- Eager: Carga todas las imágenes inmediatamente
- Lazy: Carga solo imágenes visibles (ahorra datos)
- Progresivo: Muestra versión baja calidad primero

===== 5. CONFIGURACIÓN DE RED Y PROXIES =====

5.1. PROXY CORPORATIVO
Para entornos con proxy:

Variables de entorno (si usas CLI):

export HTTP_PROXY=http://proxy.empresa.com:8080
export HTTPS_PROXY=http://proxy.empresa.com:8080
export NO_PROXY=localhost,127.0.0.1

En navegador:
Usualmente configurado a nivel de sistema operativo o navegador, no en TechCorp.

5.2. CUSTOM DOMAIN (Enterprise)
Usa tu propio dominio: docs.tuempresa.com en lugar de app.techcorp.com

CONFIGURACIÓN DNS:

CNAME docs.tuempresa.com -> techcorp-custom.techcorp.com


Contacta soporte enterprise para:
- Configuración SSL/TLS
- Validación de dominio
- Propagación (24-48 horas)

===== 6. GESTIÓN AVANZADA DE DATOS =====

6.1. EXPORTACIÓN MASIVA
Configuración > Datos > Exportar todo

Formatos disponibles:
- JSON: Estructurado, ideal para importar a otros sistemas
- ZIP con archivos originales: Preserva formato original
- Markdown: Portabilidad máxima

Tiempo de procesamiento:
- <100 documentos: Instantáneo
- 100-1000 documentos: 10-30 minutos
- >1000 documentos: Puede tardar horas (recibes email cuando esté listo)

6.2. IMPORTACIÓN MASIVA
Configuración > Datos > Importar

FORMATOS SOPORTADOS:
- CSV con columnas: title, content, category
- JSON estructurado
- ZIP con múltiples archivos

MAPEO DE CAMPOS:
Especifica qué columnas corresponden a qué campos.

VALIDACIÓN:
El sistema valida antes de importar. Errores se reportan para corrección.

===== 7. AUTOMATIZACIONES Y WEBHOOKS =====

7.1. ZAPIER INTEGRATION
Conecta TechCorp con 5000+ aplicaciones:

1. Crea cuenta en Zapier
2. Busca "TechCorp Solutions"
3. Conecta con tu token de API
4. Crea Zaps:
   - Trigger: Nuevo documento en TechCorp
   - Action: Enviar a Slack, crear task en Asana, etc.

7.2. MAKE (INTEGROMAT)
Automatización visual similar a Zapier pero más potente.

===== 8. CLI (COMMAND LINE INTERFACE) =====

Para power users y DevOps:

INSTALACIÓN:

npm install -g @techcorp/cli
# o
brew install techcorp-cli


CONFIGURAR:

techcorp login
# Ingresa email y API token


COMANDOS COMUNES:

# Listar documentos
techcorp documents list

# Crear documento
techcorp documents create --title "Título" --content "Contenido"

# Subir archivo
techcorp documents upload ./archivo.pdf

# Descargar documento
techcorp documents download doc_123 --output ./descarga.pdf

# Buscar
techcorp search "término de búsqueda"


SCRIPTS:

#!/bin/bash
# Backup automatizado diario
techcorp export --format json --output backup-$(date +%Y%m%d).json


===== SOLUCIÓN DE PROBLEMAS =====

PROBLEMA: "API rate limit exceeded"
SOLUCIÓN: Espera reset o upgrade a Premium

PROBLEMA: "Webhook failing repeatedly"
SOLUCIÓN: Verifica tu servidor responde 200, timeout <5s

PROBLEMA: "SSO authentication failed"
SOLUCIÓN: Verifica mapeo de atributos en IdP

PROBLEMA: "Custom CSS not applying"
SOLUCIÓN: Limpia caché con Ctrl+Shift+Delete

===== SOPORTE AVANZADO =====

Para asistencia con configuraciones avanzadas:
Email: advanced-support@techcorp.com
Slack: #tech-support (Enterprise clientes)
Documentación: docs.techcorp.com
API Reference: api.techcorp.com

Este documento se actualiza trimestralmente.
Última actualización: Enero 2025
Próxima revisión: Abril 2025`,
      categoriasNombres: ["Soporte técnico"]
   },
   {
      titulo: "Política de uso aceptable de recursos",
      contenido: `POLÍTICA DE USO ACEPTABLE (AUP)
TechCorp Solutions | Revisión 3.0 | Enero 2025

PROPÓSITO
Esta Política de Uso Aceptable define las normas de conducta y uso responsable de nuestros servicios. El incumplimiento puede resultar en suspensión o terminación de cuenta, sin reembolso.

USOS PERMITIDOS
✓ Almacenamiento de documentación empresarial legítima
✓ Colaboración profesional entre equipos
✓ Integración con herramientas de productividad autorizadas
✓ Automatización de flujos de trabajo internos
✓ Uso educativo y académico
✓ Desarrollo y testing (dentro de límites razonables)

USOS PROHIBIDOS

1. ACTIVIDADES ILEGALES
✗ Almacenamiento de contenido que viole leyes locales o internacionales
✗ Distribución de material con derechos de autor sin autorización
✗ Fraude, phishing, o engaño
✗ Lavado de dinero o financiamiento ilícito
✗ Tráfico de información confidencial robada

2. ABUSO TÉCNICO
✗ Intentos de acceso no autorizado (hacking, cracking)
✗ Ingeniería inversa de la plataforma
✗ Scraping automatizado sin autorización
✗ Ataques DDoS o sobrecarga intencional
✗ Explotación de vulnerabilidades sin reportar
✗ Bypass de límites de tasa o cuotas

3. CONTENIDO PROHIBIDO
✗ Malware, virus, ransomware, spyware
✗ Material terrorista o que incite a la violencia
✗ Pornografía infantil (reportado a autoridades)
✗ Contenido que promueva discriminación o acoso
✗ Información personal de terceros sin consentimiento
✗ Spam o correo masivo no solicitado

4. ABUSO DE RECURSOS
✗ Reventa no autorizada del servicio
✗ Uso de cuentas compartidas para evadir límites
✗ Mining de criptomonedas en nuestra infraestructura
✗ Almacenamiento de backups de terceros (no es servicio de backup)
✗ Hosting de archivos para distribución pública masiva

EJEMPLOS DE VIOLACIONES

CASO 1: Usuario crea 50 cuentas falsas para obtener almacenamiento "gratis"
ACCIÓN: Terminación de todas las cuentas + ban de IP

CASO 2: Empresa usa plataforma para almacenar datos médicos sin cifrado adecuado
ACCIÓN: Advertencia + requerimiento de cumplimiento HIPAA

CASO 3: Usuario sube malware disfrazado como documento PDF
ACCIÓN: Terminación inmediata + reporte a autoridades

MONITOREO Y CUMPLIMIENTO

MÉTODOS AUTOMÁTICOS:
- Análisis de patrones de uso anómalo
- Escaneo de malware en archivos subidos
- Detección de contenido prohibido via IA
- Alertas de consumo excesivo de recursos

REVISIÓN MANUAL:
- Investigaciones por reportes de usuarios
- Auditorías aleatorias de cumplimiento
- Respuesta a órdenes judiciales

PRIVACIDAD: No accedemos al contenido de documentos excepto cuando sea necesario para cumplimiento legal o seguridad.

PROCESO DE VIOLACIÓN

PRIMERA OFENSA MENOR:
1. Notificación por email con detalles
2. Plazo de 48 horas para corregir
3. Advertencia registrada en cuenta

OFENSA MODERADA O REINCIDENTE:
1. Suspensión temporal (7-30 días)
2. Obligación de eliminar contenido problemático
3. Posible degradación de plan

OFENSA GRAVE:
1. Terminación inmediata de cuenta
2. Sin reembolso de pagos realizados
3. Posible ban permanente de plataforma
4. Reporte a autoridades si aplica

DERECHO A APELACIÓN

Tienes 14 días para apelar una suspensión:
- Email a appeals@techcorp.com
- Proporciona explicación y evidencia
- Decisión en 5 días hábiles
- Decisión final es vinculante

REPORTAR VIOLACIONES

Si detectas uso indebido por otros usuarios:
- Botón "Reportar abuso" en cualquier documento
- Email: abuse@techcorp.com
- Reportes anónimos aceptados
- Respuesta en 24 horas

CAMBIOS A ESTA POLÍTICA

Nos reservamos el derecho de modificar esta AUP en cualquier momento. Cambios significativos serán notificados con 30 días de anticipación.

CONTACTO
abuse@techcorp.com - Reportar violaciones
legal@techcorp.com - Preguntas legales sobre AUP

Última actualización: Enero 2025`,
      categoriasNombres: ["Políticas de la empresa"]
   },
   {
      titulo: "Manual de integración con APIs externas",
      contenido: `MANUAL DE INTEGRACIÓN CON APIS
TechCorp Solutions | Guía del Desarrollador v2.0

INTRODUCCIÓN
Este manual técnico describe cómo conectar TechCorp con servicios externos mediante nuestra API REST. Requiere conocimientos intermedios de desarrollo web, HTTP, y APIs RESTful.

AUTENTICACIÓN

OAUTH 2.0 (RECOMENDADO)
Para aplicaciones que actúan en nombre de usuarios:

1. Registra tu aplicación:
   Configuración > Desarrollador > Registrar aplicación
   
2. Obtén credenciales:
   - Client ID: Identificador público
   - Client Secret: Clave privada (¡nunca expongas!)
   - Redirect URI: URL de callback

3. Flujo de autorización:
   
   PASO 1 - Redirige al usuario:
   
   GET https://app.techcorp.com/oauth/authorize?
       client_id=YOUR_CLIENT_ID&
       redirect_uri=YOUR_REDIRECT_URI&
       response_type=code&
       scope=read:documents write:documents
   
   
   PASO 2 - Recibe código de autorización:
   Usuario aprueba, redirección a: YOUR_REDIRECT_URI?code=AUTH_CODE
   
   PASO 3 - Intercambia código por token:
   
   POST https://api.techcorp.com/oauth/token
   Content-Type: application/json
   
   {
     "grant_type": "authorization_code",
     "code": "AUTH_CODE",
     "client_id": "YOUR_CLIENT_ID",
     "client_secret": "YOUR_CLIENT_SECRET",
     "redirect_uri": "YOUR_REDIRECT_URI"
   }
   
   
   RESPUESTA:
   
   {
     "access_token": "eyJhbGc...",
     "token_type": "Bearer",
     "expires_in": 3600,
     "refresh_token": "dGVzdC1yZWZ..."
   }
   
   
   PASO 4 - Usa el token:
   
   GET https://api.techcorp.com/v1/documents
   Authorization: Bearer ACCESS_TOKEN
   

REFRESH TOKENS
Access tokens expiran en 1 hora. Usa refresh token para renovar:


POST https://api.techcorp.com/oauth/token
{
  "grant_type": "refresh_token",
  "refresh_token": "REFRESH_TOKEN",
  "client_id": "CLIENT_ID",
  "client_secret": "CLIENT_SECRET"
}


API KEYS (PARA SCRIPTS/BACKENDS)
Para acceso server-to-server sin usuario:

1. Genera API Key: Configuración > Desarrollador > API Keys
2. Copia la key (se muestra una sola vez)
3. Usa en header:
   
   Authorization: Bearer API_KEY
   

SCOPES (PERMISOS)
Solicita solo los permisos necesarios:

- read:documents - Leer documentos
- write:documents - Crear/editar documentos
- delete:documents - Eliminar documentos
- read:profile - Ver perfil de usuario
- write:profile - Editar perfil
- admin:* - Acceso administrativo (requiere aprobación)

ENDPOINTS PRINCIPALES

DOCUMENTOS

Listar documentos:

GET /v1/documents
Query params:
  - limit (default: 50, max: 100)
  - offset (pagination)
  - category (filter by category ID)
  - search (full-text search)


Obtener documento:

GET /v1/documents/{document_id}


Crear documento:

POST /v1/documents
Content-Type: application/json

{
  "title": "Título del documento",
  "content": "Contenido...",
  "categories": ["cat_id1", "cat_id2"]
}


Actualizar documento:

PUT /v1/documents/{document_id}
{
  "title": "Nuevo título",
  "content": "Nuevo contenido"
}


Eliminar documento:

DELETE /v1/documents/{document_id}


CATEGORÍAS

GET /v1/categories - Listar todas
GET /v1/categories/{id} - Obtener una


USUARIO

GET /v1/users/me - Perfil actual
PUT /v1/users/me - Actualizar perfil


RATE LIMITING

LÍMITES POR PLAN:
- Plan Plus: 1,000 requests/hora
- Plan Premium: 10,000 requests/hora
- Enterprise: Negociable

HEADERS DE RESPUESTA:

X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1642521600


CUANDO EXCEDES:

HTTP 429 Too Many Requests
Retry-After: 3600

{
  "error": "rate_limit_exceeded",
  "message": "Too many requests, retry after 3600 seconds"
}


MANEJO DE ERRORES

CÓDIGOS HTTP:
- 200: OK
- 201: Created
- 204: No Content (delete exitoso)
- 400: Bad Request (datos inválidos)
- 401: Unauthorized (sin auth o token expirado)
- 403: Forbidden (sin permisos)
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

FORMATO DE ERROR:

{
  "error": "validation_error",
  "message": "Title is required",
  "details": {
    "field": "title",
    "issue": "missing"
  }
}


WEBHOOKS

Recibe notificaciones en tiempo real:

CONFIGURAR:
1. Configuración > Integraciones > Webhooks
2. URL de destino: https://tu-servidor.com/webhook
3. Eventos: Selecciona cuáles escuchar
4. Secreto: Usa para verificar firma

EVENTOS DISPONIBLES:
- document.created
- document.updated
- document.deleted
- user.updated
- chat.message.new

PAYLOAD:

{
  "event": "document.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "id": "doc_123",
    "title": "Nuevo documento",
    "user_id": "user_456"
  }
}


VERIFICAR FIRMA:
Ejemplo Python:
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)


SDKS Y LIBRERÍAS

OFICIALES:
- JavaScript/Node.js: npm install @techcorp/sdk
- Python: pip install techcorp-sdk
- PHP: composer require techcorp/sdk

COMUNIDAD:
- Ruby: gem install techcorp
- Go: go get github.com/techcorp/go-sdk
- Java: Disponible en Maven Central

EJEMPLO BÁSICO (Node.js):
Ejemplo JavaScript:
const TechCorp = require('@techcorp/sdk');

const client = new TechCorp({
  apiKey: process.env.TECHCORP_API_KEY
});

// Listar documentos
const docs = await client.documents.list();

// Crear documento
const newDoc = await client.documents.create({
  title: 'Mi documento',
  content: 'Contenido aquí',
  categories: ['cat_123']
});


MEJORES PRÁCTICAS

1. SEGURIDAD:
   - Nunca expongas API keys en código frontend
   - Usa variables de entorno
   - Rota keys periódicamente
   - Implementa firma de webhooks

2. RENDIMIENTO:
   - Cachea respuestas cuando sea posible
   - Usa paginación para listas grandes
   - Batch requests cuando la API lo soporte
   - Respeta rate limits

3. MANEJO DE ERRORES:
   - Implementa retry con backoff exponencial
   - Loguea errores para debugging
   - Maneja tokens expirados (refresh automático)

SANDBOX Y TESTING

Usa entorno de pruebas:
- Base URL: https://api-sandbox.techcorp.com
- Datos de prueba precargados
- Sin afectar datos de producción
- Mismo API, diferentes credenciales

SOPORTE

- Documentación completa: api.techcorp.com/docs
- API Reference interactiva: api.techcorp.com/reference
- GitHub: github.com/techcorp/api-examples
- Email: api-support@techcorp.com
- Discord: discord.gg/techcorp-dev

Última actualización: Enero 2025`,
      categoriasNombres: ["Soporte técnico"]
   },
   {
      titulo: "Código de conducta de la comunidad",
      contenido: `CÓDIGO DE CONDUCTA DE LA COMUNIDAD
TechCorp Solutions | Versión 2.0 | Enero 2025

NUESTRA PROMESA
En TechCorp nos comprometemos a proporcionar un ambiente profesional, respetuoso e inclusivo para todos los usuarios, sin importar edad, género, identidad, orientación sexual, discapacidad, apariencia física, raza, etnia, religión, o nivel de experiencia técnica.

VALORES FUNDAMENTALES

1. RESPETO MUTUO
Tratamos a todos los miembros con dignidad y consideración. Las diferencias de opinión son bienvenidas, pero siempre manteniendo un tono profesional y constructivo.

2. COLABORACIÓN
Promovemos el trabajo en equipo y el intercambio de conocimientos. Ayudar a otros fortalece a toda la comunidad.

3. PROFESIONALISMO
Mantenemos estándares altos de conducta profesional en todas las interacciones, incluyendo documentos compartidos, comentarios, y comunicaciones.

4. INCLUSIÓN
Nos esforzamos por crear un espacio donde todos se sientan bienvenidos y valorados, independientemente de su background o circunstancias.

COMPORTAMIENTOS ESPERADOS

✓ COMUNICACIÓN RESPETUOSA:
  - Usa lenguaje profesional y cortés
  - Sé paciente con usuarios menos experimentados
  - Acepta críticas constructivas con gracia
  - Da feedback de manera constructiva y empática

✓ COLABORACIÓN EFECTIVA:
  - Comparte conocimiento y recursos
  - Atribuye crédito cuando uses trabajo de otros
  - Respeta la propiedad intelectual
  - Sé claro y transparente en tus comunicaciones

✓ RESPONSABILIDAD:
  - Cumple tus compromisos
  - Admite errores y aprende de ellos
  - Reporta comportamientos inapropiados
  - Protege información confidencial

COMPORTAMIENTOS INACEPTABLES

✗ ACOSO Y DISCRIMINACIÓN:
  - Comentarios ofensivos sobre características personales
  - Ataques personales o ad hominem
  - Intimidación, bullying, o stalking
  - Avances sexuales no deseados
  - Publicación de información privada sin consentimiento (doxxing)

✗ COMPORTAMIENTO DISRUPTIVO:
  - Spam o autopromoción excesiva
  - Trolling o provocaciones intencionales
  - Sabotaje de trabajo colaborativo
  - Interrupciones constantes o monopolización de espacios

✗ CONTENIDO INAPROPIADO:
  - Material sexualmente explícito
  - Violencia gráfica
  - Discurso de odio
  - Propaganda política extremista
  - Desinformación intencional

APLICACIÓN DEL CÓDIGO

PROCESO DE REPORTE:
1. Si presencias o eres víctima de violación:
   - Reporta a: conduct@techcorp.com
   - O usa botón "Reportar" en la plataforma
   - Proporciona detalles y evidencia (capturas, enlaces)

2. Todos los reportes son:
   - Confidenciales
   - Investigados imparcialmente
   - Respondidos en 48 horas hábiles

3. Investigación:
   - Equipo de conducta revisa evidencia
   - Entrevista a partes involucradas si es necesario
   - Decisión en 5-10 días hábiles

CONSECUENCIAS DE VIOLACIONES

NIVEL 1 - ADVERTENCIA:
- Primera ofensa menor no intencional
- Advertencia privada por escrito
- Orientación sobre conducta esperada
- Ninguna otra consecuencia

NIVEL 2 - SUSPENSIÓN TEMPORAL:
- Ofensa moderada o reincidente
- Suspensión de 7-30 días
- Pérdida temporal de privilegios de colaboración
- Reunión obligatoria con equipo de conducta

NIVEL 3 - SUSPENSIÓN EXTENDIDA:
- Ofensa grave o múltiples reincidencias
- Suspensión de 30-90 días
- Revisión de cuenta antes de reactivación
- Posible downgrade de plan sin reembolso

NIVEL 4 - EXPULSIÓN PERMANENTE:
- Violación muy grave (acoso severo, amenazas)
- Ban permanente de la plataforma
- Sin reembolso
- Reporte a autoridades si aplica

EJEMPLOS DE APLICACIÓN

CASO 1: Usuario hace comentario sexista en documento compartido
ACCIÓN: Nivel 1 - Advertencia + eliminación de comentario

CASO 2: Usuario acosa repetidamente a otro vía mensajes privados
ACCIÓN: Nivel 3 - Suspensión 60 días + prohibición de contacto

CASO 3: Usuario publica información personal de otro sin consentimiento
ACCIÓN: Nivel 4 - Expulsión permanente + reporte a autoridades

APELACIONES

Tienes derecho a apelar decisiones:
- Plazo: 14 días desde notificación
- Envía a: appeals@techcorp.com
- Panel independiente revisa
- Decisión final en 30 días

PROTECCIÓN CONTRA REPRESALIAS

Tomar represalias contra quien reporta violaciones es en sí una violación grave.
- Prohibido: amenazas, intimidación, o discriminación contra reportadores
- Reporte de represalias: retaliation@techcorp.com
- Investigación prioritaria

PRIVACIDAD DE REPORTES

- Identidad del reportador protegida
- Información compartida solo con quienes necesiten saber
- Datos de investigación confidenciales
- Resultados comunicados a partes relevantes únicamente

RESPONSABILIDAD COMPARTIDA

Este código se aplica a:
✓ Documentos compartidos y comentarios
✓ Mensajes directos entre usuarios
✓ Integraciones con servicios externos autorizados
✓ Eventos o espacios patrocinados por TechCorp
✓ Uso de marca TechCorp en otros contextos

RECURSOS DE APOYO

Si experimentas acoso o discriminación:
- Crisis Support: 24/7 helpline disponible
- Counseling: Acceso a recursos de salud mental
- Legal Guidance: Asesoría legal básica disponible
- Safety Planning: Ayuda para proteger tu seguridad

MEJORA CONTINUA

Este código es un documento vivo:
- Retroalimentación bienvenida: feedback@techcorp.com
- Revisión anual o cuando sea necesario
- Comunidad involucrada en actualizaciones
- Transparencia en cambios significativos

AGRADECIMIENTOS

Este código se inspira en:
- Contributor Covenant
- Django Code of Conduct
- Código de Conducta de Conferencias tech líderes

COMPROMISO DE LIDERAZGO

El equipo de TechCorp se compromete a:
- Modelar conducta ejemplar
- Escuchar activamente a la comunidad
- Tomar acción contra violaciones
- Mejorar continuamente nuestros procesos

CONTACTO
conduct@techcorp.com - Reportar violaciones
feedback@techcorp.com - Sugerencias sobre el código

Juntos creamos un ambiente donde todos pueden prosperar.

Última actualización: Enero 2025
Próxima revisión: Enero 2026`,
      categoriasNombres: ["Políticas de la empresa"]
   },
   {
      titulo: "Procedimientos de backup y recuperación de datos",
      contenido: `MANUAL DE BACKUP Y RECUPERACIÓN DE DATOS
TechCorp Solutions | Documento Técnico | Enero 2025

FILOSOFÍA DE PROTECCIÓN DE DATOS
En TechCorp, la seguridad y disponibilidad de tus datos es nuestra máxima prioridad. Implementamos múltiples capas de protección mediante backups automáticos, redundancia geográfica, y procedimientos de recuperación ante desastres.

SISTEMA DE BACKUPS AUTOMÁTICOS

FRECUENCIA Y TIPOS:

1. BACKUPS INCREMENTALES (Cada hora)
   - Se guardan solo cambios desde el último backup
   - Mínimo impacto en rendimiento
   - Retención: 48 horas
   - Permite recuperación a cualquier hora del día actual o anterior

2. BACKUPS DIFERENCIALES (Cada 6 horas)
   - Capturan cambios desde el último backup completo
   - Balance entre espacio y velocidad de recuperación
   - Retención: 7 días
   - Recuperación más rápida que incrementales

3. BACKUPS COMPLETOS (Diario a medianoche UTC)
   - Snapshot completo de todos tus datos
   - Retención: 30 días (Plus), 90 días (Premium), 365 días (Enterprise)
   - Recuperación más confiable

ALCANCE DEL BACKUP:
✓ Todos los documentos y su contenido
✓ Metadatos (categorías, fechas, permisos)
✓ Configuración de cuenta y preferencias
✓ Historial de versiones de documentos
✓ Estructura de carpetas y organización
✓ Chats y conversaciones con IA

NO INCLUIDO:
✗ Sesiones activas (debes iniciar sesión nuevamente)
✗ Tokens de API (por seguridad, deben regenerarse)
✗ Caché local del navegador

REDUNDANCIA GEOGRÁFICA

MÚLTIPLES UBICACIONES:
- Datacenter Primario: AWS US-West (Oregon)
- Datacenter Secundario: AWS EU-Central (Frankfurt)
- Datacenter Terciario: AWS Asia-Pacific (Singapur)

SINCRONIZACIÓN:
- Replicación en tiempo real a datacenter secundario
- Sincronización cada 6 horas a datacenter terciario
- Si un datacenter falla, otro toma el control automáticamente (failover)

RPO Y RTO:
- RPO (Recovery Point Objective): Máximo 1 hora de pérdida de datos
- RTO (Recovery Time Objective): Restauración en menos de 4 horas

RECUPERACIÓN DE DATOS

AUTO-RECUPERACIÓN (Sin contactar soporte):

1. RECUPERAR DOCUMENTO ELIMINADO:
   Configuración > Papelera > Buscar documento > Restaurar
   
   - Documentos eliminados permanecen 30 días
   - Después de 30 días, solo soporte puede recuperar (si está en backup)
   - Restauración instantánea

2. RECUPERAR VERSIÓN ANTERIOR:
   Documento > Historial de versiones > Seleccionar versión > Restaurar
   
   - Todas las versiones guardadas disponibles
   - Puedes ver dif antes de restaurar
   - No sobrescribe versión actual hasta confirmar

3. EXPORTAR BACKUP PERSONAL:
   Configuración > Datos > Exportar todo
   
   - Genera archivo ZIP con todos tus datos
   - Disponible para descarga 7 días
   - Puedes hacerlo mensualmente como backup local

RECUPERACIÓN CON ASISTENCIA DE SOPORTE:

ESCENARIO 1: Eliminación accidental hace > 30 días
1. Contacta: recovery@techcorp.com
2. Proporciona:
   - Nombre/descripción del documento
   - Fecha aproximada de eliminación
   - Tu ID de usuario
3. Soporte busca en backups históricos
4. Si se encuentra, te envían enlace de restauración
5. Tiempo de recuperación: 24-48 horas

ESCENARIO 2: Corrupción de datos
Si detectas que un documento está corrupto:
1. NO modifiques el documento
2. Reporta inmediatamente: corruption@techcorp.com
3. Incluye capturas de pantalla del problema
4. Soporte restaura desde último backup válido
5. Tiempo: 2-4 horas

ESCENARIO 3: Cuenta comprometida
Si tu cuenta fue hackeada y datos eliminados/modificados:
1. Reporta URGENTE: security@techcorp.com
2. Cambia contraseña inmediatamente
3. Soporte congela cuenta y revierte cambios
4. Restauración desde backup pre-compromiso
5. Investigación de seguridad incluida

RECUPERACIÓN ANTE DESASTRES

PLAN DE CONTINUIDAD DE NEGOCIO:

NIVEL 1 - Fallo de Servidor Individual:
- Failover automático a otro servidor
- Sin intervención necesaria
- Downtime: 0-5 minutos
- Sin pérdida de datos

NIVEL 2 - Fallo de Datacenter Completo:
- Switchover automático a datacenter secundario
- Notificación enviada automáticamente
- Downtime: 15-30 minutos
- Pérdida de datos: Máximo últimos 15 minutos

NIVEL 3 - Desastre Catastrófico:
- Activación manual del datacenter terciario
- Equipo de emergencia 24/7 responde
- Downtime: 2-4 horas
- Pérdida de datos: Máximo últimas 6 horas

PRUEBAS DE RECUPERACIÓN:
- Simulacros trimestrales de disaster recovery
- Pruebas de restauración de backups semanales
- Auditorías anuales por terceros

RECOMENDACIONES DE MEJORES PRÁCTICAS

PARA USUARIOS INDIVIDUALES:

1. BACKUPS LOCALES ADICIONALES:
   - Exporta datos importantes mensualmente
   - Guarda en disco externo o cloud personal
   - No dependas únicamente de TechCorp (regla 3-2-1)

2. VERSIONADO CONSCIENTE:
   - Guarda versiones importantes manualmente
   - Usa nombres descriptivos para versiones
   - Documenta cambios significativos

3. DOCUMENTACIÓN CRÍTICA:
   - Identifica documentos críticos para el negocio
   - Considera exportarlos regularmente
   - Mantén copias en formato PDF

PARA EQUIPOS Y EMPRESAS:

1. PLAN DE RECUPERACIÓN:
   - Documenta proceso de recuperación interno
   - Asigna responsables de backup/recuperación
   - Establece RPO/RTO aceptables para tu org

2. CAPACITACIÓN:
   - Entrena a equipo en procedimientos de recuperación
   - Realiza drills de recuperación
   - Documenta lecciones aprendidas

3. COMPLIANCE:
   - Verifica que backups cumplan regulaciones de tu industria
   - Mantén evidencia de backups para auditorías
   - Revisa políticas de retención regularmente

MONITOREO Y ALERTAS

NOTIFICACIONES AUTOMÁTICAS:

- Backup Exitoso: Email semanal resumiendo backups
- Backup Fallido: Alerta inmediata al equipo técnico
- Espacio Bajo: Aviso cuando alcances 80% de cuota
- Acceso Inusual: Alerta si detectamos actividad sospechosa

PANEL DE ESTADO:
Configuración > Seguridad > Estado de Backups

Muestra:
- Último backup exitoso (fecha/hora)
- Tamaño total de backups
- Backups disponibles para restauración
- Próximo backup programado

CUMPLIMIENTO Y CERTIFICACIONES

ESTÁNDARES:
✓ ISO 27001 - Gestión de seguridad de información
✓ SOC 2 Type II - Controles de disponibilidad y seguridad
✓ GDPR Compliant - Protección de datos europeos
✓ HIPAA Ready - Para datos de salud (Enterprise)

AUDITORÍAS:
- Auditorías externas anuales
- Reportes disponibles bajo NDA
- Certificados publicados en: techcorp.com/compliance

TRANSPARENCIA:
- Status page pública: status.techcorp.com
- Incidentes reportados en tiempo real
- Post-mortems publicados después de incidentes

COSTOS Y LIMITACIONES

INCLUIDO EN TU PLAN:
- Plus: 30 días de retención, 5GB backup
- Premium: 90 días de retención, almacenamiento ilimitado
- Enterprise: 365 días, almacenamiento ilimitado, backups customizados

SERVICIOS ADICIONALES:
- Retención extendida (>365 días): $5/mes por año adicional
- Backups bajo demanda: Incluidos (sin costo)
- Recuperación de emergencia fuera de horas: Incluido en Premium/Enterprise

LÍMITES:
- Máximo 10 restauraciones por mes (Plus)
- Ilimitadas restauraciones (Premium/Enterprise)
- Tamaño máximo por restauración: 50GB

PREGUNTAS FRECUENTES

P: ¿Puedo programar backups manuales adicionales?
R: Sí, Premium/Enterprise pueden programar backups custom.

P: ¿Los backups están cifrados?
R: Sí, AES-256 en reposo, TLS 1.3 en tránsito.

P: ¿Puedo recuperar solo parte de mis datos?
R: Sí, recuperación granular a nivel de documento.

P: ¿Qué pasa si mi empresa es demandada y necesito retener datos?
R: Contacta legal@techcorp.com para "legal hold" que preserva datos indefinidamente.

CONTACTO Y SOPORTE

EMERGENCIAS (24/7):
- recovery@techcorp.com
- Tel: +1-800-RECOVER
- Chat: Opción "Recuperación de datos urgente"

NO EMERGENCIAS:
- support@techcorp.com
- Ticket en plataforma
- Respuesta en 4 horas hábiles

Última actualización: Enero 2025
Próxima auditoría: Abril 2025`,
      categoriasNombres: ["Soporte técnico", "Políticas de la empresa"]
   },
   {
      titulo: "Guía de optimización de rendimiento",
      contenido: `GUÍA DE OPTIMIZACIÓN DE RENDIMIENTO
TechCorp Solutions | Best Practices | Enero 2025

OBJETIVO
Esta guía te ayudará a maximizar el rendimiento de la plataforma TechCorp, reducir tiempos de carga, y mejorar tu productividad mediante configuraciones y hábitos optimizados.

DIAGNÓSTICO DE RENDIMIENTO

INDICADORES DE RENDIMIENTO LENTO:
- Páginas tardan >3 segundos en cargar
- Lag al escribir en documentos
- Búsquedas toman >5 segundos
- Imágenes no cargan o lo hacen muy lento
- Interfaz se congela frecuentemente

HERRAMIENTAS DE DIAGNÓSTICO:

1. MONITOR DE RENDIMIENTO INTEGRADO:
   Configuración > Avanzado > Rendimiento
   
   Muestra:
   - Velocidad de carga de página (ms)
   - Latencia al servidor (ping)
   - Uso de memoria del navegador
   - Tiempo de renderizado de documentos
   - FPS (frames per second) de la interfaz

2. TEST DE VELOCIDAD:
   Configuración > Diagnóstico > Test de velocidad
   
   Ejecuta prueba de 60 segundos que mide:
   - Download speed
   - Upload speed
   - Latency to TechCorp servers
   - Packet loss
   
3. CONSOLE DEL NAVEGADOR (Para usuarios avanzados):
   F12 > Console > Network tab
   Identifica recursos lentos

OPTIMIZACIONES DEL NAVEGADOR

1. CACHÉ DEL NAVEGADOR:
   
   LIMPIEZA REGULAR:
   - Cada semana: Ctrl+Shift+Delete > Caché
   - Mantiene: Cookies, contraseñas guardadas
   - Elimina: Imágenes y archivos en caché
   
   BENEFICIO: Elimina recursos obsoletos que ralentizan carga

2. EXTENSIONES DEL NAVEGADOR:
   
   DESACTIVA NO ESENCIALES:
   - Adblockers agresivos pueden bloquear recursos legítimos
   - Extensiones de VPN reducen velocidad
   - Demasiadas extensiones consumen RAM
   
   RECOMENDACIÓN: Mantén máximo 5-7 extensiones activas
   
   MODO INCÓGNITO PARA PROBAR:
   - Abre TechCorp en ventana incógnita
   - Si funciona mejor, una extensión es el problema
   - Desactiva una por una para identificar culpable

3. ACTUALIZAR NAVEGADOR:
   
   Navegadores actualizados son más rápidos:
   - Chrome/Edge: Menu > Ayuda > Acerca de (actualiza automáticamente)
   - Firefox: Menu > Ayuda > Acerca de Firefox
   - Safari: Actualiza con macOS
   
   VERSIONES RECOMENDADAS:
   - Chrome 120+
   - Firefox 120+
   - Safari 17+
   - Edge 120+

4. HARDWARE ACCELERATION:
   
   HABILITAR ACELERACIÓN GPU:
   Chrome: Settings > System > Use hardware acceleration when available
   Firefox: Preferences > General > Performance > Use hardware acceleration
   
   BENEFICIO: Usa GPU para renderizar, libera CPU

OPTIMIZACIONES DE RED

1. VELOCIDAD DE INTERNET:
   
   REQUISITOS MÍNIMOS:
   - Download: 5 Mbps
   - Upload: 2 Mbps
   - Latency: <150ms
   
   ÓPTIMO:
   - Download: 25+ Mbps
   - Upload: 10+ Mbps
   - Latency: <50ms
   
   MEDIR: speedtest.net

2. CONEXIÓN ETHERNET VS WIFI:
   
   ETHERNET (Cable):
   ✓ Más estable
   ✓ Latencia menor
   ✓ Sin interferencias
   
   WIFI:
   ✓ Móvil y conveniente
   ✗ Puede tener interferencias
   ✗ Latencia variable
   
   RECOMENDACIÓN: Ethernet para operaciones críticas

3. WIFI OPTIMIZATION:
   
   Si debes usar WiFi:
   - Usa banda 5GHz en vez de 2.4GHz (si disponible)
   - Colócate cerca del router
   - Evita obstáculos (paredes, muebles metálicos)
   - Cambia canal WiFi si hay interferencia
   - Actualiza firmware del router

4. VPN CONSIDERATIONS:
   
   VPNs REDUCEN VELOCIDAD:
   - Añaden latencia (50-200ms típico)
   - Reducen throughput
   
   OPTIMIZAR VPN:
   - Usa servidor VPN geográficamente cercano
   - Protocolo WireGuard es más rápido que OpenVPN
   - Split tunneling: Excluye TechCorp de VPN si politicas permiten

OPTIMIZACIONES DE LA PLATAFORMA

1. MODO DE RENDIMIENTO:
   
   Configuración > Apariencia > Modo de rendimiento
   
   OPCIONES:
   - Balanced (default): Balance entre belleza y velocidad
   - Performance: Prioriza velocidad, reduce animaciones
   - Quality: Máxima calidad visual, puede ser más lento
   
   RECOMENDACIÓN: Performance para equipos antiguos o conexiones lentas

2. LAZY LOADING:
   
   Configuración > Avanzado > Carga de imágenes > Lazy
   
   BENEFICIO: Carga imágenes solo cuando las ves
   Ahorra ancho de banda y acelera carga inicial de páginas

3. COMPRESIÓN:
   
   Configuración > Avanzado > Compresión > Brotli
   
   Reduce tamaño de transferencia en ~30%
   Requiere navegador moderno (todos los actuales lo soportan)

4. PRECARGA:
   
   Configuración > Avanzado > Precarga de documentos frecuentes
   
   Sistema predice qué documentos abrirás y los pre-carga en background
   Trade-off: Usa más ancho de banda pero documentos abren instantáneamente

5. OFFLINE MODE:
   
   Configuración > Avanzado > Modo offline
   
   Descarga documentos frecuentes para acceso sin internet
   Sincroniza cambios automáticamente cuando vuelve conexión
   
   BENEFICIO: Trabaja incluso con internet intermitente

OPTIMIZACIÓN DE HARDWARE

1. RAM (MEMORIA):
   
   REQUISITOS:
   - Mínimo: 4GB
   - Recomendado: 8GB+
   - Óptimo: 16GB+
   
   SI TIENES POCA RAM:
   - Cierra pestañas/apps no usadas
   - Reinicia navegador diariamente
   - Usa modo Performance de TechCorp
   - Considera upgrade de hardware

2. PROCESADOR (CPU):
   
   TechCorp es compatible con CPUs antiguas, pero:
   - Dual-core mínimo
   - 2GHz+ recomendado
   - Procesadores de 2015+ funcionan bien
   
   MONITOREALA USO:
   - Windows: Task Manager (Ctrl+Shift+Esc)
   - Mac: Activity Monitor
   - Si CPU está constantemente >80%, cierra otros programas

3. DISCO DURO:
   
   SSD VS HDD:
   - SSD: 5-10x más rápido para caché del navegador
   - HDD: Funciona pero con lag ocasional
   
   RECOMENDACIÓN: SSD si es posible, gran diferencia en experiencia

4. PANTALLA:
   
   RESOLUCIÓN:
   - Resoluciones muy altas (4K) requieren más GPU
   - Si rendimiento es problema, usa 1080p
   - Dual monitors: Más RAM requerida

MEJORES PRÁCTICAS DE USO

1. GESTIÓN DE DOCUMENTOS:
   
   EVITA DOCUMENTOS MUY LARGOS:
   - Máximo recomendado: 5,000 palabras por documento
   - Documentos >10,000 palabras: Dividir en secciones
   - Imágenes: Comprimir antes de subir
   
   ORGANIZACIÓN:
   - Usa categorías para filtrar rápido
   - Archiva documentos viejos
   - Elimina borradores no usados

2. BÚSQUEDAS EFICIENTES:
   
   - Sé específico en términos de búsqueda
   - Usa filtros de categoría para reducir resultados
   - Búsquedas de 1-2 palabras son más rápidas que frases largas
   - Guarda búsquedas frecuentes como favoritas

3. COLABORACIÓN:
   
   DOCUMENTOS COMPARTIDOS:
   - Evita editar simultáneamente con >5 personas
   - Usa comentarios en vez de edición directa cuando sea posible
   - Sincroniza cambios antes de cerrar documento

4. CHATS CON IA:
   
   - Consultas concisas son más rápidas de procesar
   - Espera respuesta completa antes de enviar siguiente mensaje
   - Historial de chat largo ralentiza carga, archiva chats viejos

MONITOREO PROACTIVO

ALERTAS AUTOMÁTICAS:
Configuración > Notificaciones > Alertas de rendimiento

ACTIVA ALERTAS PARA:
- Latencia alta (>300ms)
- Uso de memoria alto (>90%)
- Errores de carga frecuentes
- Velocidad de internet baja (<2 Mbps)

PANEL DE SALUD:
Dashboard > Widget "Estado del Sistema"

MUESTRA:
- 🟢 Verde: Todo óptimo
- 🟡 Amarillo: Rendimiento degradado
- 🔴 Rojo: Problemas críticos

SOLUCIÓN DE PROBLEMAS COMUNES

PROBLEMA: "La plataforma se congela al abrir documentos grandes"
SOLUCIÓN:
1. Configuración > Modo de rendimiento > Performance
2. Divide documento en secciones más pequeñas
3. Aumenta RAM si es posible

PROBLEMA: "Búsquedas muy lentas"
SOLUCIÓN:
1. Limpia caché del navegador
2. Usa filtros de categoría
3. Contacta soporte si persiste (puede haber problema de índice)

PROBLEMA: "Sincronización tarda mucho"
SOLUCIÓN:
1. Verifica velocidad de internet
2. Pausa otras descargas/uploads
3. Usa modo offline si tienes internet inestable

PROBLEMA: "Interfaz lagueada"
SOLUCIÓN:
1. Cierra pestañas innecesarias (máximo 10-15)
2. Desactiva extensiones pesadas
3. Actualiza navegador
4. Reinicia navegador

BENCHMARKS DE REFERENCIA

TIEMPOS NORMALES (Conexión 25 Mbps, equipo moderno):
- Carga inicial de plataforma: 1-2 segundos
- Abrir documento (<1000 palabras): <1 segundo
- Búsqueda simple: <2 segundos
- Guardar cambios: <500ms
- Carga de imágenes: <2 segundos

SI EXCEDES ESTOS TIEMPOS CONSISTENTEMENTE:
Contacta soporte con resultados de test de velocidad

SOPORTE TÉCNICO

OPTIMIZACIÓN PERSONALIZADA:
performance@techcorp.com

INFORMACIÓN A PROPORCIONAR:
- Resultados de test de velocidad
- Sistema operativo y versión
- Navegador y versión
- Especificaciones de hardware (RAM, CPU)
- Descripción detallada del problema

ENTERPRISE:
Clientes enterprise tienen acceso a consultor de rendimiento dedicado

Última actualización: Enero 2025`,
      categoriasNombres: ["Soporte técnico"]
   },
   {
      titulo: "Acuerdo de nivel de servicio (SLA)",
      contenido: `ACUERDO DE NIVEL DE SERVICIO (SLA)
TechCorp Solutions Inc. | Versión 3.0 | Vigente desde Enero 2025

INTRODUCCIÓN
Este Acuerdo de Nivel de Servicio establece los compromisos de disponibilidad, rendimiento y soporte que TechCorp garantiza a sus clientes. Define métricas medibles, responsabilidades y compensaciones en caso de incumplimiento.

ALCANCE Y APLICABILIDAD

PLANES CUBIERTOS:
- Plan Plus: SLA Estándar (99.5% uptime)
- Plan Premium: SLA Mejorado (99.9% uptime)
- Plan Enterprise: SLA Personalizado (hasta 99.99% uptime)

SERVICIOS INCLUIDOS:
✓ Plataforma web (app.techcorp.com)
✓ APIs REST
✓ Almacenamiento de documentos
✓ Sistema de búsqueda
✓ Chat con IA
✓ Sincronización entre dispositivos

SERVICIOS EXCLUIDOS:
✗ Integraciones de terceros (Google Drive, Dropbox, etc.)
✗ Servicios en versión beta o alpha
✗ Mantenimientos programados notificados
✗ Problemas causados por el usuario o su red

COMPROMISOS DE DISPONIBILIDAD (UPTIME)

DEFINICIONES:

UPTIME: Porcentaje de tiempo que el servicio está operacional y accesible
DOWNTIME: Período donde servicio no está disponible para usuarios
MES DE SERVICIO: Período calendario de facturación

CÁLCULO DE UPTIME:

Uptime % = ((Minutos totales en mes - Minutos de downtime) / Minutos totales en mes) × 100


OBJETIVOS DE UPTIME:

PLAN PLUS:
- Objetivo: 99.5% mensual
- Downtime máximo permitido: ~3.6 horas/mes
- Medición: Por mes calendario
- Compensación: Según tabla abajo

PLAN PREMIUM:
- Objetivo: 99.9% mensual
- Downtime máximo permitido: ~43 minutos/mes
- Medición: Por mes calendario
- Compensación: Según tabla abajo
- Soporte prioritario

PLAN ENTERPRISE:
- Objetivo: 99.99% mensual (acordado contractualmente)
- Downtime máximo permitido: ~4.3 minutos/mes
- Medición: 24/7/365
- Compensación: Customizada
- Soporte dedicado 24/7
- Escalación ejecutiva

EXCLUSIONES DE DOWNTIME

NO CUENTA COMO DOWNTIME:

1. MANTENIMIENTOS PROGRAMADOS:
   - Notificados con 72 horas de anticipación
   - Realizados en ventanas de bajo tráfico
   - Máximo 4 horas/mes
   - Típicamente: domingos 2:00-6:00 AM UTC

2. FUERZA MAYOR:
   - Desastres naturales
   - Guerras, terrorismo
   - Pandemias que afecten infraestructura
   - Cortes de internet a nivel ISP masivos

3. PROBLEMAS DEL CLIENTE:
   - Bloqueo por firewall corporativo
   - Problemas de DNS locales
   - Computadora o red del usuario
   - Violación de Términos de Servicio

4. ATAQUES EXTERNOS:
   - DDoS dirigido a TechCorp
   - Downtime mientras mitigamos ataque
   - Máximo 2 horas/mes excluidas

COMPROMISOS DE RENDIMIENTO

LATENCIA DE API:
- Plus: <500ms percentil 95
- Premium: <200ms percentil 95
- Enterprise: <100ms percentil 99

TIEMPO DE RESPUESTA DE INTERFAZ:
- Carga inicial: <3 segundos
- Navegación entre páginas: <1 segundo
- Guardar documento: <2 segundos

THROUGHPUT:
- Plus: 1,000 requests/hora/usuario
- Premium: 10,000 requests/hora/usuario
- Enterprise: Sin límite (uso razonable)

COMPROMISOS DE SOPORTE

CANALES DE SOPORTE:

TODOS LOS PLANES:
- Email: support@techcorp.com
- Portal de tickets
- Base de conocimientos (24/7 self-service)
- Chat en vivo (horario de oficina)

PREMIUM Y ENTERPRISE:
- Teléfono (número directo)
- Chat en vivo 24/7
- Slack compartido (Enterprise)

TIEMPOS DE RESPUESTA:

PLAN PLUS:
| Prioridad | Primera Respuesta | Resolución      |
|-----------|-------------------|-----------------|
| Crítica   | 4 horas           | 24 horas       |
| Alta      | 8 horas           | 48 horas       |
| Media     | 24 horas          | 5 días         |
| Baja      | 48 horas          | 10 días        |

PLAN PREMIUM:
| Prioridad | Primera Respuesta | Resolución      |
|-----------|-------------------|-----------------|
| Crítica   | 1 hora            | 8 horas        |
| Alta      | 2 horas           | 24 horas       |
| Media     | 8 horas           | 3 días         |
| Baja      | 24 horas          | 7 días         |

PLAN ENTERPRISE:
| Prioridad | Primera Respuesta | Resolución      |
|-----------|-------------------|-----------------|
| Crítica   | 15 minutos        | 4 horas        |
| Alta      | 30 minutos        | 12 horas       |
| Media     | 4 horas           | 2 días         |
| Baja      | 12 horas          | 5 días         |

DEFINICIÓN DE PRIORIDADES:

CRÍTICA: Servicio completamente inaccesible, pérdida de datos
ALTA: Funcionalidad importante no disponible
MEDIA: Funcionalidad secundaria afectada
BAJA: Preguntas generales, feature requests

MONITOREO Y REPORTING

MONITOREO PROACTIVO:
- Checks de salud cada 60 segundos
- Monitores en 15 ubicaciones globales
- Alertas automáticas al equipo si downtime detectado

STATUS PAGE PÚBLICO:
- https://status.techcorp.com
- Actualizado en tiempo real
- Historial de incidentes
- Subscripción a alertas vía email/SMS

REPORTES MENSUALES (Premium/Enterprise):
- Uptime real del mes
- Incidentes ocurridos y duración
- Métricas de rendimiento
- Comparación vs SLA prometido

COMPENSACIONES POR INCUMPLIMIENTO

CRÉDITOS DE SERVICIO:

PLAN PLUS (99.5% SLA):
| Uptime Real  | Crédito         |
|--------------|-----------------|
| 99.0-99.4%   | 10% del mes     |
| 95.0-98.9%   | 25% del mes     |
| <95.0%       | 50% del mes     |

PLAN PREMIUM (99.9% SLA):
| Uptime Real  | Crédito         |
|--------------|-----------------|
| 99.0-99.8%   | 15% del mes     |
| 98.0-98.9%   | 30% del mes     |
| 95.0-97.9%   | 50% del mes     |
| <95.0%       | 100% del mes    |

PROCEDIMIENTO DE RECLAMACIÓN:

1. Cliente debe reclamar dentro de 30 días del mes afectado
2. Enviar a: sla-claims@techcorp.com
3. Incluir: Período afectado, evidencia si es posible
4. TechCorp verifica en logs internos
5. Si aplica, crédito emitido en 15 días
6. Crédito aplicado a siguiente factura (no es reembolso en efectivo)

LÍMITES:
- Créditos máximos por mes: 100% del pago mensual
- Créditos no acumulan por más de 3 meses
- No se otorgan créditos por downtime excluido

PROCEDIMIENTOS OPERACIONALES

MANTENIMIENTOS PROGRAMADOS:

NOTIFICACIÓN:
- 7 días antes: Email a todos los usuarios
- 72 horas antes: Banner en plataforma
- 24 horas antes: Reminder email
- Durante: Status page actualizado

VENTANA DE MANTENIMIENTO:
- Típicamente: Domingos 2:00-6:00 AM UTC
- Duración máxima: 4 horas
- Frecuencia: 1-2 veces/mes

EMERGENCIAS:
- Mantenimiento de emergencia puede ocurrir sin aviso previo
- Notificación inmediata cuando comienza
- Actualización cada 30 minutos
- Post-mortem publicado 24 horas después

COMUNICACIÓN DE INCIDENTES:

DURANTE INCIDENTE:
1. Detección (automática o manual)
2. Equipo de guardia notificado (5 minutos)
3. Status page actualizado: "Investigating"
4. Update cada 30 minutos hasta resolución
5. Post-mortem en 72 horas

SEVERIDADES:
- SEV 1 (Crítico): Servicio completamente caído
- SEV 2 (Mayor): Funcionalidad importante afectada
- SEV 3 (Menor): Problema localizado o degradación leve

MEJORA CONTINUA:

POST-MORTEMS:
- Publicados para todo incidente >1 hora downtime
- Incluyen: Causa raíz, línea de tiempo, acciones correctivas
- Disponibles en: status.techcorp.com/incidents

REVISIONES:
- SLA revisado anualmente
- Feedback de clientes incorporado
- Métricas ajustadas según capacidades de infraestructura

CONTACTO

SOPORTE GENERAL:
- Email: support@techcorp.com
- Tel: +1-800-SUPPORT

SLA Y RECLAMACIONES:
- Email: sla-claims@techcorp.com
- Tel: +1-800-SLA-HELP

ESCALACIÓN (Enterprise):
- Account Manager dedicado
- Escalación a CTO si es necesario

ACUERDO LEGAL

Este SLA es parte integral del contrato de servicio.
En caso de conflicto, prevalece el contrato principal.
Único remedio por incumplimiento son los créditos descritos.
No hay compensación adicional salvo acordada en contrato Enterprise.

Actualizado: Enero 2025
Próxima revisión: Enero 2026`,
      categoriasNombres: ["Políticas de la empresa"]
   },

   // Documentos para Ana (Usuario 3) - 9 documentos
   {
      titulo: "Cómo recuperar tu contraseña olvidada",
      contenido: `GUÍA DE RECUPERACIÓN DE CONTRASEÑA
TechCorp Solutions | FAQ | Actualizado Enero 2025

¿OLVIDASTE TU CONTRASEÑA?

No te preocupes, es uno de los problemas más comunes y tiene solución rápida. Sigue estos pasos para recuperar el acceso a tu cuenta de forma segura:

MÉTODO 1: RECUPERACIÓN ESTÁNDAR (Recomendado)

PASO 1 - Ir a la página de login
Dirígete a app.techcorp.com/login

PASO 2 - Click en "Olvidé mi contraseña"
Verás este enlace justo debajo del botón de "Iniciar sesión"

PASO 3 - Ingresar tu email
Escribe el correo electrónico asociado a tu cuenta TechCorp
Asegúrate de escribirlo correctamente (sin espacios adicionales)

PASO 4 - Revisar tu bandeja de entrada
Recibirás un email con asunto: "Restablecer tu contraseña de TechCorp"
Tiempo estimado: 2-5 minutos

PASO 5 - Hacer click en el enlace
El email contendrá un botón "Restablecer contraseña"
Este enlace es válido por 24 horas únicamente
Después de 24 horas, deberás solicitar uno nuevo

PASO 6 - Crear nueva contraseña
Ingresa tu nueva contraseña (debe cumplir requisitos)
Confírmala escribiéndola nuevamente
Click en "Guardar nueva contraseña"

PASO 7 - Confirmar y acceder
Verás mensaje de confirmación
Serás redirigido automáticamente al login
Inicia sesión con tu nueva contraseña

REQUISITOS DE CONTRASEÑA:
✓ Mínimo 8 caracteres
✓ Al menos una letra mayúscula
✓ Al menos una letra minúscula
✓ Al menos un número
✓ Al menos un carácter especial (@$!%*?&)
✓ No puede ser igual a contraseñas anteriores

EJEMPLO DE CONTRASEÑA FUERTE:
- Débil: password123
- Fuerte: Tech@Corp2025!

MÉTODO 2: RECUPERACIÓN CON AUTENTICACIÓN DE DOS FACTORES (2FA)

Si tienes 2FA activado:

1. Sigue pasos 1-5 del método estándar
2. Después de crear nueva contraseña, te pedirá código 2FA
3. Abre tu app de autenticación (Google Authenticator, Authy, etc.)
4. Ingresa el código de 6 dígitos
5. El código expira en 30 segundos, usa uno actual

SI NO TIENES ACCESO A TU APP 2FA:
- Usa uno de tus códigos de respaldo (guardados al configurar 2FA)
- Si no tienes códigos de respaldo, contacta soporte

PROBLEMAS COMUNES Y SOLUCIONES:

PROBLEMA 1: "No recibo el email de recuperación"

SOLUCIÓN A - Revisar carpeta de spam/correo no deseado
- Busca emails de: no-reply@techcorp.com
- Si lo encuentras, márcalo como "No es spam"

SOLUCIÓN B - Verificar email ingresado
- Asegúrate de usar el email correcto de registro
- Verifica que no tenga espacios antes/después
- Prueba con emails alternativos si usaste varios

SOLUCIÓN C - Esperar más tiempo
- Puede tardar hasta 10 minutos en llegar
- Revisa cada 2-3 minutos

SOLUCIÓN D - Solicitar nuevo enlace
- Puedes solicitar un nuevo enlace después de 5 minutos
- El enlace anterior se invalida automáticamente

SOLUCIÓN E - Verificar estado de email
- Asegúrate que tu email no esté lleno (buzón completo)
- Verifica que no tengas filtros que bloqueen emails de TechCorp

PROBLEMA 2: "El enlace dice que expiró"

SOLUCIÓN:
- Enlaces de recuperación expiran en 24 horas por seguridad
- Simplemente solicita uno nuevo siguiendo pasos 1-4
- El nuevo enlace cancelará el anterior automáticamente

PROBLEMA 3: "Dice que mi contraseña no es válida"

SOLUCIÓN:
- Verifica que cumple todos los requisitos (ver arriba)
- No uses espacios al inicio o final
- No copies/pegues (puede incluir caracteres invisibles)
- Escríbela manualmente

PROBLEMA 4: "No recuerdo qué email usé para registrarme"

SOLUCIÓN:
- Intenta con todos tus emails habituales
- Busca en tu bandeja de entrada emails antiguos de TechCorp
- Revisa confirmaciones de registro en tus emails
- Contacta soporte con información de identificación

PROBLEMA 5: "Tenía cuenta con Google/SSO y ahora no funciona"

SOLUCIÓN:
- Si te registraste con "Iniciar sesión con Google"
- NO uses "Olvidé mi contraseña"
- Sigue usando el botón "Continuar con Google"
- Si el problema persiste, contacta soporte

RECUPERACIÓN URGENTE (24/7)

Si tienes una emergencia y necesitas acceso inmediato:

PLAN PLUS:
- Email: recovery@techcorp.com (respuesta en 4 horas)

PLAN PREMIUM:
- Email: priority-recovery@techcorp.com (respuesta en 1 hora)
- Chat en vivo 24/7 (opción "Recuperación urgente")

PLAN ENTERPRISE:
- Línea directa 24/7 (número provisto en onboarding)
- Respuesta en 15 minutos

INFORMACIÓN A PROPORCIONAR:
- Nombre completo
- Email(s) que pudiste haber usado
- Últimos 4 dígitos de tarjeta de pago (si aplica)
- Fecha aproximada de último acceso
- Descripción del problema

SEGURIDAD DE LA RECUPERACIÓN:

VALIDACIONES AUTOMÁTICAS:
- Verificamos que el email esté registrado
- Enlace único e irrepetible
- Tokens criptográficos seguros
- Expiración automática en 24 horas
- Invalidación de enlaces anteriores

NOTIFICACIONES:
Cuando solicitas recuperación, enviamos:
- Email al email de recuperación (con enlace)
- Notificación a email secundario (si configurado)
- Alerta en dispositivos ya logueados

ESTO SIGNIFICA:
Si alguien intenta recuperar tu contraseña sin autorización, tú serás notificado inmediatamente y puedes:
1. Ignorar el email (enlace expira en 24h)
2. Cambiar tu contraseña desde dispositivo ya logueado
3. Contactar soporte si sospechas compromiso de cuenta

PREVENCIÓN A FUTURO:

TIPS PARA NO OLVIDAR CONTRASEÑA:

1. USA UN GESTOR DE CONTRASEÑAS:
   - LastPass, 1Password, Bitwarden, Dashlane
   - Almacena contraseñas de forma segura
   - Auto-rellena en sitios web
   - Solo necesitas recordar una contraseña maestra

2. ACTIVA 2FA (Autenticación de dos factores):
   - Capa extra de seguridad
   - Incluso si olvidas contraseña, tu cuenta está protegida

3. GUARDA CÓDIGOS DE RESPALDO:
   - Al activar 2FA, recibes códigos de emergencia
   - Guárdalos en lugar seguro (no en el mismo dispositivo)

4. CONFIGURA EMAIL DE RESPALDO:
   - Configuración > Seguridad > Email secundario
   - Otro email donde recibirás enlaces de recuperación

5. USA "MANTENERME CONECTADO" (Dispositivos personales):
   - Evita tener que ingresar contraseña cada vez
   - Solo en dispositivos que solo tú usas

6. ESTABLECE PATRÓN MEMORABLE:
   - Usa frase personal convertida a contraseña
   - Ejemplo: "Me gusta café a las 7AM" → Mgc@l7AM!

PREGUNTAS FRECUENTES:

P: ¿Cuántas veces puedo solicitar recuperación?
R: Sin límite, pero espera 5 minutos entre solicitudes.

P: ¿Alguien de TechCorp me pedirá mi contraseña?
R: NUNCA. Ningún empleado legítimo te pedirá tu contraseña.

P: ¿Puedo usar la misma contraseña anterior?
R: No, por seguridad debes crear una nueva diferente.

P: ¿Mis sesiones activas se cerrarán al cambiar contraseña?
R: Sí, todas las sesiones se cerrarán automáticamente por seguridad.

P: ¿Puedo recuperar contraseña desde la app móvil?
R: Sí, el proceso es idéntico en app móvil.

CONTACTO

SOPORTE GENERAL:
- Email: support@techcorp.com
- Chat: Disponible en app.techcorp.com

SOPORTE DE RECUPERACIÓN:
- Email: recovery@techcorp.com
- FAQ completo: help.techcorp.com/password-recovery

¿Aún tienes problemas? Contáctanos, estamos aquí para ayudarte.

Última actualización: Enero 2025`,
      categoriasNombres: ["F. A. Q.", "Soporte técnico"]
   },
   {
      titulo: "Política de reembolsos y cancelaciones",
      contenido: `POLÍTICA DE REEMBOLSOS Y CANCELACIONES
TechCorp Solutions | Términos Comerciales | Enero 2025

COMPROMISO DE SATISFACCIÓN

En TechCorp estamos comprometidos con tu satisfacción. Esta política detalla cómo puedes cancelar tu suscripción o solicitar reembolsos de manera justa y transparente.

GARANTÍA DE SATISFACCIÓN DE 30 DÍAS

COBERTURA:
Para todos los planes nuevos (Plus, Premium, Enterprise):
- Aplica a primeros 30 días desde la compra
- Reembolso completo sin preguntas
- Conservas acceso durante período de procesamiento

CÓMO SOLICITARLA:
1. Ir a Configuración > Facturación > Solicitar reembolso
2. O enviar email a: refunds@techcorp.com
3. Asunto: "Solicitud de reembolso - Garantía 30 días"
4. Incluir:
   - Nombre completo
   - Email de cuenta
   - Razón de cancelación (opcional pero útil para mejorar)

PROCESAMIENTO:
- Solicitud confirmada en 24 horas
- Reembolso procesado en 5-10 días hábiles
- Método de reembolso: Mismo método de pago original
- Recibirás email de confirmación cuando se procese

EXCEPCIONES:
NO aplica si:
✗ Has violado términos de servicio
✗ Tu cuenta fue suspendida por abuso
✗ Usaste crédito promocional (solo se reembolsa pago real)
✗ Es un renovación (ya usaste garantía anteriormente)

CANCELACIÓN DE SUSCRIPCIÓN

TIPOS DE CANCELACIÓN:

1. CANCELACIÓN INMEDIATA:
   - Tu suscripción termina de inmediato
   - Pierdes acceso a funciones premium
   - Tus datos se conservan por 60 días (puedes reactivar)
   - NO hay reembolso parcial del mes actual

2. CANCELACIÓN AL FINAL DEL PERÍODO:
   - Sigues teniendo acceso hasta que termine tu período pagado
   - No se te cobra en la siguiente renovación
   - Recibes recordatorios 7 y 1 días antes de expiración
   - Puedes reactivar en cualquier momento antes de expirar

RECOMENDACIÓN: Opción 2 (al final del período) para aprovechar lo que ya pagaste.

CÓMO CANCELAR:

MÉTODO 1 - Desde la plataforma (más rápido):
1. Configuración > Facturación
2. Sección "Tu plan actual"
3. Click "Cancelar suscripción"
4. Elige: Inmediato o al final del período
5. (Opcional) Danos feedback sobre por qué cancelas
6. Confirmar cancelación
7. Recibirás email de confirmación

MÉTODO 2 - Por email:
1. Envía email a: billing@techcorp.com
2. Asunto: "Cancelar suscripción"
3. Incluye email de cuenta
4. Especifica si inmediato o al final del período
5. Respuesta en 24 horas

MÉTODO 3 - Chat/Soporte:
- Chat en vivo disponible
- Soporte te guiará por el proceso
- Útil si tienes preguntas

QUÉ PASA DESPUÉS DE CANCELAR:

ACCESO:
- Cancelas inmediato: Downgrades a plan gratuito (si disponible)
- Cancelas al final: Acceso completo hasta vencimiento

DATOS:
- Tus documentos se conservan 60 días
- Después de 60 días: Se archivan (recuperables contactando soporte)
- Después de 90 días: Eliminación permanente (según GDPR)

EXPORTAR DATOS:
Antes de cancelar, recomendamos:
1. Configuración > Datos > Exportar todo
2. Descarga archivo ZIP con todos tus documentos
3. Guarda copia local

REACTIVACIÓN:
- Dentro de 60 días: Inmediata, todos tus datos intactos
- 60-90 días: Contacta soporte, podemos recuperar
- Después de 90 días: Debes empezar desde cero

REEMBOLSOS FUERA DE GARANTÍA DE 30 DÍAS

REEMBOLSOS PRORRATEADOS:

DOWNGRADE DE PLAN:
Si cambias de Premium a Plus a mitad de mes:
- Crédito proporcional del tiempo no usado
- Se aplica automáticamente a siguiente factura
- Cálculo: ((días restantes) / (días totales del período)) × (diferencia de precio)

EJEMPLO:
- Pagas Premium anual ($120/año)
- Cambias a Plus ($60/año) después de 6 meses
- Crédito: ($120 - $60) × (6/12) = $30
- Ese $30 se descuenta de tu próxima renovación

CARGOS DUPLICADOS:
Si te cobramos por error dos veces:
- Reembolso completo del cargo duplicado
- Procesado en 3-5 días hábiles
- Reporta a: billing@techcorp.com

COBRO NO AUTORIZADO:
Si detectas cargo que no reconoces:
- Reporta inmediatamente: fraud@techcorp.com
- Investigamos en 24 horas
- Reembolso completo si se confirma error

FALLO DE SERVICIO SIGNIFICATIVO:
Si no cumplimos nuestro SLA:
- Ver documento "Acuerdo de Nivel de Servicio"
- Créditos automáticos según downtime
- Adicional a cualquier reembolso por cancelación

EXCEPCIONES - NO REEMBOLSABLE:

✗ FUERA DE 30 DÍAS Y SIN CAUSA JUSTIFICADA:
  Después de 30 días, solo se reembolsa por:
  - Fallo de servicio de nuestra parte
  - Error de cargo
  - Causa imputable a TechCorp

✗ USO DEL SERVICIO:
  No se reembolsa si ya usaste significativamente el servicio

✗ SUSCRIPCIONES ANTIGUAS:
  Reembolso solo aplica a período actual, no pagos anteriores

✗ COMPLEMENTOS Y EXTRAS:
  - Almacenamiento adicional comprado
  - Créditos de IA consumidos
  - Servicios profesionales (consultoría, training)

CAMBIOS DE PLAN

UPGRADE (Pasar a plan superior):

PROCESO:
1. Configuración > Facturación > Cambiar plan
2. Selecciona plan superior
3. Paga diferencia prorrateada

CÁLCULO:
- Solo pagas diferencia del tiempo restante
- Upgrade inmediato
- Próxima renovación será al precio completo del nuevo plan

EJEMPLO:
- Tienes Plus mensual ($10/mes)
- A mitad de mes quieres Premium ($20/mes)
- Pagas: ($20 - $10) × (15 días / 30 días) = $5
- Acceso inmediato a Premium

DOWNGRADE (Pasar a plan inferior):

PROCESO:
1. Configuración > Facturación > Cambiar plan
2. Selecciona plan inferior
3. Cambio efectivo al final del período actual

CÁLCULO:
- No pagas nada ahora
- Próxima renovación será al precio del plan inferior
- Crédito por diferencia aplicado

IMPORTANTE:
- Verificar que tus datos caben en límites del plan inferior
- Si excedes, se te pedirá eliminar o exportar contenido

MÉTODOS DE PAGO Y REEMBOLSOS

REEMBOLSOS SEGÚN MÉTODO:

TARJETA DE CRÉDITO/DÉBITO:
- Reembolso a misma tarjeta
- 5-10 días hábiles
- Aparece como "TECHCORP REFUND" en estado de cuenta

PAYPAL:
- Reembolso a cuenta PayPal
- 3-5 días hábiles
- Recibirás notificación de PayPal

TRANSFERENCIA BANCARIA (Enterprise):
- Reembolso a cuenta bancaria registrada
- 7-14 días hábiles
- Confirmación vía email

CRIPTOMONEDAS (Si aplica):
- No reembolsable en cripto (volatilidad)
- Reembolso en USD equivalente vía otro método
- Tasa de cambio al día del reembolso

SITUACIONES ESPECIALES

FALLECIMIENTO DE USUARIO:
- Familiares pueden solicitar:
  - Cancelación de suscripción
  - Exportación de datos
  - Reembolso proporcional
- Requerido: Certificado de defunción

ENFERMEDAD O INCAPACIDAD:
- Consideramos casos especiales
- Contacta: support@techcorp.com
- Podemos ofrecer pausa de cuenta o reembolso

DESASTRE NATURAL:
- Si área fue afectada por desastre
- Podemos ofrecer crédito o pausa
- Contacta soporte con detalles

REGULACIONES Y DERECHOS

UNIÓN EUROPEA (GDPR):
- Derecho a cancelar en 14 días (adicional a nuestros 30 días)
- Derecho a exportación de datos
- Derecho al olvido (eliminación de datos)

AUSTRALIA (ACL):
- Protecciones adicionales bajo Australian Consumer Law
- Consulta: legal-au@techcorp.com

CALIFORNIA (CCPA):
- Derecho a saber qué datos tenemos
- Derecho a eliminación
- Consulta: privacy@techcorp.com

PREVENCIÓN DE CANCELACIONES

ANTES DE CANCELAR, CONSIDERA:

1. PAUSA DE CUENTA (Premium/Enterprise):
   - Congela tu suscripción por 1-3 meses
   - No se te cobra durante pausa
   - Datos conservados intactos
   - Útil si necesitas un break temporal

2. DOWNGRADE:
   - En vez de cancelar, baja a plan menor
   - Conservas datos
   - Menor compromiso financiero

3. CONTACTAR SOPORTE:
   - Muchos problemas tienen solución
   - Podemos ofrecerte descuento para quedarte
   - Feedback ayuda a mejorar el producto

PREGUNTAS FRECUENTES:

P: ¿Puedo obtener reembolso después de 30 días?
R: Solo en casos especiales o fallo de servicio de nuestra parte.

P: ¿Perdí mis datos si cancelo?
R: No, se conservan 60 días. Exporta antes para seguridad.

P: ¿Cuánto tarda un reembolso?
R: 5-10 días hábiles según método de pago.

P: ¿Puedo cancelar y reactivar después?
R: Sí, dentro de 60 días sin perder datos.

P: ¿Hay penalización por cancelar?
R: No, puedes cancelar en cualquier momento sin penalización.

CONTACTO

FACTURACIÓN Y REEMBOLSOS:
- Email: billing@techcorp.com
- Tel: +1-800-BILLING

FRAUDE O CARGOS NO AUTORIZADOS:
- Email: fraud@techcorp.com (urgente)

Última actualización: Enero 2025`,
      categoriasNombres: ["Políticas de la empresa", "F. A. Q."]
   },
   {
      titulo: "Mejores prácticas de seguridad para tu cuenta",
      contenido: `GUÍA DE SEGURIDAD DE CUENTA
TechCorp Solutions | Centro de Seguridad | Enero 2025

INTRODUCCIÓN

La seguridad de tu cuenta es una responsabilidad compartida entre TechCorp y tú. Mientras nosotros protegemos nuestra infraestructura con las mejores prácticas de la industria, tú tienes un papel crucial en mantener tu cuenta segura.

Esta guía te ayudará a proteger tu cuenta contra acceso no autorizado, phishing, y otras amenazas comunes.

CONTRASEÑAS SEGURAS

LA BASE DE LA SEGURIDAD:

CARACTERÍSTICAS DE CONTRASEÑA FUERTE:
✓ Mínimo 12 caracteres (más es mejor)
✓ Combina mayúsculas y minúsculas
✓ Incluye números
✓ Incluye caracteres especiales (@$!%*?&#)
✓ No usa palabras del diccionario
✓ No incluye información personal (nombre, fecha nacimiento)
✓ Es única (no reutilizada en otros sitios)

EJEMPLO:
- ❌ DÉBIL: maria2023
- ❌ DÉBIL: Password123!
- ✅ FUERTE: Tc$M7pQ!x9nR2vK@

MÉTODOS PARA CREAR CONTRASEÑAS MEMORABLES:

MÉTODO 1 - Frase convertida:
Frase: "Me gusta tomar café las 7 de la mañana"
Contraseña: Mgtc@7dm!

MÉTODO 2 - Palabras aleatorias:
Palabras: "Caballo Batería Grapadora Correcto"
Contraseña: C4b4ll0-B4t3r14-Gr4p4d0r4

MÉTODO 3 - Patrón visual en teclado:
(Crea un patrón que solo tú conoces)

LO QUE NUNCA DEBES HACER:
✗ Reutilizar contraseñas entre sitios
✗ Usar información personal (nombre mascota, fecha nacimiento)
✗ Anotar contraseñas en papel visible
✗ Guardar contraseñas en notas sin cifrar
✗ Compartir contraseña con otros
✗ Enviar contraseña por email o mensaje

GESTOR DE CONTRASEÑAS (RECOMENDADO):

BENEFICIOS:
- Genera contraseñas aleatorias super fuertes
- Las recuerda por ti
- Auto-rellena en sitios web
- Solo necesitas recordar una contraseña maestra
- Alerta si sitio es phishing

OPCIONES POPULARES:
- 1Password (Premium, $3/mes)
- LastPass (Freemium)
- Bitwarden (Open source, gratuito)
- Dashlane (Premium)
- Apple Keychain (Gratis para usuarios Apple)
- Google Password Manager (Gratis, integrado en Chrome)

CÓMO EMPEZAR:
1. Elige un gestor
2. Crea contraseña maestra SÚPER fuerte
3. Importa contraseñas existentes
4. Activa auto-relleno
5. Genera contraseñas nuevas para todos tus sitios

AUTENTICACIÓN DE DOS FACTORES (2FA)

LA PROTECCIÓN MÁS IMPORTANTE:

POR QUÉ ES CRUCIAL:
- Incluso si roban tu contraseña, NO pueden acceder
- Reduce riesgo de hackeo en 99.9%
- Requerido para cuentas con datos sensibles
- Muchas regulaciones lo requieren (GDPR, HIPAA)

CÓMO FUNCIONA:
1. Ingresas usuario y contraseña (Factor 1: Algo que sabes)
2. Sistema pide código de 6 dígitos (Factor 2: Algo que tienes)
3. Código se genera en tu teléfono/dispositivo
4. Código expira en 30-60 segundos
5. Sin código correcto, no hay acceso

ACTIVAR 2FA EN TECHCORP:

1. Ir a: Configuración > Seguridad > Autenticación de dos factores
2. Click "Activar 2FA"
3. Escanea código QR con app de autenticación
4. Ingresa código de 6 dígitos para verificar
5. IMPORTANTE: Guarda códigos de respaldo
6. Confirmar activación

APPS DE AUTENTICACIÓN RECOMENDADAS:

MEJOR OPCIÓN - Google Authenticator:
✓ Gratuita
✓ Fácil de usar
✓ Funciona offline
✓ Disponible iOS y Android

ALTERNATIVAS:
- Microsoft Authenticator (sincroniza en nube)
- Authy (backup en nube)
- 1Password (integrado si ya lo usas)

NO RECOMENDADO:
- SMS/Texto (puede ser interceptado)
- Email (menos seguro que app)

CÓDIGOS DE RESPALDO:

Al activar 2FA, recibes 10 códigos de un solo uso.

¿CUÁNDO USARLOS?
- Perdiste tu teléfono
- App de autenticación no funciona
- Cambiaste de teléfono y no migraste 2FA

CÓMO GUARDARLOS:
✓ Imprímelos y guarda en lugar seguro (caja fuerte)
✓ Guarda en gestor de contraseñas
✓ Guarda en dispositivo seguro offline

NO:
✗ Los dejes en nota en tu teléfono sin cifrar
✗ Los compartas con nadie
✗ Los guardes en mismo lugar que contraseña

GESTIÓN DE SESIONES

DISPOSITIVOS CONECTADOS:

REVISAR REGULARMENTE:
1. Configuración > Seguridad > Dispositivos activos
2. Revisa lista de dispositivos con sesión abierta
3. Verás:
   - Tipo de dispositivo (computadora, móvil, tablet)
   - Navegador
   - Ubicación aproximada (ciudad)
   - Última actividad
   - IP address (si es avanzado)

SI VES DISPOSITIVO DESCONOCIDO:
1. Click "Cerrar sesión" en ese dispositivo
2. Cambia tu contraseña INMEDIATAMENTE
3. Activa 2FA si no lo tienes
4. Reporta a soporte: security@techcorp.com

MEJORES PRÁCTICAS:

CERRAR SESIÓN:
✓ Siempre en computadoras compartidas/públicas
✓ En dispositivos de trabajo si también son personales
✓ Si no usarás el dispositivo por tiempo prolongado

MANTENER SESIÓN:
✓ OK en dispositivos personales que solo tú usas
✓ Asegúrate que dispositivo tenga contraseña/PIN
✓ Teléfono personal con lock screen

ALERTAS DE SESIÓN:
Activa en: Configuración > Seguridad > Notificaciones

Recibirás alerta cuando:
- Nuevo dispositivo inicia sesión
- Sesión desde ubicación inusual
- Múltiples intentos de login fallidos
- Cambio de contraseña
- Cambio de email

IDENTIFICACIÓN DE AMENAZAS

PHISHING - LA AMENAZA #1:

¿QUÉ ES?
Emails/mensajes falsos que imitan ser de TechCorp para robar tu contraseña.

CÓMO IDENTIFICAR:

🚩 SEÑALES DE ALERTA:
✗ Email de remitente sospechoso (@techcorp-support.com en vez de @techcorp.com)
✗ Urgencia artificial ("Tu cuenta será suspendida en 24h")
✗ Pide contraseña o información sensible
✗ Enlaces sospechosos (techcorp-login.phishing.com)
✗ Errores ortográficos o gramaticales
✗ Imágenes de baja calidad
✗ Tono genérico ("Estimado usuario" en vez de tu nombre)

EJEMPLO DE PHISHING:
"Urgente: Tu cuenta TechCorp será suspendida. Click aquí para verificar: http://techcorp-verify.suspicious.com"

CÓMO PROTEGERTE:
1. NUNCA hagas click en enlaces sospechosos
2. Verifica remitente real del email (no el nombre mostrado)
3. Ve manualmente a app.techcorp.com (no por enlace)
4. Verifica URL: DEBE ser https://app.techcorp.com
5. Si dudas, contacta soporte directamente

REPORTAR PHISHING:
- Forward email a: phishing@techcorp.com
- Incluye headers completos del email

NUESTROS EMAILS LEGÍTIMOS:
✓ no-reply@techcorp.com
✓ support@techcorp.com
✓ billing@techcorp.com
✓ security@techcorp.com

SIEMPRE desde @techcorp.com (sin subdominios raros)

INGENIERÍA SOCIAL:

¿QUÉ ES?
Manipulación psicológica para que reveles información.

EJEMPLOS:
- Alguien se hace pasar por "soporte TechCorp" y pide tu contraseña
- Mensaje urgente de "tu jefe" pidiendo acceso
- "Colega" pide que le compartas documentos sin verificar

REGLA DE ORO:
NUNCA compartas contraseña, ni siquiera con:
- Soporte técnico (no la necesitan)
- Tu jefe (usa funciones de compartir)
- IT de tu empresa (pueden resetearla, no necesitan saberla)

PRÁCTICAS ADICIONALES

SEGURIDAD DE RED:

WIFI PÚBLICO - PELIGROSO:
✗ No ingreses contraseñas en WiFi público sin protección
✗ Atacantes pueden interceptar tráfico
✗ Cafeterías, aeropuertos, hoteles son riesgosos

SI DEBES USAR WIFI PÚBLICO:
✓ Usa VPN (cifra todo tu tráfico)
✓ Verifica que conexión sea https://
✓ Evita transacciones sensibles
✓ Desactiva compartir archivos

WIFI CASA/OFICINA:
✓ Cambia contraseña default del router
✓ Usa WPA3 o WPA2 (no WEP)
✓ Oculta SSID si es posible
✓ Actualiza firmware del router

SOFTWARE ACTUALIZADO:

MANTENER ACTUALIZADO:
✓ Sistema operativo (Windows, macOS, Linux)
✓ Navegador web (Chrome, Firefox, Safari, Edge)
✓ Antivirus/antimalware
✓ Apps de productividad

¿POR QUÉ?
- Actualizaciones corrigen vulnerabilidades
- Atacantes explotan software antiguo
- Es tu primera línea de defensa

AUTOMATIZAR:
- Activa actualizaciones automáticas
- Reinicia regularmente para aplicar updates

NAVEGACIÓN SEGURA:

EXTENSIONES DE SEGURIDAD:
✓ uBlock Origin (bloquea ads maliciosos)
✓ HTTPS Everywhere (fuerza conexiones seguras)
✓ Privacy Badger (bloquea trackers)

CUIDADO CON EXTENSIONES:
✗ Solo instala de fuentes confiables
✗ Revisa permisos que piden
✗ Desinstala las que no uses

VERIFICAR HTTPS:
- Siempre verifica candado 🔒 en barra de dirección
- Click en candado para ver certificado
- Asegúrate que dice "techcorp.com" exactamente

RESPALDO Y RECUPERACIÓN

EXPORTA TUS DATOS:
- Mensualmente: Configuración > Datos > Exportar
- Guarda en almacenamiento separado
- No dependas solo de TechCorp

2. BACKUPS LOCALES:
- Disco duro externo
- Servicio de nube personal (Google Drive, Dropbox)
- No es redundancia si solo está en TechCorp

QUÉ HACER SI TE HACKEAN

SEÑALES DE COMPROMISO:
🚨 Alertas de inicio de sesión que no fuiste tú
🚨 Documentos modificados que no cambiaste
🚨 Cambios en configuración que no hiciste
🚨 Emails de "recuperación de contraseña" que no solicitaste

ACCIÓN INMEDIATA:

PASO 1 - Cambiar contraseña
- Si aún tienes acceso, cámbiala YA
- Desde dispositivo limpio (no comprometido)

PASO 2 - Cerrar todas las sesiones
- Configuración > Seguridad > Cerrar todas las sesiones

PASO 3 - Activar 2FA
- Si no lo tenías, actívalo inmediatamente

PASO 4 - Revisar actividad
- Check documentos modificados
- Revisa si se compartió información sensible
- Revisa cambios en configuración

PASO 5 - Notificar a TechCorp
- Email urgente: security@techcorp.com
- Incluye: línea de tiempo, qué observaste
- Coopera con investigación

PASO 6 - Cambiar contraseñas relacionadas
- Si reutilizaste contraseña, cámbiala en TODOS los sitios

PASO 7 - Escanear tu computadora
- Antivirus completo
- Antimalware (Malwarebytes)
- Considera formatear si infección seria

PREVENCIÓN CONTINUA

CHECKLIST MENSUAL:
□ Revisar dispositivos conectados
□ Exportar backup de datos importantes
□ Revisar alertas de seguridad
□ Actualizar software/apps
□ Cambiar contraseñas importantes (cada 90 días)

CHECKLIST ANUAL:
□ Auditoría completa de seguridad
□ Revisar permisos de apps/integraciones
□ Limpiar dispositivos antiguos/no usados
□ Generar nuevos códigos de respaldo 2FA
□ Revisar configuración de privacidad

EDUCACIÓN:
- Lee actualizaciones de seguridad de TechCorp
- Mantente informado sobre amenazas nuevas
- Comparte mejores prácticas con tu equipo

CONTACTO Y RECURSOS

REPORTAR INCIDENTE:
- Email 24/7: security@techcorp.com
- Chat urgente: Opción "Seguridad"

RECURSOS ADICIONALES:
- Centro de seguridad: security.techcorp.com
- Alertas de seguridad: status.techcorp.com/security
- Training de seguridad: academy.techcorp.com/security

Recuerda: La seguridad es un proceso continuo, no un evento único.

Última actualización: Enero 2025`,
      categoriasNombres: ["Soporte técnico", "Políticas de la empresa"]
   },
   {
      titulo: "Gestión de múltiples dispositivos conectados",
      contenido: `GUÍA DE GESTIÓN DE DISPOSITIVOS
TechCorp Solutions | Multi-Dispositivo | Enero 2025

INTRODUCCIÓN

TechCorp te permite acceder a tu cuenta desde múltiples dispositivos simultáneamente: computadora del trabajo, laptop personal, tablet, smartphone, y más. Esta guía te ayudará a gestionar todos tus dispositivos de forma segura y eficiente.

ACCESO MULTI-DISPOSITIVO

DISPOSITIVOS SOPORTADOS:

COMPUTADORAS:
✓ Windows 10/11
✓ macOS 10.15+
✓ Linux (Ubuntu, Fedora, etc.)
✓ Chrome OS

MÓVILES:
✓ iPhone/iPad (iOS 14+)
✓ Android (versión 8.0+)

NAVEGADORES:
✓ Chrome 90+
✓ Firefox 88+
✓ Safari 14+
✓ Edge 90+
✓ Brave, Opera (basados en Chromium)

LÍMITES POR PLAN:
- Plan Plus: Hasta 3 dispositivos simultáneos
- Plan Premium: Hasta 10 dispositivos simultáneos
- Plan Enterprise: Ilimitados

¿QUÉ CUENTA COMO "DISPOSITIVO"?
- Cada combinación de dispositivo físico + navegador
- Ejemplo: Tu laptop con Chrome Y tu laptop con Firefox = 2 dispositivos
- Modo incógnito cuenta como dispositivo separado

SINCRONIZACIÓN AUTOMÁTICA:

QUÉ SE SINCRONIZA:
✓ Documentos y contenido
✓ Categorías y organización
✓ Configuración de cuenta
✓ Preferencias de interfaz
✓ Historial de búsqueda
✓ Chats con IA
✓ Favoritos y marcadores

NO SE SINCRONIZA:
✗ Caché local del navegador
✗ Descargas pendientes
✗ Sesión de edición activa (hasta que guardes)
✗ Configuración del navegador

TIEMPO DE SINCRONIZACIÓN:
- Cambios importantes: Instantáneos (<1 segundo)
- Cambios menores: 2-5 segundos
- En conexión lenta: Hasta 30 segundos

VER DISPOSITIVOS CONECTADOS

ACCEDER A PANEL DE DISPOSITIVOS:

1. Inicia sesión en app.techcorp.com
2. Click en tu perfil (esquina superior derecha)
3. Configuración > Seguridad
4. Sección "Dispositivos conectados"

INFORMACIÓN MOSTRADA:

Para cada dispositivo verás:

DISPOSITIVO ACTUAL:
🟢 Marcado con "Este dispositivo"
✓ Nombre del dispositivo
✓ Navegador y versión
✓ Sistema operativo
✓ Ubicación actual
✓ Dirección IP
✓ Última actividad: "Ahora"

OTROS DISPOSITIVOS:
🔵 Nombre del dispositivo
✓ Navegador y versión
✓ Sistema operativo
✓ Última ubicación vista
✓ Dirección IP
✓ Última actividad: Fecha y hora
✓ Estado: Activo / Inactivo

EJEMPLO:

🟢 MacBook Pro (Este dispositivo)
   Safari 17.1 • macOS 14.0
   📍 Madrid, España
   🌐 IP: 192.168.1.45
   🕐 Última actividad: Ahora

🔵 iPhone 14
   Safari Mobile • iOS 17
   📍 Madrid, España
   🌐 IP: 192.168.1.87
   🕐 Última actividad: Hace 10 minutos

🔵 Windows Desktop
   Chrome 120 • Windows 11
   📍 Barcelona, España
   🌐 IP: 85.123.45.67
   🕐 Última actividad: Hace 2 horas


PERSONALIZAR NOMBRES:

Por default, dispositivos se nombran automáticamente.
Puedes personalizarlos:

1. Click en ícono ✏️ junto al nombre
2. Escribe nombre descriptivo
3. Ejemplos buenos:
   - "Laptop trabajo"
   - "iPhone personal"
   - "iPad casa"
   - "Chromebook viajes"

GESTIÓN DE DISPOSITIVOS

CERRAR SESIÓN REMOTA:

¿CUÁNDO HACERLO?
- Ves dispositivo que no reconoces
- Vendiste/regalaste un dispositivo
- Dispositivo fue robado
- Usaste computadora pública y olvidaste cerrar sesión
- Empleado dejó la empresa (Enterprise)

CÓMO:
1. Panel de dispositivos
2. Encuentra el dispositivo
3. Click "Cerrar sesión"
4. Confirma la acción
5. Efecto inmediato (30 segundos máximo)

CERRAR TODAS LAS SESIONES (EXCEPTO ACTUAL):

BOTÓN DE EMERGENCIA:
Si sospechas compromiso de seguridad:

1. Panel de dispositivos
2. Botón rojo "Cerrar todas las sesiones"
3. Confirma
4. TODAS las sesiones se cierran excepto la actual
5. Deberás iniciar sesión nuevamente en otros dispositivos

DESPUÉS DE ESTO:
- Cambia tu contraseña inmediatamente
- Activa 2FA si no lo tienes
- Reporta a soporte si sospechas hack

LIMPIAR DISPOSITIVOS INACTIVOS:

DISPOSITIVOS OBSOLETOS:
Después de 90 días sin actividad, dispositivos se marcan como "Inactivo"

LIMPIAR MANUALMENTE:
1. Panel de dispositivos
2. Filtro "Mostrar inactivos"
3. Revisa lista
4. Click "Eliminar" en dispositivos que ya no usas

BENEFICIO:
- Lista más limpia y fácil de auditar
- Mejor seguridad (menos puntos de entrada)
- Liberás espacio de tu cuota de dispositivos (Plan Plus)

AUTO-LIMPIEZA (Premium/Enterprise):
- Después de 180 días, dispositivos inactivos se eliminan automáticamente
- Recibes notificación 30 días antes
- Puedes desactivar auto-limpieza en configuración

AGREGAR NUEVO DISPOSITIVO

PROCESO NORMAL:

1. Ve a app.techcorp.com en nuevo dispositivo
2. Ingresa email y contraseña
3. Si tienes 2FA:
   - Ingresa código de 6 dígitos
   - O usa código de respaldo
4. (Opcional) Marca "Recordar este dispositivo" para no pedir 2FA por 30 días
5. Dispositivo agregado automáticamente

VERIFICACIÓN DE DISPOSITIVO NUEVO:

Si el sistema detecta:
- Dispositivo desde ubicación inusual
- Navegador/sistema operativo nunca usado antes
- Patrón de acceso sospechoso

ENTONCES:
1. Recibirás email de verificación
2. Debes confirmar que fuiste tú
3. Click en "Sí, fui yo" en el email
4. O ingresa código enviado
5. Dispositivo quedará verificado

SI NO FUISTE TÚ:
1. Click "No fui yo" en email
2. Se cierra esa sesión inmediatamente
3. Se te pide cambiar contraseña
4. Soporte es notificado para investigar

DISPOSITIVO CONFIABLE:

¿QUÉ ES?
Dispositivos personales que usas regularmente y quieres marcar como seguros.

BENEFICIOS:
✓ No pide 2FA cada vez (solo cada 30 días)
✓ No genera alertas de "nuevo dispositivo"
✓ Experiencia más fluida

CÓMO MARCAR:
1. Al iniciar sesión, checkbox "Recordar este dispositivo"
2. O en panel de dispositivos, click ⭐ para marcar favorito

REVOCAR CONFIANZA:
Si dispositivo fue robado o ya no es seguro:
1. Panel de dispositivos
2. Click en estrella ⭐ para quitar confianza
3. Próximo inicio de sesión pedirá 2FA completo

SEGURIDAD Y ALERTAS

NOTIFICACIONES AUTOMÁTICAS:

CONFIGURAR:
Configuración > Seguridad > Notificaciones de dispositivos

ACTIVAR ALERTAS PARA:

✅ Nuevo dispositivo inicia sesión:
Email + notificación push
"Se ha iniciado sesión desde iPhone en Madrid, España"

✅ Dispositivo desde ubicación inusual:
"Se ha iniciado sesión desde Nueva York, USA (primera vez desde esta ubicación)"

✅ Múltiples inicios de sesión fallidos:
"Alguien intentó acceder a tu cuenta 5 veces con contraseña incorrecta"

✅ Dispositivo eliminado:
"Se cerró sesión en Windows Desktop"

MÉTODO DE NOTIFICACIÓN:
- Email (siempre)
- Push en móvil (si tienes app TechCorp)
- SMS (solo planes Premium/Enterprise)

MEJORES PRÁCTICAS:

SEGURIDAD:

1. AUDITA REGULARMENTE:
   - Mensualmente revisa lista de dispositivos
   - Elimina los que no reconozcas
   - Pregunta si ves algo sospechoso

2. NOMBRA DISPOSITIVOS CLARAMENTE:
   - Fácil identificar cuál es cuál
   - "Laptop trabajo" en vez de "MacBook Pro"

3. CIERRA SESIÓN EN DISPOSITIVOS PÚBLICOS:
   - Nunca marques como "recordar" en computadoras compartidas
   - Siempre cierra sesión manualmente
   - Verifica que sesión esté cerrada

4. DISPOSITIVOS PRESTADOS:
   - Si prestas tu dispositivo, usa modo incógnito
   - O cierra sesión antes de prestar
   - Cambia contraseña después si no confías plenamente

PRODUCTIVIDAD:

1. APROVECHA SINCRONIZACIÓN:
   - Empieza documento en escritorio
   - Continúa en tablet en el sofá
   - Revisa final en móvil

2. ORGANIZA POR CONTEXTO:
   - Laptop trabajo: Solo documentos laborales
   - Tablet personal: Documentos personales
   - Móvil: Solo para consultar, no crear

3. MODO OFFLINE:
   - Activa en dispositivos que uses sin internet
   - Sincroniza cuando vuelva conexión

SOLUCIÓN DE PROBLEMAS

PROBLEMA: "No veo mi dispositivo en la lista"

CAUSA POSIBLE:
- Sesión expiró
- Navegador en modo incógnito (no persiste)
- Cookies/caché limpiadas

SOLUCIÓN:
- Inicia sesión nuevamente
- Dispositivo aparecerá

PROBLEMA: "Veo dispositivo que no reconozco"

¡URGENTE!
1. Cierra sesión en ese dispositivo inmediatamente
2. Cambia contraseña
3. Activa 2FA
4. Reporta a security@techcorp.com
5. Revisa si hay cambios no autorizados en tus documentos

PROBLEMA: "Cambios no se sincronizan entre dispositivos"

SOLUCIONES:
1. Verifica conexión a internet en ambos
2. Refresca página (F5 o Cmd+R)
3. Cierra y vuelve a abrir navegador
4. Espera 1-2 minutos (puede haber delay)
5. Si persiste: Soporte

PROBLEMA: "Alcancé límite de dispositivos (Plan Plus)"

OPCIONES:
1. Cierra sesión en dispositivo que menos uses
2. Elimina dispositivos inactivos
3. Upgrade a Premium (10 dispositivos)

PROBLEMA: "Olvidé cerrar sesión en computadora pública"

¡ACTÚA RÁPIDO!
1. Desde otro dispositivo, ve a panel de dispositivos
2. Identifica el dispositivo público
3. Click "Cerrar sesión"
4. Si no recuerdas cuál era, usa "Cerrar todas las sesiones"
5. Cambia contraseña por precaución

FUNCIONES AVANZADAS (Enterprise)

GESTIÓN CENTRALIZADA:

ADMINS PUEDEN:
- Ver dispositivos de todos los usuarios del equipo
- Forzar cierre de sesión remoto
- Establecer políticas de dispositivos
- Requerir 2FA en todos los dispositivos
- Bloquear dispositivos personales (BYOD control)
- Geofencing (solo permitir dispositivos en ubicaciones específicas)

REPORTES:
- Actividad por dispositivo
- Patrones de uso
- Dispositivos potencialmente comprometidos
- Auditoría para compliance

POLÍTICAS:
- Máximo número de dispositivos por usuario
- Requerir renovación de confianza cada X días
- Bloquear dispositivos rooted/jailbroken
- Forzar desconexión después de X días inactivos

INTEGRACIÓN MDM:
- Microsoft Intune
- VMware Workspace ONE
- Jamf (para Apple devices)

PREGUNTAS FRECUENTES

P: ¿Puedo usar TechCorp en móvil sin app?
R: Sí, la web móvil funciona perfectamente. App nativa es opcional.

P: ¿Si alguien roba mi teléfono puede acceder?
R: Solo si no tienes lock screen. Por eso recomendamos PIN/huella/Face ID.

P: ¿Puedo compartir mi cuenta con un colega?
R: No, cada usuario debe tener su propia cuenta. Usa funciones de compartir documentos.

P: ¿Cuánto espacio usa la app móvil?
R: iOS: ~50MB, Android: ~45MB. Documentos offline adicionales.

P: ¿Funciona offline?
R: Sí, si activas modo offline. Sincroniza cuando vuelva internet.

CONTACTO

SOPORTE TÉCNICO:
- Email: support@techcorp.com
- Chat: En app.techcorp.com

SEGURIDAD:
- Email: security@techcorp.com (24/7)

Última actualización: Enero 2025`,
      categoriasNombres: ["Soporte técnico", "F. A. Q."]
   },
   {
      titulo: "Preguntas frecuentes sobre planes y upgrades",
      contenido: `FAQ: PLANES Y UPGRADES
TechCorp Solutions | Preguntas Frecuentes | Enero 2025

¿PENSANDO EN ACTUALIZAR TU PLAN?

Esta guía responde las preguntas más comunes sobre cambios de plan, diferencias entre tiers, proceso de upgrade, cargos, y beneficios para ayudarte a tomar la mejor decisión.

COMPARACIÓN DE PLANES

PLAN PLUS ($10/mes o $96/año):
Ideal para: Usuarios individuales con necesidades básicas
✓ Hasta 5GB de almacenamiento
✓ 10 consultas IA por mes
✓ 10 interacciones con documentos
✓ Hasta 3 dispositivos simultáneos
✓ Soporte por email (respuesta en 24h)
✓ Búsqueda básica
✓ Acceso web y móvil

PLAN PREMIUM ($20/mes o $192/año):
Ideal para: Profesionales y equipos pequeños
✓ Almacenamiento ilimitado
✓ Consultas IA ilimitadas
✓ Interacciones ilimitadas con documentos
✓ Hasta 10 dispositivos simultáneos
✓ Soporte prioritario 24/7
✓ Búsqueda avanzada con filtros
✓ Colaboración en tiempo real
✓ Versiones de documentos ilimitadas
✓ Exportación en múltiples formatos
✓ Análisis y reportes
✓ Integraciones premium

PLAN ENTERPRISE (Precio personalizado):
Ideal para: Grandes organizaciones
✓ Todo lo de Premium, más:
✓ Dispositivos ilimitados
✓ SSO (Single Sign-On)
✓ Gestión centralizada de usuarios
✓ Compliance avanzado (HIPAA, SOC 2)
✓ Soporte dedicado con SLA 99.99%
✓ Account manager personal
✓ Customización de plataforma
✓ API sin límites
✓ Capacitación on-site
✓ Contrato anual con descuentos

AHORRO ANUAL:
- Plus: $96/año vs $120 pagando mensual = Ahorro 20%
- Premium: $192/año vs $240 pagando mensual = Ahorro 20%

PREGUNTAS SOBRE UPGRADES

P: ¿Cómo actualizo mi plan?
R: Configuración > Facturación > Cambiar plan > Selecciona nuevo plan > Confirmar. El cambio es inmediato.

P: ¿Cuánto cuesta hacer upgrade a mitad del período?
R: Solo pagas la diferencia proporcional del tiempo restante.

EJEMPLO:
- Tienes Plus mensual ($10), faltan 15 días
- Quieres Premium ($20/mes)
- Costo adicional: ($20-$10) × (15/30) = $5
- Tu próxima renovación será $20/mes completo

P: ¿Puedo hacer upgrade de mensual a anual?
R: Sí. Pagas la diferencia prorrateada por el mes actual, luego cambias a ciclo anual en la siguiente renovación.

P: ¿Se migran mis datos al hacer upgrade?
R: Sí, automáticamente y sin pérdida. Todos tus documentos, configuración, y historial se conservan intactos.

P: ¿Puedo cancelar el upgrade?
R: No puedes cancelar un upgrade, pero puedes hacer downgrade después. Ten en cuenta que downgrades aplican al final del período de facturación.

P: ¿El upgrade incluye nuevas funciones de inmediato?
R: Sí, el acceso a funciones Premium es instantáneo tras confirmar el pago.

P: ¿Hay descuentos por upgrade?
R: Sí, si pagas anualmente ahorras 20%. Empresas con +10 usuarios califican para descuentos adicionales (contacta ventas).

P: ¿Necesito cambiar mi método de pago?
R: No necesariamente. Usaremos tu método existente, pero puedes actualizarlo en Configuración > Facturación > Métodos de pago.

PREGUNTAS SOBRE DOWNGRADES

P: ¿Puedo hacer downgrade?
R: Sí, en cualquier momento. El downgrade se aplica al final de tu período de facturación actual para que aproveches lo que ya pagaste.

P: ¿Qué pasa si excedo los límites del plan inferior?
R: Antes de aplicar el downgrade, te pediremos:
- Exportar o eliminar documentos si excedes 5GB (downgrade a Plus)
- Identificar cuáles dispositivos mantener si excedes límite

P: ¿Pierdo funcionalidad inmediatamente?
R: No. Sigues con todas las funciones Premium hasta que termine tu período pagado.

P: ¿Hay reembolso por downgrade?
R: No hay reembolso, pero recibes crédito proporcional aplicado a tu próxima factura.

EJEMPLO:
- Tienes Premium anual ($192/año), han pasado 3 meses
- Haces downgrade a Plus ($96/año)
- Crédito: ($192-$96) × (9/12) = $72
- Ese crédito se aplica a tus futuras renovaciones

P: ¿Puedo revertir el downgrade?
R: Sí, antes de que se aplique. Configuración > Facturación > Cancelar downgrade programado.

P: ¿Qué pasa con mis integraciones Premium?
R: Dejan de funcionar cuando el downgrade se aplica. Exporta datos importantes antes.

FUNCIONALIDADES POR PLAN

ALMACENAMIENTO:
- Plus: 5GB (≈ 5,000 documentos de texto o 500 PDFs con imágenes)
- Premium/Enterprise: Ilimitado

IA Y CONSULTAS:
- Plus: 10 consultas/mes (suficiente para uso ocasional)
- Premium/Enterprise: Ilimitadas

COLABORACIÓN:
- Plus: Compartir documentos (solo lectura)
- Premium: Edición colaborativa en tiempo real
- Enterprise: + Permisos granulares y auditoría

SOPORTE:
- Plus: Email, 24h respuesta, horario laboral
- Premium: Email + Chat 24/7, 1h respuesta
- Enterprise: Dedicado, 15min respuesta, teléfono directo

INTEGRACIONES:
- Plus: Google Drive, Dropbox (básicas)
- Premium: + Slack, Zapier, webhooks personalizados
- Enterprise: + SSO, API ilimitada, integraciones custom

SEGURIDAD:
- Plus: Cifrado estándar, 2FA opcional
- Premium: + Auditoría de accesos, backups extendidos
- Enterprise: + Compliance (HIPAA, SOC 2), SSO, políticas avanzadas

CASOS DE USO POR PLAN

PLAN PLUS - Perfecto para:
- Estudiantes organizando apuntes
- Freelancers con pocos clientes
- Uso personal de documentación
- Presupuesto limitado
- Necesidades básicas

PLAN PREMIUM - Perfecto para:
- Profesionales que usan IA frecuentemente
- Equipos pequeños (2-10 personas)
- Agencias con múltiples proyectos
- Quienes necesitan colaboración
- Usuarios power

PLAN ENTERPRISE - Perfecto para:
- Empresas +50 empleados
- Industrias reguladas (salud, finanzas)
- Necesidad de compliance
- Requerimientos de customización
- Integración con sistemas internos

PROCESO DE UPGRADE PASO A PASO

PASO 1: Evaluar necesidades
- ¿Alcanzaste límites de tu plan actual?
- ¿Necesitas funciones específicas de tier superior?
- ¿El ROI justifica el costo?

PASO 2: Revisar planes
- Lee comparación detallada en techcorp.com/pricing
- Calcula costo real con ciclo anual (20% ahorro)
- Verifica funciones que más necesitas

PASO 3: Hacer upgrade
- Configuración > Facturación > Cambiar plan
- Selecciona plan deseado
- Elige ciclo (mensual/anual)
- Revisa resumen de costo
- Confirmar

PASO 4: Verificar cambio
- Recibirás email de confirmación
- Verifica que funciones Premium estén activas
- Recibo se envía a tu email de facturación

PASO 5: Explorar nuevas funciones
- Check "Novedades" para tour de funciones nuevas
- Lee documentación de funciones Premium
- Ajusta configuración según necesites

PREGUNTAS SOBRE FACTURACIÓN

P: ¿Cómo se me cobrará el upgrade?
R: Usando el mismo método de pago registrado (tarjeta/PayPal). Se carga automáticamente la diferencia prorrateada.

P: ¿Cuándo se me cobra?
R: Inmediatamente al confirmar el upgrade por la diferencia del período actual. Luego, en tu fecha de renovación normal.

P: ¿Puedo cambiar de mensual a anual después?
R: Sí. Al finalizar tu período mensual, cambia a facturación anual y ahorra 20%.

P: ¿Aceptan múltiples métodos de pago?
R: Sí: Tarjeta crédito/débito, PayPal, Transferencia (Enterprise), Crypto (algunos países).

P: ¿Hay impuestos adicionales?
R: Depende de tu país. IVA/Tax se calcula según tu ubicación y se muestra antes de confirmar.

P: ¿Emiten facturas?
R: Sí, automáticamente por email tras cada pago. También disponibles en Configuración > Facturación > Historial.

P: ¿Ofrecen plan de pago empresarial?
R: Enterprise puede pagar por factura (NET-30) con contrato anual. Contacta ventas@techcorp.com.

DESCUENTOS Y PROMOCIONES

DESCUENTOS DISPONIBLES:

1. ESTUDIANTES/EDUCADORES:
   - 50% descuento en Premium
   - Verificación vía email educativo (.edu)
   - Renovación anual con revalidación

2. NONPROFITS:
   - 30% descuento en cualquier plan
   - Requiere documentación de nonprofit status

3. EQUIPOS:
   - 5-10 usuarios: 10% descuento
   - 11-50 usuarios: 20% descuento
   - 50+ usuarios: Contacta ventas (hasta 40%)

4. ANUAL:
   - 20% automático vs pago mensual

5. REFERIDOS:
   - Invita amigos: $10 crédito por referido exitoso
   - Referido obtiene: 1 mes gratis de Plus

¿CÓMO APLICAR DESCUENTO?
- Código promocional al momento de checkout
- O contacta soporte con documentación

PREGUNTAS SOBRE ENTERPRISE

P: ¿Cómo contratar Enterprise?
R: Contacta sales@techcorp.com o completa formulario en techcorp.com/enterprise. Llamada de descubrimiento en 24h.

P: ¿Cuál es el mínimo de usuarios?
R: Típicamente 50+, pero evaluamos caso por caso.

P: ¿Qué incluye la customización?
R: Branding (logo, colores), flujos personalizados, integraciones específicas, campos customizados.

P: ¿Ofrecen capacitación?
R: Sí. Enterprise incluye:
- Onboarding remoto (4 horas)
- Capacitación on-site (opcional, con costo)
- Materiales de training
- Sesiones de Q&A mensuales

P: ¿Hay contrato mínimo?
R: Enterprise generalmente requiere contrato anual, pero negociamos términos según caso.

MIGRACIÓN DESDE COMPETIDORES

¿VIENES DE OTRA PLATAFORMA?

OFRECEMOS:
- Asistencia gratuita de migración (Premium/Enterprise)
- Scripts de importación para plataformas populares
- 1 mes gratis mientras migras (aplican términos)

PLATAFORMAS SOPORTADAS:
- Notion, Evernote, Google Docs, Confluence, Dropbox Paper

PROCESO:
1. Exporta datos de plataforma anterior
2. Contacta soporte con archivo
3. Nuestro equipo ejecuta importación
4. Revisas y validas
5. Listo para usar

COMPARACIÓN VS COMPETIDORES:
Ver techcorp.com/compare para tabla detallada vs Notion, Evernote, etc.

GARANTÍAS Y POLÍTICAS

GARANTÍA DE SATISFACCIÓN:
- 30 días money-back en cualquier plan nuevo
- Si no te convence, reembolso completo
- Sin preguntas

CANCELACIÓN:
- Sin penalización
- Cancela en cualquier momento
- Datos conservados 60 días por si cambias de opinión

CONGELAMIENTO (Premium/Enterprise):
- Congela cuenta 1-3 meses
- No se cobra durante pausa
- Útil para vacaciones o proyectos pausados

SOPORTE EN UPGRADE

¿NECESITAS AYUDA PARA DECIDIR?

CONTACTA:
- Chat en vivo: Disponible en app.techcorp.com
- Email: support@techcorp.com
- Ventas Enterprise: sales@techcorp.com
- Teléfono: +1-800-UPGRADE

RECURSOS:
- Calculadora de plan: techcorp.com/calculator
- Comparación detallada: techcorp.com/pricing
- Case studies: techcorp.com/customers
- Webinar mensual: "Choosing the Right Plan"

ÚLTIMAS RECOMENDACIONES:

UPGRADE SI:
✓ Alcanzas límites frecuentemente
✓ Necesitas funciones específicas de Premium
✓ Usas la plataforma diariamente
✓ El costo se justifica por productividad
✓ Tu negocio depende de TechCorp

MANTÉN PLAN ACTUAL SI:
✓ Usas <50% de tu cuota
✓ Uso ocasional/hobby
✓ Funciones actuales son suficientes
✓ Presupuesto es restrictivo

CONSIDERA DOWNGRADE SI:
✓ Pagas por funciones que no usas
✓ Cambió tu necesidad/uso
✓ Buscas reducir costos
✓ Puedes vivir con límites de plan inferior

Recuerda: Puedes cambiar de plan en cualquier momento. Experimenta sin compromiso con nuestra garantía de 30 días.

Última actualización: Enero 2025`,
      categoriasNombres: ["F. A. Q."]
   },
   {
      titulo: "Manual de uso del buscador avanzado",
      contenido: `MANUAL DEL BUSCADOR AVANZADO
TechCorp Solutions | Guía de Búsqueda | Enero 2025

INTRODUCCIÓN

El buscador avanzado de TechCorp te permite encontrar información rápidamente en miles de documentos usando filtros, operadores especiales, y técnicas de búsqueda profesional. Domina estas herramientas para maximizar tu productividad.

BÚSQUEDA BÁSICA

ACCESO AL BUSCADOR:
- Barra de búsqueda en parte superior (o Ctrl+K / Cmd+K)
- Página de búsqueda dedicada: app.techcorp.com/search

BÚSQUEDA SIMPLE:
1. Escribe palabras clave
2. Presiona Enter
3. Resultados se ordenan por relevancia

EJEMPLO:
Buscar: "informe ventas"
Encuentra: Documentos con "informe" Y "ventas" en cualquier orden

CARACTERÍSTICAS:
- Busca en título, contenido, etiquetas, y comentarios
- No distingue mayúsculas/minúsculas por default
- Ignora acentos automáticamente
- Resultados en tiempo real mientras escribes

OPERADORES DE BÚSQUEDA

COMILLAS - Frase exacta:
"informe de ventas"
Encuentra solo documentos con esa frase exacta en ese orden.

EJEMPLO:
- "estrategia de marketing" ✓ encuentra: "nuestra estrategia de marketing digital"
- "estrategia de marketing" ✗ NO encuentra: "estrategia y plan de marketing"

AND (Y) - Requiere todos los términos:
estrategia AND marketing AND 2024
Encuentra documentos que contienen todos esos términos.

NOTA: Por default, espacio = AND
"estrategia marketing" = "estrategia AND marketing"

OR (O) - Requiere al menos uno:
ventas OR ingresos OR revenue
Encuentra documentos con cualquiera de esos términos.

ÚTIL para sinónimos o variaciones.

NOT (NO) - Excluir términos:
marketing NOT digital
Encuentra documentos con "marketing" pero SIN "digital"

TAMBIÉN: símbolo - (menos)
marketing -digital

PARÉNTESIS - Agrupar operadores:
(marketing OR ventas) AND 2024
Encuentra documentos con ("marketing" o "ventas") Y "2024"

ÚTIL para búsquedas complejas:
(informe OR reporte) AND (ventas OR ingresos) AND Q1

COMODINES:

ASTERISCO * - Cualquier caracter(es):
market* encuentra: marketing, market, marketplace, marketer

INTERROGACIÓN ? - Un caracter:
mar?a encuentra: maria, marta

BÚSQUEDA PARCIAL:
~estrateg encuentra: estrategia, estratégico, estratégica

OPERADORES AVANZADOS

CAMPO ESPECÍFICO:

TÍTULO:
title:"Informe anual"
Busca solo en títulos

CONTENIDO:
content:blockchain
Busca solo en contenido (no título/etiquetas)

CATEGORÍA:
category:"Políticas de la empresa"
Filtra por categoría específica

AUTOR:
author:maria.gonzalez@test.com
Documentos creados por usuario específico

FECHA:
created:2024-01-15
Documentos creados esa fecha exacta

modified:>2024-01-01
Documentos modificados después de esa fecha

EJEMPLOS COMBINADOS:
title:informe AND author:juan AND created:>2024-01-01
category:"Soporte técnico" AND content:password

PROXIMIDAD:

NEAR/N - Términos cerca uno del otro:
"marketing" NEAR/5 "digital"
Encuentra "marketing" y "digital" con máximo 5 palabras entre ellos

EJEMPLO encontrado:
"El marketing moderno requiere estrategias digitales" ✓
"marketing... [20 palabras]... digital" ✗

FUZZY SEARCH - Tolerancia a errores:

~termino - Búsqueda difusa:
~estrategia encuentra: estratejia, estrategía, estrategia

AJUSTAR TOLERANCIA:
~estrategia~1 (distancia de edición = 1)
Más estricto

~estrategia~2 (distancia de edición = 2)
Más permisivo

ÚTIL PARA:
- Errores tipográficos
- Variaciones ortográficas
- Nombres difíciles

FILTROS DE BÚSQUEDA

PANEL DE FILTROS (Lado izquierdo de resultados):

FECHA DE CREACIÓN:
☐ Hoy
☐ Última semana
☐ Último mes
☐ Último año
☐ Personalizado (rango de fechas)

FECHA DE MODIFICACIÓN:
☐ Modificado hoy
☐ Modificado esta semana
☐ Modificado este mes
☐ Personalizado

CATEGORÍAS:
☐ F.A.Q.
☐ Soporte técnico
☐ Políticas de la empresa
[Selección múltiple permitida]

AUTOR/CREADOR:
☐ Yo
☐ María González
☐ Juan Pérez
☐ Otros

TIPO DE DOCUMENTO:
☐ Documento de texto
☐ Con imágenes
☐ Con tablas
☐ Con links

ESTADO:
☐ Activos
☐ Archivados
☐ Borradores

TAMAÑO:
☐ Pequeño (<10KB)
☐ Mediano (10-100KB)
☐ Grande (>100KB)

FAVORITOS:
☐ Solo mis favoritos

COMPARTIDOS:
☐ Solo compartidos conmigo
☐ Solo compartidos por mí

ORDEN DE RESULTADOS

OPCIONES DE ORDENAMIENTO:

RELEVANCIA (Default):
Ordenado por qué tan bien coincide con tu búsqueda
Algoritmo considera:
- Frecuencia del término
- Ubicación (título pesa más que contenido)
- Recencia del documento

MÁS RECIENTE:
Documentos más nuevos primero

MÁS ANTIGUO:
Documentos más viejos primero

ÚLTIMO MODIFICADO:
Documentos editados recientemente primero

ALFABÉTICO (A-Z):
Por título del documento

TAMAÑO:
De menor a mayor (o viceversa)

CAMBIAR ORDEN:
Click en dropdown "Ordenar por:" arriba de resultados

BÚSQUEDAS GUARDADAS

GUARDAR BÚSQUEDA FRECUENTE:

1. Ejecuta tu búsqueda con filtros
2. Click "Guardar búsqueda" (ícono ⭐)
3. Nombra la búsqueda: "Reportes Q1 2024"
4. Guardar

ACCEDER A BÚSQUEDAS GUARDADAS:
- Panel izquierdo > Búsquedas guardadas
- O menú dropdown en barra de búsqueda

NOTIFICACIONES:
☑ Notificarme cuando haya nuevos resultados
Recibes alerta cuando documentos nuevos coinciden con tu búsqueda guardada

ÚTIL PARA:
- Búsquedas complejas que repites
- Monitorear temas específicos
- Seguimiento de proyectos

GESTIONAR:
- Editar búsqueda guardada
- Eliminar
- Compartir con equipo (Premium/Enterprise)

TÉCNICAS AVANZADAS

BÚSQUEDA INCREMENTAL:

REFINAMIENTO:
1. Búsqueda inicial: "marketing"
2. Demasiados resultados
3. Refinar: "marketing digital 2024"
4. Agregar filtro: Categoría = Reportes
5. Todavía mucho? Agregar: author:maria

BÚSQUEDA POR CONTENIDO SIMILAR:

En cualquier resultado:
- Click botón "..." (más opciones)
- "Buscar similares"
- Sistema encuentra documentos relacionados temáticamente

ÚTIL para descubrir documentos que olvidaste o no conocías.

BÚSQUEDA MULTI-IDIOMA:

TechCorp detecta idioma automáticamente:
- Buscar "strategy" también encuentra "estrategia" (si configurado)
- Configuración > Búsqueda > Multi-idioma

BÚSQUEDA EN ARCHIVOS ADJUNTOS:

Si tu plan incluye:
- PDFs: Contenido extraído automáticamente
- Imágenes: OCR (reconocimiento de texto)
- Office docs: Contenido indexado

EXCLUIR ARCHIVOS:
filetype:-pdf
Excluye resultados en PDF

BUSCAR SOLO EN ARCHIVOS:
filetype:pdf
Solo PDFs

EJEMPLOS PRÁCTICOS

CASO 1: Buscar reporte específico

title:"Reporte Q1" AND year:2024 AND author:maria


CASO 2: Investigación sobre tema

(blockchain OR "distributed ledger") AND category:"Tecnología"


CASO 3: Documentos recientes sobre proyecto

"Proyecto Phoenix" AND modified:>2024-12-01


CASO 4: Políticas actualizadas recientemente

category:"Políticas" AND modified:>2024-01-01
Ordenar por: Último modificado


CASO 5: Todos mis documentos sin finalizar

author:me AND status:borrador


CASO 6: Documentos populares del equipo

shared:true AND favorites:>10
Ordenar por: Más favoritos


ATAJOS DE TECLADO

BÚSQUEDA:
- Ctrl/Cmd + K: Abrir búsqueda rápida
- Esc: Cerrar búsqueda
- ↑/↓: Navegar resultados
- Enter: Abrir resultado seleccionado
- Ctrl/Cmd + Enter: Abrir en nueva pestaña

FILTROS:
- Ctrl/Cmd + F: Focus en filtros
- Tab: Navegar entre filtros

RESULTADOS:
- J/K: Siguiente/anterior resultado (modo teclado)
- S: Agregar a favoritos
- Ctrl/Cmd + D: Descargar documento

SOLUCIÓN DE PROBLEMAS

PROBLEMA: "No encuentro un documento que sé que existe"

SOLUCIONES:
1. Verifica spelling - usa fuzzy search (~termino)
2. Busca por sinónimos con OR
3. Busca solo por título: title:palabra
4. Elimina filtros que puedan estar excluyéndolo
5. Busca en archivados: status:archivado

PROBLEMA: "Demasiados resultados irrelevantes"

SOLUCIONES:
1. Usa comillas para frases exactas
2. Agrega más términos con AND
3. Usa operador NOT para excluir
4. Aplica filtros de categoría/fecha
5. Busca en campos específicos (title: o content:)

PROBLEMA: "Búsqueda es muy lenta"

SOLUCIONES:
1. Sé más específico (menos resultados = más rápido)
2. Usa filtros para reducir conjunto de búsqueda
3. Evita comodines al inicio: *marketing (lento)
4. Contacta soporte si persiste

PROBLEMA: "No encuentro documentos compartidos conmigo"

SOLUCIÓN:
- Activa filtro "Compartidos conmigo"
- O busca: shared:true

MEJORES PRÁCTICAS

NOMENCLATURA CONSISTENTE:
- Usa convenciones de nombres para documentos
- Facilita búsqueda futura
- Ejemplo: "Reporte_Ventas_Q1_2024" vs "reporteventasq12024"

ETIQUETAS Y CATEGORÍAS:
- Categoriza documentos correctamente
- Facilita filtrado posterior
- Revisa y actualiza periódicamente

BÚSQUEDAS COMPLEJAS:
- Construye incrementalmente
- Guarda búsquedas complejas útiles
- Documenta búsquedas especializadas para tu equipo

LIMPIEZA:
- Archiva documentos obsoletos
- Elimina duplicados
- Mejora calidad de resultados

SINÓNIMOS:
- Mantén lista de sinónimos usados en tu organización
- Úsalos en búsquedas con OR
- Ejemplo: revenue OR ingresos OR ganancia

RECURSOS ADICIONALES

DOCUMENTACIÓN:
- help.techcorp.com/search-guide
- Video tutorials: academy.techcorp.com

SOPORTE:
- Chat en vivo para asistencia con búsquedas
- support@techcorp.com

TIPS SEMANALES:
- Suscríbete a newsletter para tips avanzados
- techcorp.com/newsletter

SHORTCUTS CARD:
- Descarga PDF con todos los atajos
- help.techcorp.com/shortcuts

Última actualización: Enero 2025`,
      categoriasNombres: ["Soporte técnico", "F. A. Q."]
   },
   {
      titulo: "Política de retención y eliminación de datos",
      contenido: `POLÍTICA DE RETENCIÓN Y ELIMINACIÓN DE DATOS
TechCorp Solutions | Gestión de Datos | Enero 2025

INTRODUCCIÓN

Esta política explica cómo TechCorp gestiona la retención y eliminación de datos para equilibrar tu privacidad, necesidades de recuperación, y cumplimiento legal. Es importante que entiendas el ciclo de vida de tus datos en nuestra plataforma.

CICLO DE VIDA DE LOS DATOS

DATOS ACTIVOS:
- Estado: Disponibles inmediatamente
- Ubicación: Servidores de producción
- Acceso: Instantáneo
- Backups: Diarios automáticos
- Duración: Mientras tu cuenta esté activa

DATOS ELIMINADOS (PAPELERA):
- Estado: Marcados para eliminación
- Ubicación: Partición de papelera
- Acceso: Recuperable por ti
- Duración: 30 días
- Después: Eliminación permanente

DATOS ARCHIVADOS:
- Estado: Cuenta inactiva
- Ubicación: Almacenamiento frío
- Acceso: Recuperable contactando soporte
- Duración: Hasta 90 días
- Después: Eliminación permanente

ELIMINACIÓN DE DOCUMENTOS

ELIMINAR DOCUMENTO:

DESDE DOCUMENTO:
1. Abre documento
2. Menu ⋮ > Eliminar
3. Confirma acción
4. Documento va a papelera

DESDE LISTA:
1. Selecciona documento(s)
2. Click ícono 🗑️ o botón "Eliminar"
3. Confirma
4. A papelera

ELIMINACIÓN MÚLTIPLE:
- Checkbox para seleccionar varios
- Máximo 100 documentos a la vez
- "Seleccionar todos" para todos en página actual

QUÉ SUCEDE:
✓ Documento ya no visible en tu biblioteca
✓ Deja de aparecer en búsquedas
✓ Se mueve a papelera por 30 días
✓ Mantiene todos sus metadatos
✓ Colaboradores pierden acceso
✓ Links compartidos dejan de funcionar

PAPELERA (30 DÍAS)

ACCESO A PAPELERA:
- Menú lateral > Papelera
- O app.techcorp.com/trash

VER CONTENIDO:
- Lista de documentos eliminados
- Fecha de eliminación
- Fecha de eliminación permanente (30 días después)
- Tamaño original
- Categoría original

RECUPERAR DE PAPELERA:

RECUPERAR UNO:
1. Papelera > Encuentra documento
2. Click derecho > Restaurar
3. O selecciona > Botón "Restaurar"
4. Documento vuelve a ubicación original

RECUPERAR VARIOS:
1. Checkbox para seleccionar
2. "Seleccionar todos" si deseas todos
3. Botón "Restaurar seleccionados"

QUÉ SE RECUPERA:
✓ Contenido completo
✓ Metadatos originales
✓ Categorías
✓ Fecha de creación original
✗ NO se restauran permisos de compartir (debes re-compartir)
✗ NO se restauran comentarios de colaboradores

BUSCAR EN PAPELERA:
- Barra de búsqueda en papelera
- Filtros por fecha de eliminación
- Ordenar por varios criterios

ELIMINAR PERMANENTEMENTE DE PAPELERA:

ELIMINAR UNO:
1. Papelera > Documento
2. Click derecho > Eliminar permanentemente
3. Confirma (se pide confirmación extra)
4. ⚠️ NO REVERSIBLE

VACIAR PAPELERA:
1. Botón "Vaciar papelera" en parte superior
2. Confirma que deseas eliminar TODO
3. ⚠️ ELIMINA TODO, NO REVERSIBLE

POR QUÉ HACERLO:
- Liberar espacio de almacenamiento (Plan Plus con límites)
- Eliminar datos sensibles definitivamente
- Limpieza de documentos obsoletos

⚠️ ADVERTENCIA:
Eliminación permanente es FINAL. Ni siquiera TechCorp puede recuperar esos datos.

AUTO-ELIMINACIÓN DESPUÉS DE 30 DÍAS:

PROCESO AUTOMÁTICO:
- Cada noche a medianoche UTC
- Sistema busca documentos con >30 días en papelera
- Los elimina permanentemente y automáticamente
- Sin notificación adicional (ya fuiste notificado al eliminar)

NOTIFICACIONES:
- 7 días antes: Email recordatorio "Documentos serán eliminados"
- 1 día antes: Email final "Última oportunidad"
- Después de eliminación: Ninguna (proceso silencioso)

PREVENIR AUTO-ELIMINACIÓN:
- Restaura el documento antes de 30 días
- No hay forma de extender el período de 30 días

EXCEPCIONES:
- Enterprise puede negociar períodos más largos
- Legal holds (ver abajo) previenen eliminación

CUENTA INACTIVA

DEFINICIÓN DE INACTIVIDAD:
- Sin inicio de sesión por 180 días (6 meses)
- Sin actividad de API
- Sin pagos activos (planes gratuitos)

QUÉ SUCEDE:

DESPUÉS DE 180 DÍAS:
- Email: "Tu cuenta está inactiva"
- Opción de reactivar con un click
- Datos aún disponibles

DESPUÉS DE 270 DÍAS (9 MESES):
- Email: "Última advertencia, datos serán archivados"
- 30 días para reactivar

DESPUÉS DE 365 DÍAS (1 AÑO):
- Datos movidos a almacenamiento frío
- Cuenta desactivada
- Recuperación posible contactando soporte
- Puede haber cargo por recuperación

DESPUÉS DE 730 DÍAS (2 AÑOS):
- Eliminación permanente de todos los datos
- Cuenta cerrada
- NO recuperable

EXCEPCIONES:
✓ Planes pagos activos: Nunca se consideran inactivos
✓ Cuentas con suscripción pausada: Reloj se detiene
✓ Enterprise: Políticas personalizadas

RECUPERACIÓN DE CUENTA INACTIVA:
1. Intenta iniciar sesión
2. Sistema detecta inactividad
3. Email de verificación
4. Confirma que deseas reactivar
5. Cuenta restaurada

RETENCIÓN DE BACKUPS

BACKUPS AUTOMÁTICOS:

FRECUENCIA:
- Incrementales: Cada hora
- Diferenciales: Cada 6 horas
- Completos: Diarios (medianoche UTC)

RETENCIÓN POR PLAN:
- Plan Plus: 30 días de backups
- Plan Premium: 90 días de backups
- Plan Enterprise: 365 días de backups

UBICACIÓN:
- 3 datacenters geográficamente distribuidos
- Cifrado AES-256
- Redundancia triple

RECUPERACIÓN DESDE BACKUP:

ESCENARIOS:
- Eliminaste documento hace >30 días (ya no en papelera)
- Cuenta comprometida, datos dañados
- Corrupción de datos
- Desastre del sistema

PROCESO:
1. Contacta support@techcorp.com o recovery@techcorp.com
2. Proporciona:
   - Nombre/descripción del documento
   - Fecha aproximada de última versión buena
   - Tu ID de usuario
3. Soporte busca en backups históricos
4. Si se encuentra, te envían enlace de descarga
5. Descargas y revisas
6. Soporte restaura si confirmas

TIEMPO:
- Plus: 24-48 horas
- Premium: 12-24 horas
- Enterprise: 2-4 horas (según SLA)

COSTO:
- Plus: Incluido, pero limitado a 2 recuperaciones/año
- Premium: Ilimitadas recuperaciones incluidas
- Enterprise: Ilimitadas + asistencia dedicada

ELIMINACIÓN DE CUENTA

CERRAR TU CUENTA:

PROCESO:
1. Configuración > Cuenta > Cerrar cuenta
2. Se te pregunta razón (opcional)
3. ⚠️ Advertencias claras sobre eliminación de datos
4. Opción de exportar datos primero (recomendado)
5. Confirmar con contraseña
6. Segundo paso de confirmación
7. Cuenta programada para cierre

QUÉ SUCEDE INMEDIATAMENTE:
✓ Pierdes acceso a cuenta
✓ Suscripción cancelada (no más cargos)
✓ Links compartidos dejan de funcionar
✓ Colaboradores pierden acceso a tus documentos

PERÍODO DE GRACIA (14 DÍAS):
- Puedes revertir el cierre
- Datos temporalmente conservados
- Email con link de reactivación
- Después de 14 días, proceso irreversible

DESPUÉS DE 14 DÍAS:
- Eliminación permanente de:
  ✓ Todos los documentos
  ✓ Configuración de cuenta
  ✓ Historial
  ✓ Metadatos
  ✓ Backups
- Proceso toma 30 días adicionales

TOTAL: 14 días reversible + 30 días eliminación = 44 días

EXCEPCIÓN:
Si tienes deuda pendiente, cuenta se congela pero no se elimina hasta que se resuelva.

EXPORTACIÓN DE DATOS

ANTES DE ELIMINAR:

EXPORTAR TODO:
1. Configuración > Privacidad > Exportar datos
2. Selecciona qué incluir:
   ☑ Documentos
   ☑ Comentarios
   ☑ Configuración
   ☑ Historial de actividad
3. Formato: JSON, Markdown, o PDF
4. Click "Solicitar exportación"

PROCESAMIENTO:
- Pequeñas cuentas (<100 docs): 10-30 minutos
- Cuentas medianas: 1-4 horas
- Cuentas grandes: Hasta 48 horas

DESCARGA:
- Email con link de descarga
- Link válido por 7 días
- Archivo ZIP cifrado (password en email separado)
- Tamaño variable según tus datos

CONTENIDO DEL ZIP:

/documents
  - doc1.md
  - doc2.md
  /attachments
    - image1.png
/metadata
  - account_info.json
  - activity_log.json
/settings
  - preferences.json


LEGAL HOLDS (RETENCIÓN LEGAL)

¿QUÉ ES?
Cuando tu organización está involucrada en litigio, auditoría, o investigación, ciertos datos deben preservarse indefinidamente.

CÓMO ACTIVAR:
1. Solo Enterprise
2. Contacta legal@techcorp.com
3. Proporciona:
   - Orden judicial o requerimiento legal
   - Scope de datos a preservar
   - Duración estimada del hold
4. TechCorp activa hold

QUÉ SUCEDE:
- Datos especificados NO se pueden eliminar
- Ni por usuario ni automáticamente
- Backups se conservan indefinidamente
- Flags especiales en metadata

DESACTIVAR:
- Solo cuando concluye proceso legal
- Requiere autorización de legal counsel
- Documentación formal necesaria

CUMPLIMIENTO Y REGULACIONES

GDPR (Europa):
- Derecho al olvido: Elimina datos bajo petición
- Portabilidad: Exportación en formato legible
- Retención mínima: Solo lo necesario
- TechCorp cumple completamente

CCPA (California):
- Derecho a saber qué datos tenemos
- Derecho a eliminación
- No vendemos datos personales

HIPAA (Salud, USA):
- Enterprise puede ser HIPAA-compliant
- Retención extendida de auditorías
- Procedimientos de eliminación segura

SOC 2:
- Auditorías anuales de procedimientos
- Verificación de eliminación segura
- Reportes disponibles bajo NDA

ELIMINACIÓN SEGURA

MÉTODO:
- Sobrescritura múltiple (algoritmo DoD 5220.22-M)
- Desmagnetización de medios físicos retirados
- Destrucción física de hardware al final de vida
- Certificado de destrucción disponible (Enterprise)

VERIFICACIÓN:
- Checks automáticos post-eliminación
- Logs de auditoría

- Compliance con estándares de industria

PREGUNTAS FRECUENTES

P: ¿Puedo recuperar documento después de 30 días?
R: Solo si está en nuestros backups. Contacta soporte. Depende de tu plan.

P: ¿Eliminan mis datos si dejo de pagar?
R: Después de período de gracia (30 días) y proceso de cuenta inactiva (ver arriba).

P: ¿Pueden empleados de TechCorp ver mis documentos eliminados?
R: Solo con autorización legal o si solicitas recuperación. Nunca para otros fines.

P: ¿Se eliminan documentos compartidos si quien los compartió cierra cuenta?
R: Sí, si el propietario elimina su cuenta, documentos se eliminan para todos.

P: ¿Cómo sé que mis datos realmente se eliminaron?
R: Logs de auditoría disponibles. Enterprise puede solicitar certificado de eliminación.

CONTACTO

SOPORTE GENERAL:
- Email: support@techcorp.com

RECUPERACIÓN DE DATOS:
- Email: recovery@techcorp.com

LEGAL Y COMPLIANCE:
- Email: legal@techcorp.com

PRIVACIDAD:
- Email: privacy@techcorp.com

Última actualización: Enero 2025
Próxima revisión: Julio 2025`,
      categoriasNombres: ["Políticas de la empresa"]
   },
   {
      titulo: "Solución de problemas de sincronización",
      contenido: `GUÍA DE SOLUCIÓN DE PROBLEMAS DE SINCRONIZACIÓN
TechCorp Solutions | Troubleshooting | Enero 2025

INTRODUCCIÓN

La sincronización permite que tus datos estén actualizados en todos tus dispositivos en tiempo real. Si experimentas problemas de sincronización, esta guía te ayudará a identificar y resolver el problema rápidamente.

SÍNTOMAS COMUNES

IDENTIFICAR PROBLEMA DE SINCRONIZACIÓN:

❌ Cambios en un dispositivo no aparecen en otro
❌ Documento muestra contenido diferente en cada dispositivo
❌ Indicador de "Sincronizando..." permanece por mucho tiempo
❌ Mensaje de error "Error al sincronizar"
❌ Documentos nuevos no aparecen en todos los dispositivos
❌ Modificaciones recientes se "revierten" solas

CAUSAS COMUNES:
- Conexión a internet intermitente o lenta
- Versión desactualizada de aplicación
- Problemas de sesión/autenticación
- Conflictos de edición simultánea
- Cache corrupto
- Límites de plan alcanzados

SOLUCIONES RÁPIDAS (5 MINUTOS)

PASO 1: VERIFICAR CONEXIÓN A INTERNET

EN COMPUTADORA:
1. Abre navegador
2. Visita google.com o speedtest.net
3. Si no carga, problema es tu internet (no TechCorp)

SOLUCIÓN SI NO HAY INTERNET:
- Reinicia router (desenchufar 30 segundos, volver a enchufar)
- Verifica cables
- Contacta proveedor de internet si persiste

EN MÓVIL:
- Verifica ícono de WiFi o datos móviles en barra superior
- Activa/desactiva modo avión
- Intenta cambiar de WiFi a datos o viceversa

REQUISITOS MÍNIMOS:
- Velocidad download: 2 Mbps
- Velocidad upload: 1 Mbps
- Latencia: <300ms

TEST:
- Speedtest.net o fast.com
- Si velocidad es muy baja, problema es tu conexión

PASO 2: REFRESCAR APLICACIÓN

EN WEB (Navegador):
- Presiona F5 (Windows/Linux)
- O Cmd + R (Mac)
- O click en botón de refrescar del navegador

EN APP MÓVIL:
- iOS: Desliza hacia abajo en lista de documentos (pull to refresh)
- Android: Botón de refrescar o pull to refresh
- O cierra app completamente y vuelve a abrir

BENEFICIO:
Fuerza una nueva sincronización inmediata.

PASO 3: VERIFICAR VERSIÓN DE APLICACIÓN

NAVEGADOR WEB:
- Siempre usa última versión automáticamente
- Limpia cache: Ctrl+Shift+Delete > Borrar caché
- Reinicia navegador

APP MÓVIL:

iOS (iPhone/iPad):
1. App Store > Tu perfil (arriba derecha)
2. Scroll hasta "Actualizaciones disponibles"
3. Si TechCorp aparece, toca "Actualizar"
4. O toca "Actualizar todo"

Android:
1. Play Store > Menú ☰ > Mis aplicaciones y juegos
2. Pestaña "Actualizaciones"
3. Si TechCorp aparece, toca "Actualizar"

VERSIÓN ACTUAL:
- iOS: v2.5.1+
- Android: v2.5.0+
- Web: Automática (siempre última)

PASO 4: CERRAR SESIÓN Y VOLVER A INICIARLA

IMPORTANTE: Esto resuelve mayoría de problemas de sincronización.

EN CUALQUIER DISPOSITIVO:
1. Click en tu perfil (esquina superior)
2. "Cerrar sesión"
3. Espera 10 segundos
4. Vuelve a iniciar sesión
5. Espera 1-2 minutos para sincronización inicial

QUÉ HACE:
- Limpia tokens de autenticación obsoletos
- Fuerza resincronización completa
- Restablece estado de sesión

ADVERTENCIA:
Si tienes cambios no guardados, se perderán. Guarda antes de cerrar sesión.

PASO 5: ESPERAR Y VERIFICAR

A VECES SOLO TOMA TIEMPO:
- Sincronización normal: 2-10 segundos
- Documentos grandes (>1MB): Hasta 30 segundos
- Muchos documentos: Hasta 2 minutos
- Conexión lenta: Puede tardar más

INDICADORES DE SINCRONIZACIÓN:
- 🔄 Ícono girando: Sincronizando
- ✅ Check verde: Sincronización completa
- ⚠️ Advertencia: Posible problema
- ❌ Error: Fallo de sincronización

VERIFICAR SINCRONIZACIÓN:
1. Haz pequeño cambio en un dispositivo (agrega palabra "TEST")
2. Guarda cambio (Ctrl+S o auto-guarda)
3. Espera 10-30 segundos
4. Abre mismo documento en otro dispositivo
5. Si aparece "TEST", sincronización funciona

SOLUCIONES INTERMEDIAS (10-15 MINUTOS)

PASO 6: LIMPIAR CACHE Y DATOS

NAVEGADOR WEB:

Chrome/Edge:
1. Ctrl+Shift+Delete (o Cmd+Shift+Delete en Mac)
2. Selecciona "Imágenes y archivos en caché"
3. Rango de tiempo: "Todo"
4. Click "Borrar datos"
5. Reinicia navegador
6. Inicia sesión nuevamente en TechCorp

Firefox:
1. Ctrl+Shift+Delete
2. Selecciona "Caché"
3. "Intervalo a borrar": "Todo"
4. Aceptar
5. Reinicia Firefox

Safari (Mac):
1. Safari > Preferencias > Avanzado
2. Marca "Mostrar menú Desarrollo"
3. Menú Desarrollo > Vaciar cachés
4. O: Preferencias > Privacidad > Gestionar datos de sitios > Eliminar todo

APP MÓVIL:

iOS:
1. Ajustes > General > Almacenamiento del iPhone
2. Busca TechCorp
3. "Descargar app" (conserva datos)
4. Reinstala desde App Store
5. Inicia sesión

Android:
1. Ajustes > Aplicaciones > TechCorp
2. Almacenamiento > Borrar caché
3. NO toques "Borrar datos" (perderías sesión)
4. Abre TechCorp nuevamente

PASO 7: VERIFICAR LÍMITES DEL PLAN

PLAN PLUS TIENE LÍMITES:
- 5GB almacenamiento
- 3 dispositivos simultáneos

SI ALCANZASTE LÍMITE:
- Sincronización puede fallar para datos nuevos
- Documentos existentes siguen sincronizándose

VERIFICAR:
1. Configuración > Cuenta > Uso
2. Ve cuánto almacenamiento usas
3. Ve cuántos dispositivos conectados

SOLUCIONES:
- Elimina documentos viejos
- Cierra sesión en dispositivos no usados
- Upgrade a Premium (ilimitado)

PASO 8: BUSCAR CONFLICTOS

CONFLICTO DE EDICIÓN:

QUÉ ES:
Editaste mismo documento en 2 dispositivos a la vez sin conexión.

CÓMO DETECTAR:
- Documento muestra banner "Conflicto detectado"
- O aparecen 2 versiones del documento

RESOLVER:
1. TechCorp crea versión "Conflicto - [Fecha]"
2. Abre ambas versiones
3. Compara diferencias
4. Copia contenido que deseas conservar a versión principal
5. Elimina versión de conflicto

PREVENIR:
- Trabaja online siempre que sea posible
- Si trabajas offline, sincroniza antes de cambiar de dispositivo
- Evita editar mismo documento en múltiples dispositivos simultáneamente

PASO 9: VERIFICAR ESTADO DEL SISTEMA

TAL VEZ NO ES TU PROBLEMA:

STATUS PAGE:
- Visita: status.techcorp.com
- Ve si hay incidentes activos
- Verde = Todo funciona
- Amarillo/Rojo = Problemas en TechCorp

SI HAY INCIDENTE:
- Suscríbete a actualizaciones
- Espera a que resuelvan
- Tu sincronización se restaurará automáticamente

REDES SOCIALES:
- Twitter: @TechCorpStatus
- Anuncios de downtime e interrupciones

SOLUCIONES AVANZADAS (20-30 MINUTOS)

PASO 10: MODO OFFLINE Y RESINCRONIZACIÓN

FORZAR MODO OFFLINE Y VOLVER ONLINE:

ESCRITORIO:
1. Desconecta WiFi/Ethernet
2. Espera 30 segundos
3. Reconecta
4. TechCorp detectará conexión y resincronizará

MÓVIL:
1. Activa modo avión
2. Espera 30 segundos
3. Desactiva modo avión
4. Abre TechCorp

ESTO HACE:
- Resetea estado de conexión
- Fuerza reconexión
- Inicia resincronización completa

PASO 11: REINSTALAR APLICACIÓN

MÓVIL (ÚLTIMO RECURSO):

iOS:
1. Exporta datos importantes (Configuración > Exportar)
2. Mantén presionado ícono TechCorp
3. "Eliminar app"
4. App Store > Busca TechCorp
5. Instala
6. Inicia sesión
7. Espera sincronización completa (puede tardar varios minutos)

Android:
1. Exporta datos importantes
2. Ajustes > Aplicaciones > TechCorp > Desinstalar
3. Play Store > TechCorp > Instalar
4. Inicia sesión
5. Espera sincronización

ADVERTENCIA:
- Perderás datos que no estaban sincronizados
- Perderás configuración local
- Solo como último recurso

PASO 12: VERIFICAR FIREWALL/VPN

CORPORATIVO:
Si usas computadora de trabajo, firewall puede bloquear sincronización.

VERIFICAR:
1. Intenta en red personal/casa
2. Si funciona ahí, problema es red corporativa

SOLUCIÓN:
- Contacta IT de tu empresa
- Pide que permitan *.techcorp.com
- Puertos necesarios: 443 (HTTPS), 80 (HTTP)

VPN:
- Algunas VPNs ralentizan o bloquean sincronización
- Intenta desactivar VPN temporalmente
- Si funciona sin VPN, configura VPN para split-tunneling
- Excluye techcorp.com de VPN

SITUACIONES ESPECÍFICAS

PROBLEMA: "Documento desapareció de un dispositivo"

CAUSAS POSIBLES:
- Fue eliminado (check papelera)
- Filtros aplicados ocultándolo
- Problema de sincronización temporal

SOLUCIÓN:
1. Busca documento por nombre en barra de búsqueda
2. Revisa papelera
3. Quita todos los filtros (categorías, fecha, etc.)
4. Si está en otro dispositivo, espera sincronización
5. Contacta soporte si no aparece

PROBLEMA: "Cambios más recientes se perdieron"

VERSIONES:
1. Abre documento
2. Click "Historial de versiones" (si disponible en tu plan)
3. Busca versión con tus cambios
4. Restaura esa versión

SI NO TIENES HISTORIAL:
- Premium y Enterprise tienen versiones ilimitadas
- Plus tiene versiones limitadas
- Upgrade para acceso completo

PROBLEMA: "Error: No se pudo guardar"

CAUSAS:
- Sin conexión al momento de guardar
- Límite de almacenamiento alcanzado
- Documento corrupto

SOLUCIÓN:
1. Copia contenido del documento
2. Crea documento nuevo
3. Pega contenido
4. Guarda nuevo documento
5. Elimina el problemático si ya no sirve

PROBLEMA: "Sincronización infinita"

SI INDICA "Sincronizando..." POR >5 MINUTOS:
1. Cancela operación (X en indicador)
2. Cierra sesión
3. Espera 1 minuto
4. Inicia sesión
5. Espera nueva sincronización

SI PERSISTE:
- Puede ser documento muy grande
- Conexión muy lenta
- Contacta soporte con detalles

PREVENCIÓN

MEJORES PRÁCTICAS:

1. CONEXIÓN ESTABLE:
   - Trabaja con WiFi estable cuando sea posible
   - Evita cambiar de dispositivo con documento abierto

2. GUARDA FRECUENTEMENTE:
   - Aunque hay auto-guardado, guarda manualmente (Ctrl+S)
   - Especialmente antes de cerrar o cambiar de dispositivo

3. SINCRONIZACIÓN MANUAL:
   - Usa botón "Sincronizar ahora" antes de cerrar
   - Espera confirmación "Sincronizado"

4. MODO OFFLINE:
   - Si trabajas sin internet, activa modo offline conscientemente
   - Sincroniza cuando vuelvas online

5. ACTUALIZACIONES:
   - Mantén apps actualizadas
   - Acepta actualizaciones cuando se ofrecen

6. DISPOSITIVOS LIMITADOS:
   - Si tienes Plan Plus (3 dispositivos), no excedas límite
   - Cierra sesión en dispositivos no usados

MONITOREO

PANEL DE ESTADO DE SINCRONIZACIÓN:

ACCESO:
Configuración > Avanzado > Estado de sincronización

MUESTRA:
- Última sincronización exitosa: Fecha/hora
- Próxima sincronización programada
- Documentos pendientes de sincronizar
- Errores recientes

ALERTAS:
Activa notificaciones de:
- Sincronización fallida
- Conflictos detectados
- Límites alcanzados

CONTACTAR SOPORTE

SI NADA FUNCIONA:

INFORMACIÓN A PROPORCIONAR:
- Descripción detallada del problema
- ¿Cuándo comenzó?
- ¿En qué dispositivo(s)?
- Sistema operativo y versión
- Versión de app/navegador
- Capturas de pantalla de errores
- Pasos que ya intentaste

CANALES:
- Email: support@techcorp.com
- Chat en vivo: app.techcorp.com (botón esquina inferior derecha)
- Teléfono (Premium/Enterprise): En tu panel de soporte

PRIORIDAD:
- Plus: 24 horas respuesta
- Premium: 4 horas respuesta
- Enterprise: 1 hora respuesta

RESPUESTA TÍPICA:
- Confirmación: Inmediata
- Diagnóstico inicial: 1-2 horas
- Resolución: Según complejidad

PREGUNTAS FRECUENTES

P: ¿Por qué algunos documentos sincronizan y otros no?
R: Puede ser por tamaño (grandes tardan más), límites de plan, o problema específico del documento. Intenta soluciones en esta guía.

P: ¿Puedo forzar sincronización inmediata?
R: Sí, botón "Sincronizar ahora" en barra inferior (o refrescar página en web).

P: ¿Sincronización consume muchos datos móviles?
R: Documentos de texto usan mínimos datos. Imágenes/PDFs usan más. Configura "Solo WiFi" en ajustes si te preocupan datos.

P: ¿Qué pasa si edito offline?
R: Cambios se guardan localmente y sincronizan cuando vuelva internet.

P: ¿Cuánto tiempo tarda sincronización inicial?
R: Depende de cuántos documentos tienes. Típicamente 1-5 minutos. Con cientos de documentos, hasta 15 minutos.

RECURSOS ADICIONALES

DOCUMENTACIÓN:
- help.techcorp.com/sync-issues
- academy.techcorp.com/troubleshooting

VIDEOS:
- "Resolving Sync Issues" (5 min)
- "Understanding TechCorp Sync" (10 min)

COMUNIDAD:
- Forum: community.techcorp.com
- Pregunta a otros usuarios

Última actualización: Enero 2025`,
      categoriasNombres: ["Soporte técnico"]
   },
   {
      titulo: "Guía de exportación de datos personales",
      contenido: `GUÍA DE EXPORTACIÓN DE DATOS PERSONALES
TechCorp Solutions | Privacidad y Portabilidad | Enero 2025

INTRODUCCIÓN

Bajo regulaciones como GDPR y CCPA, tienes el derecho fundamental a exportar todos tus datos personales en cualquier momento. Esta guía explica cómo ejercer ese derecho en TechCorp y qué esperar del proceso.

TU DERECHO A TUS DATOS

REGULACIONES QUE LO GARANTIZAN:

GDPR (Unión Europea):
- Artículo 20: Derecho a la portabilidad de datos
- Artículo 15: Derecho de acceso
- Formato estructurado, de uso común, y legible por máquina

CCPA (California):
- Derecho a saber qué información recopilamos
- Derecho a recibir copia de tus datos
- Sin costo, hasta 2 veces por año

OTRAS JURISDICCIONES:
- PIPEDA (Canadá)
- LGPD (Brasil)
- POPIA (Sudáfrica)

TechCorp cumple todas estas regulaciones y más.

RAZONES PARA EXPORTAR

CASOS DE USO COMUNES:

1. MIGRACIÓN A OTRA PLATAFORMA:
   - Cambias a competidor
   - Llevas tus datos contigo
   - No pierdes tu trabajo

2. BACKUP PERSONAL:
   - Copia de seguridad adicional
   - Tranquilidad extra
   - Acceso offline a tus datos

3. COMPLIANCE/AUDITORÍA:
   - Requieres evidencia para auditoría
   - Documentación para compliance
   - Registro histórico

4. CANCELACIÓN DE CUENTA:
   - Antes de cerrar cuenta
   - Conservar copia permanente
   - Requerido por algunas empresas

5. ANÁLISIS PERSONAL:
   - Revisar tu historial
   - Analítica de productividad
   - Cuantificar tu trabajo

6. LEGAL:
   - Evidencia para litigio
   - Respuesta a subpoena
   - Protección de derechos

PROCESO DE EXPORTACIÓN

PASO 1: SOLICITAR EXPORTACIÓN

ACCESO:
1. Inicia sesión en app.techcorp.com
2. Click en tu perfil (esquina superior derecha)
3. Configuración > Privacidad
4. Sección "Mis datos"
5. Botón "Exportar datos"

OPCIONES:

¿QUÉ INCLUIR?
☑ Documentos (recomendado)
☑ Comentarios y colaboraciones
☑ Historial de versiones
☑ Metadatos de documentos
☑ Información de cuenta
☑ Configuración y preferencias
☑ Historial de actividad
☑ Logs de acceso
☐ Datos de facturación (opcional, sensible)

FORMATOS DISPONIBLES:

MARKDOWN (.md):
- Fácil de leer y editar
- Portable entre plataformas
- Mantiene formato básico
- Tamaño: Mediano
- Recomendado para: Migración, lectura

JSON:
- Formato estructurado
- Incluye todos los metadatos
- Fácil de procesar programáticamente
- Tamaño: Grande
- Recomendado para: Análisis, desarrollo, migración técnica

PDF:
- Formato visual
- Difícil de editar (intencional)
- Ideal para archivo permanente
- Tamaño: Grande
- Recomendado para: Archivo legal, presentación

HTML:
- Navegable en navegador
- Incluye estructura y links internos
- Formato visualmente agradable
- Tamaño: Mediano-Grande
- Recomendado para: Revisión, archivo

PLAIN TEXT (.txt):
- Máxima compatibilidad
- Sin formato
- Tamaño más pequeño
- Recomendado para: Máxima portabilidad

RECOMENDACIÓN:
- Uso general: JSON + PDF
- Solo migración: Markdown o JSON
- Solo archivo: PDF

CIFRADO:
☑ Cifrar exportación con contraseña

RECOMENDAMOS SIEMPRE CIFRAR:
- Protección en tránsito
- Protección si email comprometido
- Contraseña separada del email de descarga

PASO 2: CONFIRMACIÓN

VERIFICACIÓN:
- Por seguridad, se envía email de confirmación
- Click en link para confirmar que fuiste tú
- Válido por 24 horas
- Si no confirmas, solicitud expira (puedes crear nueva)

RAZÓN:
Prevenir que alguien con acceso a tu sesión exporte tus datos sin tu conocimiento.

PASO 3: PROCESAMIENTO

TIEMPO DE PROCESAMIENTO:

DEPENDE DE:
- Cantidad de documentos
- Tamaño total de datos
- Formatos seleccionados
- Carga actual del servidor

ESTIMACIONES:
- Cuentas pequeñas (<50 docs, <100MB): 5-15 minutos
- Cuentas medianas (50-500 docs, 100MB-1GB): 30 minutos - 2 horas
- Cuentas grandes (500-5000 docs, 1-10GB): 2-8 horas
- Cuentas muy grandes (>5000 docs, >10GB): Hasta 48 horas

ESTADO:
- Email de confirmación: "Procesando tu exportación..."
- Progreso visible en: Configuración > Privacidad > "Exportación en progreso"
- Barra de progreso muestra avance

PRIORIDAD POR PLAN:
- Enterprise: Procesamiento prioritario (más rápido)
- Premium: Prioridad media
- Plus: Procesamiento estándar

PASO 4: DESCARGA

NOTIFICACIÓN:
Email a tu dirección registrada:
- Asunto: "Tu exportación de datos está lista"
- Link de descarga (válido 7 días)
- Contraseña de cifrado (si elegiste cifrar) en email SEPARADO

DESCARGA:
1. Click en link del email
2. Página de descarga
3. Botón "Descargar" (archivo ZIP)
4. Guarda en ubicación segura
5. Si cifrado: Usa contraseña del segundo email

TAMAÑO:
Varía según tus datos. Ejemplos:
- 100 docs de texto: ~5MB
- 500 docs + imágenes: ~100MB
- 5000 docs + archivos: ~1-5GB

VELOCIDAD:
Depende de tu conexión de internet. Descarga desde CDN rápido.

CADUCIDAD:
- Link válido por 7 días
- Después se elimina por seguridad
- Puedes solicitar nueva exportación en cualquier momento

CONTENIDO DE LA EXPORTACIÓN

ESTRUCTURA DEL ARCHIVO ZIP:


techcorp_export_2025-01-15/
  ├── README.txt              (Cómo usar esta exportación)
  ├── documents/
  │   ├── document_001.md
  │   ├── document_002.md
  │   ├── ...
  │   └── attachments/
  │       ├── image_001.png
  │       └── file_002.pdf
  ├── metadata/
  │   ├── documents_index.json
  │   ├── categories.json
  │   ├── tags.json
  │   └── collaborations.json
  ├── account/
  │   ├── profile.json
  │   ├── settings.json
  │   └── subscription.json
  ├── activity/
  │   ├── activity_log.json
  │   ├── access_log.json
  │   └── changes_history.json
  └── billing/              (si seleccionado)
      ├── invoices.pdf
      └── payment_history.json


ARCHIVOS CLAVE:

README.txt:
- Explica contenido de exportación
- Cómo importar a otras plataformas
- Información de contacto si tienes preguntas

documents_index.json:

{
  "documents": [
    {
      "id": "doc_abc123",
      "title": "Mi documento",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-10-15T14:22:00Z",
      "categories": ["FAQ", "Soporte"],
      "file_path": "documents/document_001.md",
      "word_count": 1250,
      "character_count": 7842
    }
  ]
}


profile.json:

{
  "user_id": "usr_xyz789",
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "account_created": "2023-05-01T08:00:00Z",
  "plan": "premium",
  "preferences": {
    "language": "es",
    "timezone": "America/Mexico_City"
  }
}


activity_log.json:
- Log completo de actividad
- Cada acción con timestamp
- IP y dispositivo (si habilitado en privacidad)

USAR LA EXPORTACIÓN

REVISAR DATOS:

DOCUMENTOS (Markdown/HTML):
- Abre con editor de texto o navegador
- Estructura legible
- Links internos funcionales (en HTML)

METADATOS (JSON):
- Abre con editor de texto o JSON viewer
- O importa a herramienta de análisis
- Procesable programáticamente

ANÁLISIS:
Ejemplo Python:
import json

# Cargar índice de documentos
with open('metadata/documents_index.json') as f:
    docs = json.load(f)

# Analizar
total_words = sum(d['word_count'] for d in docs['documents'])
print(f"Total palabras: {total_words}")


MIGRAR A OTRA PLATAFORMA:

IMPORTAR A NOTION:
1. Notion > Settings > Import
2. Selecciona "Markdown"
3. Sube carpeta /documents
4. Notion importa automáticamente

IMPORTAR A EVERNOTE:
1. Evernote > File > Import
2. Selecciona archivos .md
3. Elige libreta destino

IMPORTAR A GOOGLE DOCS:
1. Google Drive > New > File upload
2. Sube documentos
3. Click derecho > "Abrir con Google Docs"
4. Se convierte automáticamente

OTRAS PLATAFORMAS:
- La mayoría soporta Markdown o HTML
- Consulta documentación de plataforma destino
- Contacta soporte de esa plataforma para asistencia

SEGURIDAD

PROTEGER TU EXPORTACIÓN:

DESCIFRAR (SI CIFRASTE):

# En terminal (Linux/Mac):
unzip -P tu_contraseña export.zip

# Windows:
- Click derecho > Extraer
- Ingresa contraseña cuando se solicite


MEJORES PRÁCTICAS:

1. ALMACENAMIENTO SEGURO:
   - NO dejes en carpeta de Descargas
   - Mueve a ubicación segura
   - Considera disco externo cifrado

2. BACKUP:
   - Guarda copia en múltiples ubicaciones
   - Cloud personal cifrado (Google Drive, Dropbox con cifrado)
   - Disco externo físico

3. DESTRUCCIÓN:
   - Cuando ya no necesites, elimina de forma segura
   - No solo "Delete" - usa herramienta de borrado seguro
   - Windows: Shift+Delete
   - Mac: Secure Empty Trash
   - O herramientas como Eraser, BleachBit

4. COMPARTIR:
   - NO compartas por email no cifrado
   - Usa servicios de transferencia segura
   - O entrega física en dispositivo cifrado

LIMITACIONES Y CONSIDERACIONES

QUÉ NO SE INCLUYE:

- Documentos compartidos CONTIGO (solo los que TÚ creaste)
  * Razón: No son tus datos, son de quien los creó
  * Solución: Exporta esos documentos individualmente antes

- Chats con IA (si usas funciones de IA)
  * Incluido: Tus prompts
  * NO incluido: Respuestas del modelo (son generadas dinámicamente)

- Datos de otros usuarios
  * Incluso si colaboraron en tus documentos
  * Solo se incluye que colaboraron, no sus perfiles completos

- Tokens de API activos
  * Por seguridad, no se exportan
  * Debes regenerar en nueva plataforma

FRECUENCIA:

LÍMITES:
- Plan Plus: 2 exportaciones por mes
- Plan Premium: 10 exportaciones por mes
- Plan Enterprise: Ilimitadas

¿POR QUÉ LÍMITES?
- Proceso consume recursos del servidor
- Prevenir abuso
- Suficiente para uso legítimo

SI NECESITAS MÁS:
- Upgrade temporalmente
- O contacta soporte para excepción

PREGUNTAS FRECUENTES

P: ¿Cuánto cuesta exportar mis datos?
R: Gratis. Es tu derecho legal.

P: ¿Se notifica a mi organización (si cuenta Enterprise)?
R: NO. Es tu derecho personal. Admin no puede bloquear o monitorear.

P: ¿Puedo automatizar exportaciones periódicas?
R: No directamente, pero Enterprise con API puede scriptearlo.

P: ¿Qué formato es mejor para guardar a largo plazo?
R: PDF para documentos finales. JSON para máxima fidelidad de metadatos.

P: ¿Exportar elimina mis datos de TechCorp?
R: NO. Solo crea una copia. Tus datos siguen en la plataforma.

P: ¿Puedo exportar datos de un solo documento?
R: Sí, desde el documento: Menu > Exportar > Formato deseado.

P: ¿Los links internos entre documentos se preservan?
R: En formato HTML sí (relativos). En Markdown como referencias. En PDF no (formato estático).

P: ¿Se incluyen versiones anteriores de documentos?
R: Solo si seleccionaste "Historial de versiones" en opciones de exportación.

ESCENARIOS ESPECIALES

USUARIO FALLECIDO:

FAMILIA PUEDE SOLICITAR:
1. Contacta: legal@techcorp.com
2. Proporciona certificado de defunción
3. Prueba de relación (testamento, certificado familiar)
4. Procesamos en 15 días hábiles
5. Exportación entregada a representante legal

CUENTA CORPORATIVA:

CUANDO EMPLEADO DEJA EMPRESA:
- Empleado puede exportar SUS datos personales
- Documentos de empresa permanecen en cuenta corporativa
- Clarifica antes de partir qué es tuyo vs de empresa

CUENTA SUSPENDIDA:

SI FUISTE SUSPENDIDO:
- AÚN tienes derecho a tus datos
- Contacta: support@techcorp.com
- Solicitaremos exportación en tu nombre
- Entregada por email

MÚLTIPLES CUENTAS:

SI TIENES VARIAS CUENTAS:
- Exporta cada una por separado
- No hay forma de consolidar automáticamente
- Combina manualmente después

CONTACTO

PREGUNTAS SOBRE EXPORTACIÓN:
- Email: privacy@techcorp.com
- Respuesta en 48 horas

PROBLEMAS TÉCNICOS:
- Email: support@techcorp.com
- Chat en vivo

CUESTIONES LEGALES/COMPLIANCE:
- Email: legal@techcorp.com
- DPO (Data Protection Officer): dpo@techcorp.com

RECURSOS ADICIONALES

DOCUMENTACIÓN:
- help.techcorp.com/data-export
- privacy.techcorp.com (Política de privacidad completa)

TEMPLATES DE IMPORTACIÓN:
- Scripts de ejemplo: github.com/techcorp/import-tools
- Guías de migración por plataforma

WEBINARS:
- "Understanding Your Data Rights" (mensual)
- "Migrating from TechCorp to [Platform]" (varios)

Última actualización: Enero 2025
Basado en: GDPR, CCPA, y mejores prácticas de privacidad`,
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
      console.log("📄 Creando documentos de prueba y cargándolos al RAG...");

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

         for (let j = 0; j < 9; j++) {
            const docData = documentosTest[docIndex];

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

            // Crear documento usando el servicio (que incluye envío al RAG)
            try {
               const nuevoDocumento = await documentoService.createDocumento({
                  titulo: docData.titulo,
                  categorias: categoriasIds,
                  contenido: docData.contenido,
                  usuario: usuario._id
               });

               documentosCreados.push(nuevoDocumento);
               console.log(`✅ Documento creado y enviado al RAG: "${docData.titulo}" para ${usuario.email}`);
            } catch (error) {
               // Si el documento ya existe, lo informamos pero continuamos
               if (error.message && error.message.includes('duplicate')) {
                  console.log(`⚠️  Documento "${docData.titulo}" ya existe, se omite`);
               } else {
                  console.error(`❌ Error al crear documento "${docData.titulo}":`, error.message);
               }
            }

            docIndex++;
         }
      }

      console.log(`\n✅ Total de documentos creados y enviados al RAG: ${documentosCreados.length}`);
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
   let redisClient = null;
   try {
      // Conectar a MongoDB
      console.log("🔌 Conectando a MongoDB...");
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ Conexión exitosa a MongoDB");

      // Conectar a Redis (necesario para documento-service)
      console.log("🔌 Conectando a Redis...");
      redisClient = await connectRedis();
      console.log("✅ Conexión exitosa a Redis\n");

      // Ejecutar carga de datos
      await crearPlanes();
      const usuarios = await crearUsuarios();
      await crearDocumentos(usuarios);

      console.log("\n🎉 ¡Carga de datos de prueba completada exitosamente!");
      console.log("\n📊 Resumen:");
      console.log("   - Usuarios creados: 3");
      console.log("   - Documentos creados: 27 (9 por usuario)");
      console.log("   - Documentos enviados al RAG: ✅");
      console.log("   - Planes: Plus y Premium");
      console.log("\n👤 Credenciales de prueba:");
      usuariosTest.forEach(u => {
         console.log(`   - ${u.email} / ${u.password} (${u.tipoPlan})`);
      });

   } catch (error) {
      console.error("\n❌ Error durante la carga de datos:", error);
      process.exit(1);
   } finally {
      // Cerrar conexiones
      if (redisClient) {
         await redisClient.quit();
         console.log("\n🔌 Conexión a Redis cerrada");
      }
      await mongoose.connection.close();
      console.log("🔌 Conexión a MongoDB cerrada");
   }
}

// Ejecutar script
cargarDatosTest();

