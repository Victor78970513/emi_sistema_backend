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

// Middleware para PDF de estudios académicos
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/estudios_academicos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'estudio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const pdfFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(CustomError.badRequest('Solo se permiten archivos PDF'));
    }
};

const uploadPDF = multer({
    storage: pdfStorage,
    fileFilter: pdfFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
    }
});

export class UploadMiddleware {
    static uploadDocentePhoto = upload.single('foto');
    static uploadEstudioPDF = uploadPDF.single('documento');

    static validateUpload = (req: Request, res: Response, next: NextFunction): void => {
        if (!req.file) {
            res.status(400).json({ error: 'No se ha subido ningún archivo' });
            return;
        }
        next();
    };

    static validatePDF = (req: Request, res: Response, next: NextFunction): void => {
        if (!req.file) {
            res.status(400).json({ error: 'No se ha subido ningún archivo PDF' });
            return;
        }
        next();
    };
} 