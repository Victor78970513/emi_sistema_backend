import { DocenteRepository } from "../../repositories/docente.repository";
import { SolicitudEntity } from "../../entities/docente.entity";

interface GetAllSolicitudesUseCase {
    execute(): Promise<SolicitudEntity[]>;
}

export class GetAllSolicitudes implements GetAllSolicitudesUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(): Promise<SolicitudEntity[]> {
        return await this.docenteRepository.getAllSolicitudes();
    }
} 