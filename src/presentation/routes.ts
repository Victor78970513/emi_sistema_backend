import { Router } from "express";
import { AuthRoutes } from "./auth/auth.routes";
import { AdminRoutes } from "./admin/admin.routes";
import { DocenteRoutes } from "./docente/docente.routes";
import solicitudRoutes from "./solicitud/solicitud.routes";

export class AppRoutes{

    static get routes(): Router{
        const router = Router();
        //! Definir todas mis rutas principales
        router.use('/api/auth', AuthRoutes.routes)
        //
        router.use('/api/admin', AdminRoutes.routes)
        //
        router.use('/api/docente', DocenteRoutes.routes)
        
        router.use('/api/solicitudes', solicitudRoutes);

        return router;
    }



}