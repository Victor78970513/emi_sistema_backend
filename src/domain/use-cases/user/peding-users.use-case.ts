import { UserEntity } from "../../entities/user.entity";
import { UserRepository } from "../../repositories/user.repository";



interface GetPendingUsersUseCase{
    execute(): Promise<UserEntity[]>
}

export class GetPendingUsers implements GetPendingUsersUseCase{

    constructor(
        private readonly userRepository: UserRepository
    ){}

    async execute(): Promise<UserEntity[]> {
        const pendingAccounts = await this.userRepository.getPendingUsers();
        return pendingAccounts;
    }
}