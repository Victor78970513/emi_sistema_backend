import { Request, Response } from "express"
import { AuthRepository, RegisterUserDto } from "../../domain";

export class AuthController{

    //? Injeccion de Dependencias
    constructor(
        private readonly authRepository: AuthRepository,
    ){}

    registerUser = (req: Request, res:Response) => {
        const [error, registerUserDto] = RegisterUserDto.create(req.body);
        
        if(error) res.status(400).json({error});

        this.authRepository.register(registerUserDto!).then(user => res.json(user))
        .catch(
            error => res.status(500).json(error)
        )
    }

    loginUser = (req: Request, res:Response) => {
        res.json('LoginUserController')
    }

}