import { Request, Response } from "express"
import { AuthRepository, CustomError, RegisterUser, RegisterUserDto } from "../../domain";
import { JwtAdapter } from "../../config";

export class AuthController{

    //? Injeccion de Dependencias
    constructor(
        private readonly authRepository: AuthRepository,
    ){}

    private handleError = (error: unknown, res:Response) => {
        if(error instanceof CustomError){
            return res.status(error.statusCode).json({error: error.message});
        }
        console.log(error)
        return res.status(500).json({error: 'Internal Server Error'});
    }

    registerUser = (req: Request, res:Response) => {
        const [error, registerUserDto] = RegisterUserDto.create(req.body);
        
        if(error){
            res.status(400).json({error});
            return;
        }
        new RegisterUser(this.authRepository).execute(registerUserDto!)
        .then( data => res.json(data))
        .catch(error => this.handleError(error,res))
    }

    loginUser = (req: Request, res:Response) => {
        res.json('LoginUserController')
    }

    getUsers = (req: Request, res: Response) => {
        res.json
    }
}