import { DocenteRepository } from "../../repositories/docente.repository";

export class GetGradosAcademicos {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute() {
        return await this.docenteRepository.getGradosAcademicos();
    }
} 