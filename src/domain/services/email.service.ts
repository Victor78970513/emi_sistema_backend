

export abstract class EmailService{

    abstract requestRegistrationMail(fullName: string):Promise<void>;

    abstract sendApprovalAccountMail(sendMailTo: string, fullName: string):Promise<void>;
}