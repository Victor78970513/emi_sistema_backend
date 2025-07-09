import { Router } from "express";
import { SolicitudController } from "./solicitud.controller";
import { SolicitudDatasourceImpl } from "../../infrastructure/datasources/solicitud.datasource.impl";
import { SolicitudRepositoryImpl } from "../../infrastructure/repositories/solicitud.repository.impl";
import { pool } from "../../data/postgres/postgres-database";

const router = Router();
const datasource = new SolicitudDatasourceImpl(pool);
const repository = new SolicitudRepositoryImpl(datasource);
const controller = new SolicitudController(repository);

router.post('/', controller.crearSolicitud);
router.get('/', controller.obtenerSolicitudes);
router.put('/:id/estado', controller.actualizarEstadoSolicitud);

export default router;
