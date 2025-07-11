import { Router } from "express";
import { AuthRoutes } from "./auth/auth.routes";
import { AdminRoutes } from "./admin/admin.routes";
import { DocenteRoutes } from "./docente/docente.routes";

export class AppRoutes{

    static get routes(): Router{
        const router = Router();
        //! Definir todas mis rutas principales
        router.get('/', (req, res) => {
            res.json({ mensaje: 'Hola mundo' });
        });
        router.use('/api/auth', AuthRoutes.routes)
        //
        router.use('/api/admin', AdminRoutes.routes)
        //
        router.use('/api/docente', DocenteRoutes.routes)
        return router;
    }



}