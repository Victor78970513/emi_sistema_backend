import { Request, Response } from "express";
import { SolicitudRepository } from "../../domain/repositories/solicitud.repository";

export class SolicitudController {
  constructor(private readonly solicitudRepository: SolicitudRepository) {}

  crearSolicitud = async (req: Request, res: Response) => {
    const { docente_id, asignatura_id, carrera_id, motivo } = req.body;
    const nuevaSolicitud = await this.solicitudRepository.crearSolicitud(
      docente_id,
      asignatura_id ?? null,
      carrera_id ?? null,
      motivo
    );
    res.json(nuevaSolicitud);
  };

  obtenerSolicitudes = async (_req: Request, res: Response) => {
    const solicitudes = await this.solicitudRepository.obtenerSolicitudes();
    res.json(solicitudes);
  };

  actualizarEstadoSolicitud = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nuevo_estado_id } = req.body;
    const actualizada = await this.solicitudRepository.actualizarEstadoSolicitud(
      Number(id),
      Number(nuevo_estado_id)
    );
    res.json(actualizada);
  };
}
