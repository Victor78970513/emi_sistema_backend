export class SolicitudEntity {
  constructor(
    public id: number,
    public docente_id: number,
    public asignatura_id: number | null, 
    public carrera_id: number | null,    
    public motivo: string,
    public estado_id: number,
    public creado_en: Date,
    public modificado_en: Date
  ) {}
}
