import { Request, Response } from "express"
import { AuthRepository, CustomError, LoginUser, LoginUserDto, RegisterUser, RegisterUserDto } from "../../domain";
import { CheckAuth } from "../../domain/use-cases/auth/check-auth.use-case";
import { EmailService } from "../../domain/services/email.service";

export class AuthController{

    //? Injeccion de Dependencias
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly emailService: EmailService,
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
        new RegisterUser(this.authRepository,undefined,this.emailService)
        .execute(registerUserDto!)
        .then( data => res.json(data))
        .catch(error => this.handleError(error,res))
    }

    loginUser = (req: Request, res:Response) => {
        const [error, loginUserDto] = LoginUserDto.login(req.body);

        if(error){
            res.status(400).json({error});
            return;
        }
        new LoginUser(this.authRepository)
        .execute(loginUserDto!)
        .then(data => res.json(data))
        .catch(error => this.handleError(error,res))
    }

    getUsers = (req: Request, res: Response) => {
        res.json
    }

    checkAuth = (req: Request, res: Response) => {
        const {token} = req.body
        console.log(`JWT: ${token}`)
        new CheckAuth(this.authRepository)
        .execute(token)
        .then(data => res.json(data))
        .catch(error => this.handleError(error,res))
    }
}