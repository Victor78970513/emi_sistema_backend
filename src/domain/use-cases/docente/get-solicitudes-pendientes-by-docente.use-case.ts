import { DocenteRepository } from "../../repositories/docente.repository";
import { SolicitudEntity } from "../../entities/docente.entity";

interface GetSolicitudesPendientesByDocenteUseCase {
    execute(docente_id: number): Promise<SolicitudEntity[]>;
}

export class GetSolicitudesPendientesByDocente implements GetSolicitudesPendientesByDocenteUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(docente_id: number): Promise<SolicitudEntity[]> {
        return await this.docenteRepository.getSolicitudesPendientesByDocente(docente_id);
    }
} 