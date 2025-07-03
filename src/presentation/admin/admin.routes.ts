import { Router } from "express";
import { AdminController } from "./admin.controller";
// import { AuthDatasourceImpl, AuthRepositoryImpl } from "../../infrastructure";
import { pool } from "../../data/postgres/postgres-database";
import { UserDatasourceImpl } from "../../infrastructure/datasources/user.datasource.impl";
import { UserRepositoryImpl } from "../../infrastructure/repositories/user.repository.impl";
import { DocenteRepositoryImpl } from "../../infrastructure/repositories/docente.repository.impl";
import { DocenteDatasourceImpl } from "../../infrastructure/datasources/docente.datasource.impl";
import { ResendEmailService } from "../../infrastructure/services/nodemailer.service";

export class AdminRoutes {

    static get routes(): Router {
        
        const router = Router()
        //
        const emailService = new ResendEmailService()
        //
        const database = new UserDatasourceImpl(pool);
        //
        const database2 = new DocenteDatasourceImpl(pool);
        //
        const userRepository = new UserRepositoryImpl(database);
        //
        const docenteRepository = new DocenteRepositoryImpl(database2);
        //
        const controller = new AdminController(userRepository, docenteRepository, emailService);

        // Obtener usuarios pendientes
        router.get('/users/pending', controller.getPendingUsers)
        
        // Aprobar usuario
        router.put('/users/:id/approve', controller.approveUser)
        
        // Rechazar usuario
        router.put('/users/:id/reject', controller.rejectUser)
        
        return router;
    }
}