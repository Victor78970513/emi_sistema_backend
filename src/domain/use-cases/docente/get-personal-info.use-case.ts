import { DocenteEntity } from "../../entities/docente.entity";
import { DocenteRepository } from "../../repositories/docente.repository";


interface GetPersonalInfoUseCase{
    execute(docenteId:string):Promise<DocenteEntity>;
}

export class GetPersonalInfo implements GetPersonalInfoUseCase{

    constructor(
        private readonly docenteRepository: DocenteRepository
    ){}

    async execute(docenteId: string): Promise<DocenteEntity> {
        const response = await this.docenteRepository.getPersonalInfo(docenteId);
        const docente = new DocenteEntity(
            response.docente_id,
            response.nombres,
            response.apellidos,
            response.carnet_identidad,
            response.genero,
            response.correo_electronico,
            response.foto_docente,
            response.fecha_nacimiento,
            response.experiencia_profesional,
            response.experiencia_academica,
            response.categoria_docente_id,
            response.modalidad_ingreso_id,
            response.usuario_id,
        );
        return docente;
    }
}