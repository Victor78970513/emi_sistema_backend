import { DocenteRepository } from "../../repositories/docente.repository";

interface DisassociateDocenteAsignaturaUseCase {
    execute(asignatura_id: number, docente_id: number): Promise<boolean>;
}

export class DisassociateDocenteAsignatura implements DisassociateDocenteAsignaturaUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(asignatura_id: number, docente_id: number): Promise<boolean> {
        return await this.docenteRepository.deleteDocenteAsignaturaByAsignaturaAndDocente(asignatura_id, docente_id);
    }
} 