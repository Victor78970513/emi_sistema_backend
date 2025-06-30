import { JwtAdapter } from "../../../config";
import { CustomError } from "../../errors/custom.error";
import { AuthRepository } from "../../repositories/auth.repository";

interface UserToken{
    token: string;
    user:{
        id:string;
        name:string;
        lastName: string,
        email:string;
        rol: string;
    }
}

type SignToken = (payload:Object,duration?:number) => Promise<string | null>

interface CheckAuthUseCase{
    execute(token: string): Promise<UserToken>
}

export class CheckAuth implements CheckAuthUseCase{

    constructor(
        private readonly authRepository: AuthRepository,
        private readonly signToken: SignToken = JwtAdapter.generateToken,
    ){}

    async execute(token: string): Promise<UserToken> {
        const user = await this.authRepository.checkAuth(token);
        const newToken = await this.signToken({id:user.userId},24);
        if(!newToken) throw CustomError.internalServer('Error generating token');
        return {
            token: newToken,
            user:{
                id: user.userId,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                rol: user.rol,
            }
        }
    }
}