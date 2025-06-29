import { UserEntity } from "../entities/user.entity";



export abstract class UserRepository{
    abstract getPendingUsers():Promise<UserEntity[]>;
    abstract activateUser(userId:string): Promise<UserEntity>;
}