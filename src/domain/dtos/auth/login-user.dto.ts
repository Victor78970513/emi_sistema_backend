import { Validators } from "../../../config";


export class LoginUserDto{
    constructor(
        public email:string,
        public password:string,
    ){}

    static login(object: {[key:string]:any}):[string?, LoginUserDto?]{
        const {email, password} =  object;
        if(!email) return ["Missing email",undefined];
        if(!Validators.email.test(email)) return ['Email is not valid']
        if(!password) return ['Missing password'];
        if(password.length < 6) return ['Password too short']
        console.log("estoy pasando por aca paps")
        return [
            undefined,
            new LoginUserDto(email,password)
        ];
    }
}