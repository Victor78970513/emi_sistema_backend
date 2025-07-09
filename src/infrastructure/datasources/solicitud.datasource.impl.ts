import { Pool } from "pg";
import { SolicitudDatasource } from "../../domain/datasources/solicitud.datasource";
import { SolicitudEntity } from "../../domain/entities/solicitud.entity";

export class SolicitudDatasourceImpl implements SolicitudDatasource {
  constructor(private readonly db: Pool) {}

  async crearSolicitud(
    docente_id: number,
    asignatura_id: number | null,
    carrera_id: number | null,
    motivo: string
  ): Promise<SolicitudEntity> {
    const result = await this.db.query(
      `INSERT INTO solicitudes (docente_id, asignatura_id, carrera_id, motivo, estado_id, creado_en, modificado_en)
       VALUES ($1, $2, $3, $4, 1, NOW(), NOW())
       RETURNING *`,
      [docente_id, asignatura_id, carrera_id, motivo]
    );
    return result.rows[0] as SolicitudEntity;
  }

  async obtenerSolicitudes(): Promise<SolicitudEntity[]> {
    const result = await this.db.query(
      `SELECT * FROM solicitudes ORDER BY creado_en DESC`
    );
    return result.rows as SolicitudEntity[];
  }

  async actualizarEstadoSolicitud(
    solicitud_id: number,
    nuevo_estado_id: number
  ): Promise<SolicitudEntity> {
    const result = await this.db.query(
      `UPDATE solicitudes SET estado_id = $1, modificado_en = NOW() WHERE id = $2 RETURNING *`,
      [nuevo_estado_id, solicitud_id]
    );
    return result.rows[0] as SolicitudEntity;
  }
}
