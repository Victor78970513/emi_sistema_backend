import { DocenteRepository } from "../../repositories/docente.repository";
import { DocenteEntity } from "../../entities/docente.entity";

interface GetDocenteByIdUseCase {
    execute(docenteId: number): Promise<DocenteEntity>;
}

export class GetDocenteById implements GetDocenteByIdUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(docenteId: number): Promise<DocenteEntity> {
        return await this.docenteRepository.getDocenteById(docenteId);
    }
} 