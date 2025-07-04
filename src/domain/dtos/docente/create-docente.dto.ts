export class CreateDocenteDto{

    constructor(
        public nombres: string,
        public apellidos: string,
        public carnet_identidad: string,
        public genero: string,
        public correo_electronico: string,
        public foto_docente: string,
        public fecha_nacimiento: Date | null,
        public experiencia_profesional: number | null,
        public experiencia_academica: number | null,
        public categoria_docente_id: number | null,
        public modalidad_ingreso_id: number | null,
        public usuario_id: number,
    ){}

}

export class UpdateDocenteDto {
    constructor(
        public nombres?: string,
        public apellidos?: string,
        public carnet_identidad?: string,
        public genero?: string,
        public correo_electronico?: string,
        public foto_docente?: string,
        public fecha_nacimiento?: Date | null,
        public experiencia_profesional?: number | null,
        public experiencia_academica?: number | null,
        public categoria_docente_id?: number | null,
        public modalidad_ingreso_id?: number | null,
    ) {}
}

export class UploadPhotoDto {
    constructor(
        public filename: string,
        public originalname: string,
        public mimetype: string,
        public size: number,
        public path: string
    ) {}
}

export class CreateEstudioAcademicoDto {
    constructor(
        public titulo: string,
        public documento_url: string,
        public institucion_id: number,
        public grado_academico_id: number,
        public año_titulacion: number,
        public docente_id: number,
    ) {}
}

export class UploadEstudioPDFDto {
    constructor(
        public filename: string,
        public originalname: string,
        public mimetype: string,
        public size: number,
        public path: string
    ) {}
}