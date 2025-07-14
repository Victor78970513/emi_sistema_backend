import { DocenteRepository } from "../../repositories/docente.repository";
import { CreateDocenteAsignaturaDto } from "../../dtos/docente/create-docente.dto";
import { DocenteAsignaturaEntity } from "../../entities/docente.entity";

interface AssociateDocenteAsignaturaUseCase {
    execute(dto: CreateDocenteAsignaturaDto): Promise<DocenteAsignaturaEntity>;
}

export class AssociateDocenteAsignatura implements AssociateDocenteAsignaturaUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(dto: CreateDocenteAsignaturaDto): Promise<DocenteAsignaturaEntity> {
        return await this.docenteRepository.createDocenteAsignatura(dto);
    }
} 