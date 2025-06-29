import { Request, Response } from "express"
import { ActivateUser, CustomError, DocenteRepository, GetPendingUsers, UserRepository } from "../../domain";



export class AdminController{

    constructor(
        private readonly userRepository: UserRepository,
        private readonly docenteRepository: DocenteRepository
    ){}

    private handleError = (error: unknown, res:Response) => {
        if(error instanceof CustomError){
            return res.status(error.statusCode).json({error: error.message});
        }
        console.log(error)
        return res.status(500).json({error: 'Internal Server Error'});
    }

    getPendingUsers = (req: Request,res:Response) => {
        new GetPendingUsers(this.userRepository)
        .execute()
        .then(data => res.json(data))
        .catch(error => this.handleError(error,res))
    }

    activateUser = (req: Request, res: Response) => {
        const {id} = req.params;
        console.log(id)
        if(!id){
            res.status(400).json({ error: 'Falta el ID del usuario en la URL' });
            return;
        }
        new ActivateUser(this.userRepository,this.docenteRepository)
        .execute(id)
        .then(data => res.json(data))
        .catch(error => this.handleError(error,res))
    }
}