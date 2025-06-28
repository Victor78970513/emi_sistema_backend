import { envs } from "./config";
import { pool } from "./data/postgres/postgres-database";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";


(()=>{
    main();
})()


async function main(){
    await pool.connect()
    new Server({
        port: envs.PORT,
        routes: AppRoutes.routes,
    }).start();
}