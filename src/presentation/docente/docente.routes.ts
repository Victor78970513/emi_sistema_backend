import { Router } from "express";
import { DocenteController } from "./docente.controller";
import { DocenteRepositoryImpl } from "../../infrastructure/repositories/docente.repository.impl";
import { DocenteDatasourceImpl } from "../../infrastructure/datasources/docente.datasource.impl";
import { pool } from "../../data/postgres/postgres-database";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { UploadMiddleware } from "../middlewares/upload.middleware";


export class DocenteRoutes{

    static get routes(): Router{
        //
        const database = new DocenteDatasourceImpl(pool);
        //
        const docenteRepository = new DocenteRepositoryImpl(database);
        //
        const controller = new DocenteController(docenteRepository);

        const router = Router();

        // Rutas dinámicas primero (para evitar conflictos)
        router.get('/:docenteId/estudios-academicos', AuthMiddleware.validateJWT, controller.getEstudiosByDocenteId);
        
        // Rutas específicas después
        router.get('/personal-info', controller.getPersonalInfo);
        router.get('/me', AuthMiddleware.validateJWT, controller.getMe);
        router.put('/me', AuthMiddleware.validateJWT, controller.updateMe);
        router.post('/photo', 
            AuthMiddleware.validateJWT, 
            UploadMiddleware.uploadDocentePhoto, 
            UploadMiddleware.validateUpload, 
            controller.uploadPhoto
        );
        router.post('/estudios-academicos', 
            AuthMiddleware.validateJWT, 
            UploadMiddleware.uploadEstudioDocumento, 
            UploadMiddleware.validateDocumento, 
            controller.registerEstudioAcademico
        );
        router.get('/estudios-academicos', AuthMiddleware.validateJWT, controller.getEstudiosAcademicos);
        router.delete('/estudios-academicos/:estudioId', AuthMiddleware.validateJWT, controller.deleteEstudioAcademico);
        router.get('/estudios-academicos/:estudioId/pdf', controller.getEstudioPDF);
        router.get('/carreras', controller.getCarreras);
        router.get('/instituciones', controller.getInstituciones);
        router.get('/grados-academicos', controller.getGradosAcademicos);
        router.get('/all', controller.getAllDocentes);

        
        router.get('/asignaturas', controller.obtenerAsignaturas);
        router.get('/carreras-disponibles', controller.obtenerCarrerasDisponibles);

        return router;
    }

}