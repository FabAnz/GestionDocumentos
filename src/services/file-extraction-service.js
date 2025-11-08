// pdf-parse es un módulo CommonJS, necesitamos usar createRequire para importarlo
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');

// En pdf-parse 2.4.5, el módulo puede exportar de diferentes formas
// Crear un wrapper que maneje todas las posibilidades
const pdfParse = async (buffer, options = {}) => {
    // Si el módulo es una función directamente, usarla
    if (typeof pdfParseModule === 'function') {
        return await pdfParseModule(buffer, options);
    }
    
    // Si tiene PDFParse como clase
    if (pdfParseModule.PDFParse) {
        const PDFParseClass = pdfParseModule.PDFParse;
        try {
            // Convertir Buffer a Uint8Array si es necesario
            const uint8Array = buffer instanceof Buffer ? new Uint8Array(buffer) : buffer;
            
            // Intentar instanciar la clase
            const parser = new PDFParseClass(uint8Array, options);
            // Intentar diferentes métodos comunes
            if (typeof parser.parse === 'function') {
                return await parser.parse();
            }
            if (typeof parser.getText === 'function') {
                return await parser.getText();
            }
            if (parser.text) {
                return { text: parser.text };
            }
            // Si tiene un método estático
            if (typeof PDFParseClass.parse === 'function') {
                return await PDFParseClass.parse(uint8Array, options);
            }
        } catch (error) {
            throw new Error(`Error al procesar PDF con PDFParse: ${error.message}`);
        }
    }
    
    // Si tiene un método parse directamente en el módulo
    if (typeof pdfParseModule.parse === 'function') {
        return await pdfParseModule.parse(buffer, options);
    }
    
    // Último recurso: intentar usar el módulo como función
    if (typeof pdfParseModule === 'function') {
        return await pdfParseModule(buffer, options);
    }
    
    throw new Error('No se pudo encontrar la función de parseo en pdf-parse');
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
     * Extrae texto de un archivo PDF
     * @param {Buffer} buffer - Buffer del archivo PDF
     * @returns {Promise<string>} Texto extraído del PDF
     */
    async extractTextFromPDF(buffer) {
        try {
            const data = await pdfParse(buffer);
            const text = data.text.trim();

            if (!text || text.length === 0) {
                throw new Error('El PDF no contiene texto seleccionable. Puede contener solo imágenes o estar protegido.');
            }

            return text;
        } catch (error) {
            // Manejar errores específicos de pdf-parse
            if (error.message.includes('Invalid PDF')) {
                throw new Error('El archivo PDF está corrupto o no es válido');
            }
            if (error.message.includes('password') || error.message.includes('encrypted')) {
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

