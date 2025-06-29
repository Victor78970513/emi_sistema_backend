import { UserDatasource, UserEntity, UserRepository } from "../../domain";


export class UserRepositoryImpl implements UserRepository{

    constructor(
        private readonly userDataSource: UserDatasource
    ){}

    getPendingUsers(): Promise<UserEntity[]> {
        return this.userDataSource.getPendingUsers();
    }
    activateUser(userId: string): Promise<UserEntity> {
        return this.userDataSource.activateUser(userId);
    }

}