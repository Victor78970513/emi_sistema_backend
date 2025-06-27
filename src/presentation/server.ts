import express from 'express';

export class Server{
    public readonly app = express()

    constructor(){}

    async start(){
        this.app.listen(3000, ()=>{
            console.log(`Server runing on port ${3000}`);
        })
    }

}