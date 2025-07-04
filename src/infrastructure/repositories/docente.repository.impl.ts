import { CreateDocenteDto, DocenteDatasource, DocenteEntity, DocenteRepository } from "../../domain";
import { UpdateDocenteDto } from "../../domain/dtos/docente/create-docente.dto";
import { CreateEstudioAcademicoDto } from "../../domain/dtos/docente/create-docente.dto";
import { EstudioAcademicoEntity } from "../../domain/entities/docente.entity";



export class DocenteRepositoryImpl implements DocenteRepository{

    constructor(
        private readonly docenteDatasource: DocenteDatasource
    ){}

    createDocente(createDocenteDto: CreateDocenteDto): Promise<DocenteEntity> {
        return this.docenteDatasource.createDocente(createDocenteDto);
    }

    getPersonalInfo(docenteId: string): Promise<DocenteEntity> {
        return this.docenteDatasource.getPersonalInfo(docenteId);
    }    

    updateDocente(docenteId: string, update: UpdateDocenteDto) {
        return this.docenteDatasource.updateDocente(docenteId, update);
    }

    createEstudioAcademico(dto: CreateEstudioAcademicoDto): Promise<EstudioAcademicoEntity> {
        return this.docenteDatasource.createEstudioAcademico(dto);
    }

    getEstudiosAcademicosByDocente(docente_id: number): Promise<EstudioAcademicoEntity[]> {
        return this.docenteDatasource.getEstudiosAcademicosByDocente(docente_id);
    }

    deleteEstudioAcademico(estudioId: number, docenteId: number): Promise<boolean> {
        return this.docenteDatasource.deleteEstudioAcademico(estudioId, docenteId);
    }
}