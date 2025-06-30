import { CreateDocenteDto } from "../dtos/docente/create-docente.dto";
import { DocenteEntity } from "../entities/docente.entity";


export abstract class DocenteDatasource{
    abstract createDocente(createDocenteDto: CreateDocenteDto):Promise<DocenteEntity>

    abstract getPersonalInfo(docenteId:string):Promise<DocenteEntity>
}