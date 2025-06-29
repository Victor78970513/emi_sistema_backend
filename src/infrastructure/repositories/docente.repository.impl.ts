import { CreateDocenteDto, DocenteDatasource, DocenteEntity, DocenteRepository } from "../../domain";



export class DocenteRepositoryImpl implements DocenteRepository{

    constructor(
        private readonly docenteDatasource: DocenteDatasource
    ){}

    createDocente(createDocenteDto: CreateDocenteDto): Promise<DocenteEntity> {
        return this.docenteDatasource.createDocente(createDocenteDto);
    }
}