import { DocenteRepository } from "../../repositories/docente.repository";

interface GetAsignaturasByCarreraUseCase {
    execute(carrera_id: number): Promise<any>;
}

export class GetAsignaturasByCarrera implements GetAsignaturasByCarreraUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(carrera_id: number): Promise<any> {
        return await this.docenteRepository.getAsignaturasByCarrera(carrera_id);
    }
} 