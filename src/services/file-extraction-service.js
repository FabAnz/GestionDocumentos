// Importación dinámica de pdfjs-dist para evitar problemas en serverless
// Se carga solo cuando se necesita procesar un PDF
let pdfjsLib = null;

const loadPdfJs = async () => {
    if (!pdfjsLib) {
        try {
            // Importación dinámica de pdfjs-dist
            // Usar la ruta legacy que es más compatible con serverless
            const pdfjsModule = await import('pdfjs-dist/legacy/build/pdf.mjs');
            pdfjsLib = pdfjsModule.default || pdfjsModule;
            
            // Deshabilitar el worker en entornos serverless (Vercel)
            // Esto evita problemas con workers que no funcionan bien en serverless
            if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = '';
            }
        } catch (error) {
            console.error('Error al cargar pdfjs-dist:', error);
            throw new Error(`Error al cargar pdfjs-dist: ${error.message}. Asegúrate de que pdfjs-dist esté instalado correctamente.`);
        }
        
        if (!pdfjsLib || typeof pdfjsLib.getDocument !== 'function') {
            throw new Error('No se pudo cargar pdfjs-dist correctamente. getDocument no está disponible.');
        }
    }
    return pdfjsLib;
};

const fileExtractionService = {
    /**
     * Extrae texto de un archivo (PDF o TXT)
     * @param {Object} file - Objeto file de multer con propiedades: buffer, mimetype, originalname
     * @returns {Promise<string>} Texto extraído del archivo
     * @throws {Error} Si el archivo no es válido o no se puede extraer texto
     */
    async extractTextFromFile(file) {
        try {
            const mimeType = file.mimetype;
            const extension = file.originalname.toLowerCase().substring(
                file.originalname.lastIndexOf('.')
            );

            // Detectar tipo de archivo
            const isPDF = mimeType === 'application/pdf' || extension === '.pdf';
            const isTXT = mimeType === 'text/plain' || extension === '.txt';

            if (isPDF) {
                return await this.extractTextFromPDF(file.buffer);
            } else if (isTXT) {
                return this.extractTextFromTXT(file.buffer);
            } else {
                throw new Error('Tipo de archivo no soportado para extracción de texto');
            }
        } catch (error) {
            // Re-lanzar errores específicos de extracción
            if (error.message.includes('PDF') || error.message.includes('corrupto') || error.message.includes('contraseña')) {
                throw error;
            }
            throw new Error(`Error al extraer texto del archivo: ${error.message}`);
        }
    },

    /**
     * Extrae texto de un archivo PDF usando pdfjs-dist
     * @param {Buffer} buffer - Buffer del archivo PDF
     * @returns {Promise<string>} Texto extraído del PDF
     */
    async extractTextFromPDF(buffer) {
        try {
            // Cargar pdfjs-dist dinámicamente
            const pdfjs = await loadPdfJs();
            
            // Convertir Buffer a Uint8Array para pdfjs-dist
            const uint8Array = new Uint8Array(buffer);
            
            // Cargar el documento PDF
            const loadingTask = pdfjs.getDocument({
                data: uint8Array,
                useSystemFonts: true,
                verbosity: 0, // Reducir logs en producción
                // Deshabilitar worker explícitamente para serverless
                useWorkerFetch: false,
                isEvalSupported: false,
            });
            
            const pdf = await loadingTask.promise;
            let fullText = '';

            // Extraer texto de todas las páginas
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                
                // Concatenar el texto de la página
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ');
                
                fullText += pageText + '\n';
            }

            const text = fullText.trim();

            if (!text || text.length === 0) {
                throw new Error('El PDF no contiene texto seleccionable. Puede contener solo imágenes o estar protegido.');
            }

            return text;
        } catch (error) {
            // Manejar errores específicos de pdfjs-dist
            if (error.message.includes('Invalid PDF') || error.name === 'InvalidPDFException') {
                throw new Error('El archivo PDF está corrupto o no es válido');
            }
            if (error.message.includes('password') || error.message.includes('encrypted') || error.name === 'PasswordException') {
                throw new Error('El PDF está protegido con contraseña y no se puede extraer el texto');
            }
            if (error.message.includes('no contiene texto')) {
                throw error; // Re-lanzar error de contenido vacío
            }
            throw new Error(`Error al procesar el PDF: ${error.message}`);
        }
    },

    /**
     * Extrae texto de un archivo TXT
     * @param {Buffer} buffer - Buffer del archivo TXT
     * @returns {string} Texto extraído del TXT
     */
    extractTextFromTXT(buffer) {
        try {
            // Intentar con UTF-8 primero
            let text = buffer.toString('utf8');

            // Si el texto está vacío o tiene caracteres de reemplazo, intentar otros encodings
            if (!text || text.includes('\uFFFD')) {
                // Intentar con latin1 (ISO-8859-1)
                text = buffer.toString('latin1');
            }

            const trimmedText = text.trim();

            if (!trimmedText || trimmedText.length === 0) {
                throw new Error('El archivo de texto está vacío');
            }

            return trimmedText;
        } catch (error) {
            if (error.message.includes('vacío')) {
                throw error; // Re-lanzar error de archivo vacío
            }
            throw new Error(`Error al leer el archivo de texto: ${error.message}`);
        }
    }
};

export default fileExtractionService;

