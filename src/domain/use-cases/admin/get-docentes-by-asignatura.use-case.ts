import { DocenteRepository } from "../../repositories/docente.repository";

interface GetDocentesByAsignaturaUseCase {
    execute(asignatura_id: number): Promise<any>;
}

export class GetDocentesByAsignatura implements GetDocentesByAsignaturaUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(asignatura_id: number): Promise<any> {
        return await this.docenteRepository.getDocentesByAsignatura(asignatura_id);
    }
} 