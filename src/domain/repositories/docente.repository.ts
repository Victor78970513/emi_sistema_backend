import { CreateDocenteDto } from "../dtos/docente/create-docente.dto";
import { DocenteEntity } from "../entities/docente.entity";


export abstract class DocenteRepository{
    abstract createDocente(createDocenteDto: CreateDocenteDto):Promise<DocenteEntity>
}