// Polyfills para APIs del navegador necesarias para pdfjs-dist en Node.js/serverless
// Estos polyfills deben estar antes de importar pdfjs-dist
if (typeof globalThis.DOMMatrix === 'undefined') {
    // Polyfill para DOMMatrix - necesario para transformaciones de matriz en PDFs
    globalThis.DOMMatrix = class DOMMatrix {
        constructor(init) {
            if (typeof init === 'string') {
                // Parsear matriz CSS transform (ej: "matrix(1, 0, 0, 1, 0, 0)")
                const values = init.match(/matrix\(([^)]+)\)/);
                if (values) {
                    const nums = values[1].split(',').map(Number);
                    this.a = nums[0] || 1;
                    this.b = nums[1] || 0;
                    this.c = nums[2] || 0;
                    this.d = nums[3] || 1;
                    this.e = nums[4] || 0;
                    this.f = nums[5] || 0;
                } else {
                    this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
                }
            } else if (init && typeof init === 'object') {
                this.a = init.a ?? 1;
                this.b = init.b ?? 0;
                this.c = init.c ?? 0;
                this.d = init.d ?? 1;
                this.e = init.e ?? 0;
                this.f = init.f ?? 0;
            } else {
                this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
            }
        }
        multiply(other) {
            return new DOMMatrix({
                a: this.a * other.a + this.c * other.b,
                b: this.b * other.a + this.d * other.b,
                c: this.a * other.c + this.c * other.d,
                d: this.b * other.c + this.d * other.d,
                e: this.a * other.e + this.c * other.f + this.e,
                f: this.b * other.e + this.d * other.f + this.f
            });
        }
        translate(x, y) {
            return this.multiply(new DOMMatrix({ a: 1, b: 0, c: 0, d: 1, e: x, f: y }));
        }
        scale(x, y) {
            return this.multiply(new DOMMatrix({ a: x, b: 0, c: 0, d: y, e: 0, f: 0 }));
        }
    };
}

if (typeof globalThis.ImageData === 'undefined') {
    // Polyfill para ImageData - necesario para procesamiento de imágenes en PDFs
    globalThis.ImageData = class ImageData {
        constructor(width, height, data) {
            this.width = width;
            this.height = height;
            this.data = data || new Uint8ClampedArray(width * height * 4);
        }
    };
}

if (typeof globalThis.Path2D === 'undefined') {
    // Polyfill para Path2D - necesario para dibujar rutas en PDFs
    globalThis.Path2D = class Path2D {
        constructor() {
            this.commands = [];
        }
        moveTo(x, y) {
            this.commands.push({ type: 'moveTo', x, y });
        }
        lineTo(x, y) {
            this.commands.push({ type: 'lineTo', x, y });
        }
        rect(x, y, width, height) {
            this.commands.push({ type: 'rect', x, y, width, height });
        }
        arc(x, y, radius, startAngle, endAngle) {
            this.commands.push({ type: 'arc', x, y, radius, startAngle, endAngle });
        }
    };
}

// Importación dinámica de pdfjs-dist para evitar problemas en serverless
// Se carga solo cuando se necesita procesar un PDF
let pdfjsLib = null;

const loadPdfJs = async () => {
    if (!pdfjsLib) {
        try {
            // Configurar GlobalWorkerOptions ANTES de importar pdfjs-dist
            // Esto evita que pdfjs-dist intente configurar un worker automáticamente
            if (typeof globalThis.pdfjsLib === 'undefined') {
                globalThis.pdfjsLib = {};
            }
            if (!globalThis.pdfjsLib.GlobalWorkerOptions) {
                globalThis.pdfjsLib.GlobalWorkerOptions = {};
            }
            globalThis.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;
            
            // Importación dinámica de pdfjs-dist
            // Usar la ruta legacy que es más compatible con serverless
            const pdfjsModule = await import('pdfjs-dist/legacy/build/pdf.mjs');
            pdfjsLib = pdfjsModule.default || pdfjsModule;
            
            // Configurar el worker inmediatamente después de importar
            if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
                // Establecer workerSrc con una URL CDN válida
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
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
            // Configuración optimizada para serverless sin worker
            const loadingTask = pdfjs.getDocument({
                data: uint8Array,
                useSystemFonts: true,
                verbosity: 0, // Reducir logs en producción
                // Deshabilitar worker explícitamente para serverless
                useWorkerFetch: false,
                isEvalSupported: false,
                // Forzar modo sin worker
                disableAutoFetch: false,
                disableStream: false,
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

