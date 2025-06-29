import { Router } from "express";
import { AdminController } from "./admin.controller";
// import { AuthDatasourceImpl, AuthRepositoryImpl } from "../../infrastructure";
import { pool } from "../../data/postgres/postgres-database";
import { UserDatasourceImpl } from "../../infrastructure/datasources/user.datasource.impl";
import { UserRepositoryImpl } from "../../infrastructure/repositories/user.repository.impl";



export class AdminRoutes{

    static get routes(): Router{
        
        const router = Router()
        //
        const database = new UserDatasourceImpl(pool);
        //
        const userRepository = new UserRepositoryImpl(database);
        //
        const controller = new AdminController(userRepository);

        router.get('/users/pending',controller.getPendingUsers)
        //
        router.put('/users/:id/activate',controller.activateUser)
        //
        return router;
    }

}