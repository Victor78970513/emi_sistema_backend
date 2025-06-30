import { Request, Response } from "express"
import { CustomError, DocenteRepository } from "../../domain"
import { GetPersonalInfo } from "../../domain/use-cases/docente/get-personal-info.use-case";


export class DocenteController{

    constructor(
        private readonly docenteRepository: DocenteRepository,
    ){}

    private handleError = (error: unknown, res:Response) => {
        if(error instanceof CustomError){
            return res.status(error.statusCode).json({error: error.message});
        }
        console.log(error)
        return res.status(500).json({error: 'Internal Server Error'});
    }

    
    getPersonalInfo = (req: Request,res:Response) => {
        const {docenteId} = req.query;
        if (!docenteId || (Array.isArray(docenteId) && docenteId.length === 0)) {
            res.status(400).json({ message: 'docenteId es un parámetro de consulta requerido.' });
            return;
        }
        new GetPersonalInfo(this.docenteRepository)
        .execute(docenteId as string)
        .then(data => res.json(data))
        .catch(error => this.handleError(error,res))   
    }
}