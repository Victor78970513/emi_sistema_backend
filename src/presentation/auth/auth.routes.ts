import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthDatasourceImpl, AuthRepositoryImpl } from "../../infrastructure";
import { pool } from "../../data/postgres/postgres-database";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { ResendEmailService } from "../../infrastructure/services/nodemailer.service";



export class AuthRoutes{

    static get routes(): Router{

        const router = Router();
        //
        const emailService = new ResendEmailService()
        //
        const database = new AuthDatasourceImpl(pool);
        //
        const authRepository = new AuthRepositoryImpl(database);
        //
        const controller = new AuthController(authRepository,emailService);
        //
        router.post('/login',controller.loginUser);
        //
        router.post('/register',controller.registerUser);
        //
        router.post('/checkAuth',controller.checkAuth);
        //
        router.get('/', AuthMiddleware.validateJWT ,controller.getUsers);
        
        return router;
    }


}