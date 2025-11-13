const PDF_EXTRACTION_ERRORS = {
    INVALID: 'El archivo PDF está corrupto o no es válido',
    PROTECTED: 'El PDF está protegido con contraseña y no se puede extraer el texto',
    NO_TEXT: 'El PDF no contiene texto seleccionable. Puede contener solo imágenes o estar protegido.',
};

let PdfParserClass = null;

const loadPdfParser = async () => {
    if (!PdfParserClass) {
        try {
            const pdf2jsonModule = await import('pdf2json');
            const candidate = pdf2jsonModule?.default ?? pdf2jsonModule;

            // pdf2json puede exportar la clase directamente o dentro de PDFParser
            PdfParserClass = candidate?.PDFParser ?? candidate;

            if (typeof PdfParserClass !== 'function') {
                throw new Error('La clase PDFParser no está disponible en pdf2json');
            }
        } catch (error) {
            throw new Error(`No se pudo cargar pdf2json: ${error.message}`);
        }
    }

    return PdfParserClass;
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

            const isPDF = mimeType === 'application/pdf' || extension === '.pdf';
            const isTXT = mimeType === 'text/plain' || extension === '.txt';

            if (isPDF) {
                return await this.extractTextFromPDF(file.buffer);
            }

            if (isTXT) {
                return this.extractTextFromTXT(file.buffer);
            }

            throw new Error('Tipo de archivo no soportado para extracción de texto');
        } catch (error) {
            if (error.message.includes('PDF') || error.message.includes('corrupto') || error.message.includes('contraseña')) {
                throw error;
            }

            throw new Error(`Error al extraer texto del archivo: ${error.message}`);
        }
    },

    /**
     * Extrae texto de un archivo PDF usando pdf2json
     * @param {Buffer} buffer - Buffer del archivo PDF
     * @returns {Promise<string>} Texto extraído del PDF
     */
    async extractTextFromPDF(buffer) {
        try {
            const PDFParser = await loadPdfParser();

            return await new Promise((resolve, reject) => {
                try {
                    const parser = new PDFParser();

                    parser.on('pdfParser_dataError', (errData = {}) => {
                        const message = errData?.parserError?.message ?? errData?.message ?? '';

                        if (message.toLowerCase().includes('password') || message.toLowerCase().includes('encrypted')) {
                            reject(new Error(PDF_EXTRACTION_ERRORS.PROTECTED));
                            return;
                        }

                        reject(new Error(`${PDF_EXTRACTION_ERRORS.INVALID}: ${message}`.trim()));
                    });

                    parser.on('pdfParser_dataReady', () => {
                        try {
                            const rawText = parser.getRawTextContent();
                            const text = rawText ? rawText.trim() : '';

                            if (!text) {
                                reject(new Error(PDF_EXTRACTION_ERRORS.NO_TEXT));
                                return;
                            }

                            resolve(text);
                        } catch (innerError) {
                            reject(new Error(`${PDF_EXTRACTION_ERRORS.INVALID}: ${innerError.message}`));
                        }
                    });

                    parser.parseBuffer(buffer);
                } catch (parseError) {
                    reject(new Error(`${PDF_EXTRACTION_ERRORS.INVALID}: ${parseError.message}`));
                }
            });
        } catch (error) {
            if (error.message.includes(PDF_EXTRACTION_ERRORS.PROTECTED)) {
                throw new Error(PDF_EXTRACTION_ERRORS.PROTECTED);
            }

            if (error.message.includes(PDF_EXTRACTION_ERRORS.NO_TEXT)) {
                throw error;
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
            let text = buffer.toString('utf8');

            if (!text || text.includes('\uFFFD')) {
                text = buffer.toString('latin1');
            }

            const trimmedText = text.trim();

            if (!trimmedText || trimmedText.length === 0) {
                throw new Error('El archivo de texto está vacío');
            }

            return trimmedText;
        } catch (error) {
            if (error.message.includes('vacío')) {
                throw error;
            }

            throw new Error(`Error al leer el archivo de texto: ${error.message}`);
        }
    },
};

export default fileExtractionService;

