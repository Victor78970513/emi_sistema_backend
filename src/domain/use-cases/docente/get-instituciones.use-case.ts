import { DocenteRepository } from "../../repositories/docente.repository";

export class GetInstituciones {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute() {
        return await this.docenteRepository.getInstituciones();
    }
} 