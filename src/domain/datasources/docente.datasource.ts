import { CreateDocenteDto } from "../dtos/docente/create-docente.dto";
import { DocenteEntity } from "../entities/docente.entity";
import { UpdateDocenteDto } from "../dtos/docente/create-docente.dto";
import { CreateEstudioAcademicoDto } from "../dtos/docente/create-docente.dto";
import { EstudioAcademicoEntity } from "../entities/docente.entity";


export abstract class DocenteDatasource{
    abstract createDocente(createDocenteDto: CreateDocenteDto):Promise<DocenteEntity>

    abstract getPersonalInfo(docenteId:string):Promise<DocenteEntity>

    abstract updateDocente(docenteId: string, update: UpdateDocenteDto): Promise<DocenteEntity>;

    abstract createEstudioAcademico(dto: CreateEstudioAcademicoDto): Promise<EstudioAcademicoEntity>;

    abstract getEstudiosAcademicosByDocente(docente_id: number): Promise<EstudioAcademicoEntity[]>;
}