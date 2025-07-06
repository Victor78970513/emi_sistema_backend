import { CreateDocenteDto, DocenteDatasource, DocenteEntity, DocenteRepository } from "../../domain";
import { UpdateDocenteDto } from "../../domain/dtos/docente/create-docente.dto";
import { CreateEstudioAcademicoDto } from "../../domain/dtos/docente/create-docente.dto";
import { EstudioAcademicoEntity } from "../../domain/entities/docente.entity";
import { CarreraEntity } from "../../domain/entities/docente.entity";
import { InstitucionEntity } from "../../domain/entities/docente.entity";
import { GradoAcademicoEntity } from "../../domain/entities/docente.entity";



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

    getAllDocentes(): Promise<DocenteEntity[]> {
        return this.docenteDatasource.getAllDocentes();
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

    getCarreras(): Promise<CarreraEntity[]> {
        return this.docenteDatasource.getCarreras();
    }

    getInstituciones(): Promise<InstitucionEntity[]> {
        return this.docenteDatasource.getInstituciones();
    }

    getGradosAcademicos(): Promise<GradoAcademicoEntity[]> {
        return this.docenteDatasource.getGradosAcademicos();
    }
}