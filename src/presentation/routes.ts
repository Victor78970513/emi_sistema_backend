import { Router } from "express";
import { AuthRoutes } from "./auth/auth.routes";
import { AdminRoutes } from "./admin/admin.routes";

export class AppRoutes{

    static get routes(): Router{
        const router = Router();
        //! Definir todas mis rutas principales
        router.use('/api/auth', AuthRoutes.routes)
        //
        router.use('/api/admin', AdminRoutes.routes)
        return router;
    }



}