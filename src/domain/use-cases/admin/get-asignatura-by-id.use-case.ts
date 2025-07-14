import { DocenteRepository } from "../../repositories/docente.repository";

interface GetAsignaturaByIdUseCase {
    execute(asignatura_id: number): Promise<any>;
}

export class GetAsignaturaById implements GetAsignaturaByIdUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(asignatura_id: number): Promise<any> {
        return await this.docenteRepository.getAsignaturaById(asignatura_id);
    }
} 