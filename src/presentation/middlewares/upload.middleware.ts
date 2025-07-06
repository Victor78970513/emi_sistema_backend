import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../domain';

// Configurar el almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/docentes/');
    },
    filename: (req, file, cb) => {
        // Generar nombre único: timestamp + nombre original
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'docente-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtrar archivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Permitir solo imágenes
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(CustomError.badRequest('Solo se permiten archivos de imagen'));
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    }
});

// Middleware para documentos de estudios académicos (cualquier tipo)
const documentoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/estudios_academicos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'documento-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const documentoFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Obtener la extensión del archivo
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    // Lista de extensiones permitidas
    const allowedExtensions = [
        '.pdf', '.doc', '.docx', '.txt', '.rtf',
        '.xls', '.xlsx', '.ppt', '.pptx',
        '.odt', '.ods', '.odp', // OpenDocument formats
        '.pages', '.numbers', '.key', // Apple formats
        '.csv', '.xml', '.json',
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', // Imágenes
        '.zip', '.rar', '.7z' // Archivos comprimidos
    ];
    
    if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(CustomError.badRequest(`Solo se permiten archivos con las siguientes extensiones: ${allowedExtensions.join(', ')}`));
    }
};

const uploadDocumento = multer({
    storage: documentoStorage,
    fileFilter: documentoFilter,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB máximo
    }
});

export class UploadMiddleware {
    static uploadDocentePhoto = upload.single('foto');
    static uploadEstudioDocumento = uploadDocumento.single('documento');

    static validateUpload = (req: Request, res: Response, next: NextFunction): void => {
        if (!req.file) {
            res.status(400).json({ error: 'No se ha subido ningún archivo' });
            return;
        }
        next();
    };

    static validateDocumento = (req: Request, res: Response, next: NextFunction): void => {
        if (!req.file) {
            res.status(400).json({ error: 'No se ha subido ningún documento' });
            return;
        }
        next();
    };
} 