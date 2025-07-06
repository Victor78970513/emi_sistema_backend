import { DocenteRepository } from "../../repositories/docente.repository";

export class GetAllDocentes {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute() {
        return await this.docenteRepository.getAllDocentes();
    }
} 