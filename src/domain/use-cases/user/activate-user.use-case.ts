import { UserEntity } from "../../entities/user.entity";
import { UserRepository } from "../../repositories/user.repository";


interface ActivateUserUseCase{
    execute(userId:string):Promise<UserEntity>;
}

export class ActivateUser implements ActivateUserUseCase{
    constructor(
        private readonly userRepository: UserRepository
    ){}

    async execute(userId: string): Promise<UserEntity> {
        const updateUser = await this.userRepository.activateUser(userId);   
        return new UserEntity(
            userId,
            updateUser.name,
            updateUser.lastName,
            updateUser.email,
            updateUser.password,
            updateUser.rol,
            updateUser.isActive,
        );
    }
}