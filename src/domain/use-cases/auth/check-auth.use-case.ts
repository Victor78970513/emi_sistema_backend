import { JwtAdapter } from "../../../config";
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

interface CheckAuthUseCase {
    execute(token: string): Promise<UserToken>
}

export class CheckAuth implements CheckAuthUseCase {

    constructor(
        private readonly authRepository: AuthRepository,
        private readonly signToken: SignToken = JwtAdapter.generateToken,
    ) {}

    async execute(token: string): Promise<UserToken> {
        const user = await this.authRepository.checkAuth(token);
        const newToken = await this.signToken({ id: user.userId }, 24);
        if (!newToken) throw CustomError.internalServer('Error generating token');
        return {
            token: newToken,
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