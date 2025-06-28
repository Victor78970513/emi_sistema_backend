import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthDatasourceImpl, AuthRepositoryImpl } from "../../infrastructure";
import { pool } from "../../data/postgres/postgres-database";
import { AuthMiddleware } from "../middlewares/auth.middleware";



export class AuthRoutes{

    static get routes(): Router{

        const router = Router();

        const database = new AuthDatasourceImpl(pool);

        const authRepository = new AuthRepositoryImpl(database);
        
        const controller = new AuthController(authRepository);
        //
        router.post('/login',controller.loginUser);
        //
        router.post('/register',controller.registerUser);
        //
        router.get('/', AuthMiddleware.validateJWT ,controller.getUsers);
        
        return router;
    }


}