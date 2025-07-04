import express, { Router } from 'express';
import path from 'path';
import cors from 'cors';

interface Options{
    port?: number;
    routes: Router;
}

export class Server{
    public readonly app = express()
    private readonly port: number;
    private readonly routes: Router;

    constructor(options: Options){
        const {port = 3100, routes} = options
        this.port = port;
        this.routes = routes;
    }

    async start(){
        //?Middlewares
        console.log(__dirname)
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
        
        //? Usar las rutas definidas
        this.app.use(this.routes);

        //? Escuchamos al puerto
        this.app.listen(this.port, ()=>{
            console.log(`Server runing on port ${this.port}`);
        })
    }

}