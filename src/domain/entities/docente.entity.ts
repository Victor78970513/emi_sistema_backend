export class DocenteEntity{
    constructor(
    public docente_id: number,
    public nombres: string,
    public apellidos: string,
    public ci: string | null,
    public genero: string | null,
    public correo_electronico: string,
    public foto_docente: string| null,
    public fecha_nacimiento: Date | null,
    public experiencia_laboral_anios: number | null,
    public experiencia_docente_semestres: number | null,
    public categoria_docente_id: number | null,
    public modalidad_ingreso_id: number | null,
    public usuario_id: number,
    ){}
}