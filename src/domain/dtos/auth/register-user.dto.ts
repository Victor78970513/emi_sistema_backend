import { Validators } from "../../../config";



export class RegisterUserDto{
    private constructor(
        public name: string,
        public lastName:string,
        public email: string,
        public password: string,
        public rol:string,
    ){}

    static create(object: {[key: string]: any}):[string?, RegisterUserDto?]{
        const {name,lastName, email, password,rol} =  object;
        if(!name) return ["Missing name",undefined];
        if(!email) return ["Missing email",undefined];
        if(!Validators.email.test(email)) return ['Email is not valid']
        if(!password) return ['Missing password'];
        if(password.length < 6) return ['Password too short']
        console.log("estoy pasando por aca paps")
        return [
            undefined,
            new RegisterUserDto(name,lastName,email,password,rol)
        ];
    }
}