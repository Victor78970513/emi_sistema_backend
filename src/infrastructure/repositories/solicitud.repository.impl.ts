import { SolicitudDatasource } from "../../domain/datasources/solicitud.datasource";
import { SolicitudRepository } from "../../domain/repositories/solicitud.repository";
import { SolicitudEntity } from "../../domain/entities/solicitud.entity";

export class SolicitudRepositoryImpl implements SolicitudRepository {
  constructor(private readonly datasource: SolicitudDatasource) {}

  crearSolicitud(
    docente_id: number,
    asignatura_id: number | null,
    carrera_id: number | null,
    motivo: string
  ): Promise<SolicitudEntity> {
    return this.datasource.crearSolicitud(docente_id, asignatura_id, carrera_id, motivo);
  }

  obtenerSolicitudes(): Promise<SolicitudEntity[]> {
    return this.datasource.obtenerSolicitudes();
  }

  actualizarEstadoSolicitud(
    solicitud_id: number,
    nuevo_estado_id: number
  ): Promise<SolicitudEntity> {
    return this.datasource.actualizarEstadoSolicitud(solicitud_id, nuevo_estado_id);
  }
}
