export class UserEntity{
    constructor(
        public userId: string,
        public nombres: string,
        public apellidos: string,
        public correo: string,
        public contraseña: string,
        public rol_id: number,
        public carrera_id: number,
        public estado_id: number,
    ){}
}