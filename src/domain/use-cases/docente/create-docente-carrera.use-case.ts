import { DocenteRepository } from "../../repositories/docente.repository";
import { DocenteCarreraEntity } from "../../entities/docente.entity";
import { CreateDocenteCarreraDto } from "../../dtos/docente/create-docente.dto";

interface CreateDocenteCarreraUseCase {
    execute(dto: CreateDocenteCarreraDto): Promise<DocenteCarreraEntity>;
}

export class CreateDocenteCarrera implements CreateDocenteCarreraUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(dto: CreateDocenteCarreraDto): Promise<DocenteCarreraEntity> {
        return await this.docenteRepository.createDocenteCarrera(dto);
    }
} 