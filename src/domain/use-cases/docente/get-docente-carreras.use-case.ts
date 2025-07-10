import { DocenteRepository } from "../../repositories/docente.repository";
import { DocenteCarreraEntity } from "../../entities/docente.entity";

interface GetDocenteCarrerasUseCase {
    execute(docente_id: number): Promise<DocenteCarreraEntity[]>;
}

export class GetDocenteCarreras implements GetDocenteCarrerasUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(docente_id: number): Promise<DocenteCarreraEntity[]> {
        return await this.docenteRepository.getDocenteCarreras(docente_id);
    }
} 