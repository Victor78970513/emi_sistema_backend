

export class CreateDocenteDto{

    constructor(
        public nombres: string,
        public apellidos: string,
        public ci: string,
        public genero: string,
        public correo_electronico: string,
        public foto_docente: string,
        public fecha_nacimiento: Date | null,
        public experiencia_laboral_anios: number | null,
        public experiencia_docente_semestres: number | null,
        public categoria_docente_id: number | null,
        public modalidad_ingreso_id: number | null,
        public usuario_id: number,
    ){}

}