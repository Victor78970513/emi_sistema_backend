import { DocenteRepository } from "../../repositories/docente.repository";

export class GetEstudiosByDocenteId {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(docenteId: number) {
        return await this.docenteRepository.getEstudiosAcademicosByDocente(docenteId);
    }
} 