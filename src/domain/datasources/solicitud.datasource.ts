import { SolicitudEntity } from "../entities/solicitud.entity";

export abstract class SolicitudDatasource {
  abstract crearSolicitud(
    docente_id: number,
    asignatura_id: number | null,
    carrera_id: number | null,
    motivo: string
  ): Promise<SolicitudEntity>;

  abstract obtenerSolicitudes(): Promise<SolicitudEntity[]>;

  abstract actualizarEstadoSolicitud(
    solicitud_id: number,
    nuevo_estado_id: number
  ): Promise<SolicitudEntity>;
}
