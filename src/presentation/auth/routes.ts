import { Router } from "express";
import { AuthController } from "./controller";
import { AuthDatasourceImpl, AuthRepositoryImpl } from "../../infrastructure";
import { pool } from "../../data/postgres/postgres-database";



export class AuthRoutes{

    static get routes(): Router{

        const router = Router();

        const database = new AuthDatasourceImpl(pool);
        const authRepository = new AuthRepositoryImpl(database);
        
        const controller = new AuthController(authRepository);
        //
        router.post('/login',controller.loginUser)
        //
        router.post('/register',controller.registerUser)
        
        return router;
    }


}