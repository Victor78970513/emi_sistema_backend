import { UserEntity } from "../entities/user.entity";


export abstract class UserDatasource{
    abstract getPendingUsers():Promise<UserEntity[]>;
    abstract updateUserStatus(userId: string, action: 'approve' | 'reject'): Promise<UserEntity>;
}