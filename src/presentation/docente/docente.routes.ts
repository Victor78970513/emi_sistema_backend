import { Router } from "express";
import { DocenteController } from "./docente.controller";
import { DocenteRepositoryImpl } from "../../infrastructure/repositories/docente.repository.impl";
import { DocenteDatasourceImpl } from "../../infrastructure/datasources/docente.datasource.impl";
import { pool } from "../../data/postgres/postgres-database";


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

        return router;
    }

}