import { JwtAdapter } from "../../../config";
import { LoginUserDto } from "../../dtos/auth/login-user.dto";
import { CustomError } from "../../errors/custom.error";
import { AuthRepository } from "../../repositories/auth.repository";

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

interface LoginUserUseCase {
    execute(loginUserDto: LoginUserDto): Promise<UserToken>
}

export class LoginUser implements LoginUserUseCase {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly signToken: SignToken = JwtAdapter.generateToken,
    ) {}

    async execute(loginUserDto: LoginUserDto): Promise<UserToken> {
        const user = await this.authRepository.login(loginUserDto)

        const token = await this.signToken({ id: user.userId }, 24);
        if (!token) throw CustomError.internalServer('Error generating token');
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