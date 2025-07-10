import { DocenteRepository } from "../../repositories/docente.repository";
import { SolicitudEntity } from "../../entities/docente.entity";

interface GetSolicitudesByDocenteUseCase {
    execute(docente_id: number): Promise<SolicitudEntity[]>;
}

export class GetSolicitudesByDocente implements GetSolicitudesByDocenteUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(docente_id: number): Promise<SolicitudEntity[]> {
        return await this.docenteRepository.getSolicitudesByDocente(docente_id);
    }
} 