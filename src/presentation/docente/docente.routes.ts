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
            UploadMiddleware.uploadEstudioPDF, 
            UploadMiddleware.validatePDF, 
            controller.registerEstudioAcademico
        );
        router.get('/estudios-academicos/:estudioId/pdf', controller.getEstudioPDF);

        return router;
    }

}