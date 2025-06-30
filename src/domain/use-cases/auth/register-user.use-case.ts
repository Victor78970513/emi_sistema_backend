import { JwtAdapter } from "../../../config";
import { ResendEmailService } from "../../../infrastructure/services/nodemailer.service";
import { RegisterUserDto } from "../../dtos/auth/register-user.dto";
import { CustomError } from "../../errors/custom.error";
import { AuthRepository } from "../../repositories/auth.repository";
import { EmailService } from "../../services/email.service";

interface UserToken{
    token: string;
    user:{
        id:string;
        name:string;
        lastName: string,
        email:string;
        rol: string;
        isActive: boolean;
    }
}

type SignToken = (payload:Object,duration?:number) => Promise<string | null>

interface RegisterUserUseCase{
    execute( registerUserDto: RegisterUserDto): Promise<UserToken>
}

export class RegisterUser implements RegisterUserUseCase{
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly signToken: SignToken = JwtAdapter.generateToken,
        private readonly emailService: EmailService,
    ){}
    async execute(registerUserDto: RegisterUserDto): Promise<UserToken> {
        const user  = await this.authRepository.register(registerUserDto);
        const token = await this.signToken({id:user.userId},24)
        if(!token) throw CustomError.internalServer('Error generating token')
        await this.emailService.requestRegistrationMail(`${user.name} ${user.lastName}`);
        return {
            token: token,
            user:{
                id: user.userId,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                rol: user.rol,
                isActive: user.isActive,
            }
        }
    }

}