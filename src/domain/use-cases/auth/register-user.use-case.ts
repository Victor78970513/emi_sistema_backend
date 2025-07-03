import { JwtAdapter } from "../../../config";
import { ResendEmailService } from "../../../infrastructure/services/nodemailer.service";
import { RegisterUserDto } from "../../dtos/auth/register-user.dto";
import { CustomError } from "../../errors/custom.error";
import { AuthRepository } from "../../repositories/auth.repository";
import { EmailService } from "../../services/email.service";

interface UserToken {
    token: string;
    user: {
        id: string;
        nombres: string;
        apellidos: string;
        correo: string;
        rol_id: number;
        carrera_id: number;
        estado_id: number;
    }
}

type SignToken = (payload: Object, duration?: number) => Promise<string | null>

interface RegisterUserUseCase {
    execute(registerUserDto: RegisterUserDto): Promise<UserToken>
}

export class RegisterUser implements RegisterUserUseCase {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly signToken: SignToken = JwtAdapter.generateToken,
        private readonly emailService: EmailService,
    ) {}
    
    async execute(registerUserDto: RegisterUserDto): Promise<UserToken> {
        const user = await this.authRepository.register(registerUserDto);
        const token = await this.signToken({ id: user.userId }, 24)
        if (!token) throw CustomError.internalServer('Error generating token')
        // await this.emailService.requestRegistrationMail(`${user.nombres} ${user.apellidos}`);
        await this.emailService.requestRegistrationMail(user);
        return {
            token: token,
            user: {
                id: user.userId,
                nombres: user.nombres,
                apellidos: user.apellidos,
                correo: user.correo,
                rol_id: user.rol_id,
                carrera_id: user.carrera_id,
                estado_id: user.estado_id,
            }
        }
    }
}