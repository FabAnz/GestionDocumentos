import multer from "multer";

// Configurar multer para almacenar en memoria (no en disco)
const storage = multer.memoryStorage();

// Configurar límites y validaciones
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB máximo
    },
    fileFilter: (req, file, cb) => {
        // Tipos MIME permitidos
        const allowedMimes = [
            'application/pdf', 
            'text/plain',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];
        
        // Extensiones permitidas
        const allowedExtensions = ['.pdf', '.txt', '.jpg', '.jpeg', '.png'];
        
        // Obtener extensión del archivo
        const fileExtension = file.originalname.toLowerCase().substring(
            file.originalname.lastIndexOf('.')
        );
        
        // Validar tanto MIME type como extensión
        const isValidMime = allowedMimes.includes(file.mimetype);
        const isValidExtension = allowedExtensions.includes(fileExtension);
        
        if (isValidMime && isValidExtension) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF, TXT, JPG, JPEG y PNG'), false);
        }
    }
});

// Middleware base de multer
const uploadSingle = upload.single('archivo');

// Middleware wrapper para manejar errores de multer
export const uploadFile = (req, res, next) => {
    uploadSingle(req, res, (err) => {
        if (err) {
            // Manejar errores de multer
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        message: "El archivo es demasiado grande. El tamaño máximo permitido es 15MB"
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        message: "Campo de archivo inesperado. El campo debe llamarse 'archivo'"
                    });
                }
                return res.status(400).json({
                    message: `Error al procesar el archivo: ${err.message}`
                });
            }
            
            // Manejar error de tipo de archivo inválido (del fileFilter)
            if (err.message && err.message.includes('Solo se permiten archivos PDF, TXT, JPG, JPEG y PNG')) {
                return res.status(400).json({
                    message: err.message
                });
            }
            
            // Otros errores
            return res.status(400).json({
                message: `Error al procesar el archivo: ${err.message}`
            });
        }
        next();
    });
};

