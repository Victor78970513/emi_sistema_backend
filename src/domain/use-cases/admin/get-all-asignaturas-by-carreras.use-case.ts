import { DocenteRepository } from "../../repositories/docente.repository";

interface GetAllAsignaturasByCarrerasUseCase {
    execute(): Promise<any[]>;
}

export class GetAllAsignaturasByCarreras implements GetAllAsignaturasByCarrerasUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(): Promise<any[]> {
        return await this.docenteRepository.getAllAsignaturasByCarreras();
    }
} 