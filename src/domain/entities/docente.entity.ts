export class DocenteEntity{
    constructor(
    public docente_id: number,
    public nombres: string,
    public apellidos: string,
    public carnet_identidad: string | null,
    public genero: string | null,
    public correo_electronico: string,
    public foto_docente: string| null,
    public fecha_nacimiento: Date | null,
    public experiencia_profesional: number | null,
    public experiencia_academica: number | null,
    public categoria_docente_id: number | null,
    public modalidad_ingreso_id: number | null,
    public usuario_id: number,
    // Campos adicionales de la consulta JOIN
    public user_nombres?: string,
    public user_apellidos?: string,
    public user_correo?: string,
    public rol_id?: number,
    public carrera_id?: number,
    public estado_id?: number,
    public rol_nombre?: string,
    public carrera_nombre?: string,
    public estado_nombre?: string,
    public creado_en?: Date,
    public modificado_en?: Date,
    ){}
}

export class EstudioAcademicoEntity {
    constructor(
        public id: number,
        public docente_id: number,
        public titulo: string,
        public documento_url: string,
        public institucion_id: number,
        public grado_academico_id: number,
        public creado_en: Date,
        public modificado_en: Date,
        public año_titulacion: number,
        // Campos adicionales para nombres
        public institucion_nombre?: string,
        public grado_academico_nombre?: string,
    ) {}
}

export class CarreraEntity {
    constructor(
        public id: number,
        public nombre: string,
        public creado_en: Date,
        public modificado_en: Date
    ) {}
}

export class InstitucionEntity {
    constructor(
        public id: number,
        public nombre: string,
        public creado_en: Date,
        public modificado_en: Date
    ) {}
}

export class GradoAcademicoEntity {
    constructor(
        public id: number,
        public nombre: string,
        public creado_en: Date,
        public modificado_en: Date
    ) {}
}