import { DocenteEntity } from "../../entities/docente.entity";
import { DocenteRepository } from "../../repositories/docente.repository";
import { UpdateDocenteDto, UploadPhotoDto, CreateEstudioAcademicoDto, UploadEstudioPDFDto } from "../../dtos/docente/create-docente.dto";
import { EstudioAcademicoEntity } from "../../entities/docente.entity";
import { CarreraEntity } from "../../entities/docente.entity";
import { InstitucionEntity } from "../../entities/docente.entity";
import { GradoAcademicoEntity } from "../../entities/docente.entity";
import { DocenteCarreraEntity } from "../../entities/docente.entity";
import { CreateDocenteCarreraDto } from "../../dtos/docente/create-docente.dto";
import { AsignaturaEntity } from "../../entities/docente.entity";
import { SolicitudEntity } from "../../entities/docente.entity";
import { CreateSolicitudDto } from "../../dtos/docente/create-docente.dto";
import { DocenteAsignaturaEntity } from "../../entities/docente.entity";
import { CreateDocenteAsignaturaDto } from "../../dtos/docente/create-docente.dto";


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

export class UpdatePersonalInfo {
    constructor(private readonly docenteRepository: DocenteRepository) {}
    async execute(docenteId: string, update: UpdateDocenteDto): Promise<DocenteEntity> {
        return this.docenteRepository.updateDocente(docenteId, update);
    }
}

export class UploadDocentePhoto {
    constructor(private readonly docenteRepository: DocenteRepository) {}
    
    async execute(docenteId: string, photoData: UploadPhotoDto): Promise<DocenteEntity> {
        // Actualizar solo el campo foto_docente
        const update = new UpdateDocenteDto();
        update.foto_docente = photoData.filename;
        
        return this.docenteRepository.updateDocente(docenteId, update);
    }
}

export class RegisterEstudioAcademico {
    constructor(private readonly docenteRepository: DocenteRepository) {}
    async execute(dto: CreateEstudioAcademicoDto): Promise<EstudioAcademicoEntity> {
        return this.docenteRepository.createEstudioAcademico(dto);
    }
}

export class GetEstudiosAcademicos {
    constructor(private readonly docenteRepository: DocenteRepository) {}
    async execute(docenteId: number): Promise<EstudioAcademicoEntity[]> {
        return this.docenteRepository.getEstudiosAcademicosByDocente(docenteId);
    }
}

export class DeleteEstudioAcademico {
    constructor(private readonly docenteRepository: DocenteRepository) {}
    async execute(estudioId: number, docenteId: number): Promise<boolean> {
        return this.docenteRepository.deleteEstudioAcademico(estudioId, docenteId);
    }
}

export class GetCarreras {
    constructor(private readonly docenteRepository: DocenteRepository) {}
    async execute(): Promise<CarreraEntity[]> {
        return this.docenteRepository.getCarreras();
    }
}

export class UpdateSolicitudStatusUseCase {
    constructor(private readonly docenteRepository: DocenteRepository) {}

    async execute(id: number, estado_id: number): Promise<SolicitudEntity> {
        return await this.docenteRepository.updateSolicitudStatus(id, estado_id);
    }
}

// Casos de uso para docentes_asignaturas
export class CreateDocenteAsignaturaUseCase {
    constructor(private readonly docenteRepository: DocenteRepository) {}

    async execute(dto: CreateDocenteAsignaturaDto): Promise<DocenteAsignaturaEntity> {
        return await this.docenteRepository.createDocenteAsignatura(dto);
    }
}

export class GetDocenteAsignaturasUseCase {
    constructor(private readonly docenteRepository: DocenteRepository) {}

    async execute(docente_id: number): Promise<DocenteAsignaturaEntity[]> {
        return await this.docenteRepository.getDocenteAsignaturas(docente_id);
    }
}

export class DeleteDocenteAsignaturaUseCase {
    constructor(private readonly docenteRepository: DocenteRepository) {}

    async execute(id: number): Promise<boolean> {
        return await this.docenteRepository.deleteDocenteAsignatura(id);
    }
}