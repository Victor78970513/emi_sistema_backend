import { DocenteRepository } from "../../repositories/docente.repository";
import { SolicitudEntity } from "../../entities/docente.entity";

interface UpdateSolicitudStatusUseCase {
    execute(id: number, estado_id: number): Promise<SolicitudEntity>;
}

export class UpdateSolicitudStatus implements UpdateSolicitudStatusUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(id: number, estado_id: number): Promise<SolicitudEntity> {
        return await this.docenteRepository.updateSolicitudStatus(id, estado_id);
    }
} 