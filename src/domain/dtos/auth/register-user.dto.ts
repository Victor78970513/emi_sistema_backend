import { Validators } from "../../../config";

export class RegisterUserDto {
    private constructor(
        public nombres: string,
        public apellidos: string,
        public correo: string,
        public contraseña: string,
        public rol_id: number,
        public carrera_id: number,
    ) {}

    static create(object: {[key: string]: any}): [string?, RegisterUserDto?] {
        const { nombres, apellidos, correo, contraseña, rol_id, carrera_id } = object;
        if (!nombres) return ["Missing nombres", undefined];
        if (!apellidos) return ["Missing apellidos", undefined];
        if (!correo) return ["Missing correo", undefined];
        if (!Validators.email.test(correo)) return ['Email is not valid'];
        if (!contraseña) return ['Missing contraseña'];
        if (contraseña.length < 6) return ['Password too short'];
        if (!rol_id) return ["Missing rol_id", undefined];
        if (!carrera_id) return ["Missing carrera_id", undefined];
        return [
            undefined,
            new RegisterUserDto(nombres, apellidos, correo, contraseña, rol_id, carrera_id)
        ];
    }
}