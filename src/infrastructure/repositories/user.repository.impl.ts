import { UserDatasource, UserEntity, UserRepository } from "../../domain";


export class UserRepositoryImpl implements UserRepository{

    constructor(
        private readonly userDataSource: UserDatasource
    ){}

    getPendingUsers(): Promise<UserEntity[]> {
        return this.userDataSource.getPendingUsers();
    }

    updateUserStatus(userId: string, action: 'approve' | 'reject'): Promise<UserEntity> {
        return this.userDataSource.updateUserStatus(userId, action);
    }

}