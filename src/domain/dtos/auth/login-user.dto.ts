import { Validators } from "../../../config";


export class LoginUserDto{
    constructor(
        public correo:string,
        public contraseña:string,
    ){}

    static login(object: {[key:string]:any}):[string?, LoginUserDto?]{
        const {correo, contraseña} =  object;
        if(!correo) return ["Missing correo",undefined];
        if(!Validators.email.test(correo)) return ['Email is not valid']
        if(!contraseña) return ['Missing contraseña'];
        if(contraseña.length < 6) return ['Password too short']
        console.log("estoy pasando por aca paps")
        return [
            undefined,
            new LoginUserDto(correo,contraseña)
        ];
    }
}

export class SafeUserDto {
    constructor(
        public id: string,
        public nombres: string,
        public apellidos: string,
        public correo: string,
        public rol_id: number,
        public carrera_id: number,
        public estado_id: number,
    ) {}

    static fromEntity(user: any) {
        return new SafeUserDto(
            user.userId || user.id,
            user.nombres,
            user.apellidos,
            user.correo,
            user.rol_id,
            user.carrera_id,
            user.estado_id,
        );
    }
}