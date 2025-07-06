import { CreateDocenteDto } from "../dtos/docente/create-docente.dto";
import { DocenteEntity } from "../entities/docente.entity";
import { UpdateDocenteDto } from "../dtos/docente/create-docente.dto";
import { CreateEstudioAcademicoDto } from "../dtos/docente/create-docente.dto";
import { EstudioAcademicoEntity } from "../entities/docente.entity";
import { CarreraEntity, InstitucionEntity, GradoAcademicoEntity } from "../entities/docente.entity";


export abstract class DocenteRepository{
    abstract createDocente(createDocenteDto: CreateDocenteDto):Promise<DocenteEntity>

    abstract getPersonalInfo(docenteId:string):Promise<DocenteEntity>

    abstract getAllDocentes(): Promise<DocenteEntity[]>

    abstract updateDocente(docenteId: string, update: UpdateDocenteDto): Promise<DocenteEntity>

    abstract createEstudioAcademico(dto: CreateEstudioAcademicoDto): Promise<EstudioAcademicoEntity>;
    abstract getEstudiosAcademicosByDocente(docente_id: number): Promise<EstudioAcademicoEntity[]>;
    abstract deleteEstudioAcademico(estudioId: number, docenteId: number): Promise<boolean>;

    abstract getCarreras(): Promise<CarreraEntity[]>;

    abstract getInstituciones(): Promise<InstitucionEntity[]>;

    abstract getGradosAcademicos(): Promise<GradoAcademicoEntity[]>;
}