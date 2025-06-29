import { UserEntity } from "../entities/user.entity";


export abstract class UserDatasource{
    abstract getPendingUsers():Promise<UserEntity[]>;
    abstract activateUser(userId:string): Promise<UserEntity>;
}