import { UserEntity } from "../entities/user.entity";


export abstract class EmailService{

    abstract requestRegistrationMail(user: UserEntity):Promise<void>;

    abstract sendApprovalAccountMail(sendMailTo: string, user: UserEntity):Promise<void>;
}