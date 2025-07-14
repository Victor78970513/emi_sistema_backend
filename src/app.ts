import { envs } from "./config";
import { pool } from "./data/postgres/postgres-database";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";
import express from 'express';
import cors from 'cors';
(()=>{
    main();
})()


async function main(){
    const app = express();

    app.use(express.json());

    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: false,
        maxAge: 3600
    }));

    await pool.connect()
    new Server({
        port: envs.PORT || 3000,
        routes: AppRoutes.routes,
    }).start();
}