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
        
        // Rutas para solicitudes
        router.get('/solicitudes', controller.getAllSolicitudes)
        router.put('/solicitudes/:id/approve', controller.approveSolicitud)
        router.put('/solicitudes/:id/reject', controller.rejectSolicitud)
        
        // Rutas para asignaturas
        router.get('/asignaturas', controller.getAllAsignaturasByCarreras)
        router.get('/asignaturas/:id', controller.getAsignaturaById)
        router.get('/asignaturas/:id/docentes', controller.getDocentesByAsignatura)
        
        // Rutas para asociar/desasociar docentes de asignaturas
        router.post('/asignaturas/:id/docentes', controller.associateDocenteAsignatura)
        router.delete('/asignaturas/:id/docentes/:docenteId', controller.disassociateDocenteAsignatura)
        
        // Rutas para docentes
        router.get('/docentes/:id', controller.getDocenteById)
        
        // Rutas para PDFs
        router.get('/carreras/:carreraId/asignaturas/pdf', controller.downloadAsignaturasPDF)
        
        return router;
    }
}