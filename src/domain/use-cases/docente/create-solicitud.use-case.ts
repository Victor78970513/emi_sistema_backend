import { DocenteRepository } from "../../repositories/docente.repository";
import { SolicitudEntity } from "../../entities/docente.entity";
import { CreateSolicitudDto } from "../../dtos/docente/create-docente.dto";

interface CreateSolicitudUseCase {
    execute(dto: CreateSolicitudDto): Promise<SolicitudEntity>;
}

export class CreateSolicitud implements CreateSolicitudUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(dto: CreateSolicitudDto): Promise<SolicitudEntity> {
        return await this.docenteRepository.createSolicitud(dto);
    }
} 