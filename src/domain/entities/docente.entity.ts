export class DocenteEntity{
    constructor(
    public docente_id: number,
    public nombres: string,
    public apellidos: string,
    public ci: string,
    public genero: string,
    public correo_electronico: string,
    public foto_docente: string,
    public fecha_nacimiento: Date,
    public experiencia_laboral_anios: number,
    public experiencia_docente_semestres: number,
    public categoria_docente_id: number | null,
    public modalidad_ingreso_id: number | null,
    public usuario_id: number,
    ){}
}