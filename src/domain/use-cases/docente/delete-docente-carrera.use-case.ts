import { DocenteRepository } from "../../repositories/docente.repository";

interface DeleteDocenteCarreraUseCase {
    execute(id: number): Promise<boolean>;
}

export class DeleteDocenteCarrera implements DeleteDocenteCarreraUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(id: number): Promise<boolean> {
        return await this.docenteRepository.deleteDocenteCarrera(id);
    }
} 