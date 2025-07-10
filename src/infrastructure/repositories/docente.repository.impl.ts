import { CreateDocenteDto, DocenteDatasource, DocenteEntity, DocenteRepository } from "../../domain";
import { UpdateDocenteDto } from "../../domain/dtos/docente/create-docente.dto";
import { CreateEstudioAcademicoDto } from "../../domain/dtos/docente/create-docente.dto";
import { EstudioAcademicoEntity } from "../../domain/entities/docente.entity";
import { CarreraEntity } from "../../domain/entities/docente.entity";
import { InstitucionEntity } from "../../domain/entities/docente.entity";
import { GradoAcademicoEntity } from "../../domain/entities/docente.entity";
import { DocenteCarreraEntity } from "../../domain/entities/docente.entity";
import { CreateDocenteCarreraDto } from "../../domain/dtos/docente/create-docente.dto";
import { AsignaturaEntity } from "../../domain/entities/docente.entity";
import { SolicitudEntity } from "../../domain/entities/docente.entity";
import { CreateSolicitudDto } from "../../domain/dtos/docente/create-docente.dto";
import { DocenteAsignaturaEntity } from "../../domain/entities/docente.entity";
import { CreateDocenteAsignaturaDto } from "../../domain/dtos/docente/create-docente.dto";


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

    // Métodos para docentes_carreras
    createDocenteCarrera(dto: CreateDocenteCarreraDto): Promise<DocenteCarreraEntity> {
        return this.docenteDatasource.createDocenteCarrera(dto);
    }

    getDocenteCarreras(docente_id: number): Promise<DocenteCarreraEntity[]> {
        return this.docenteDatasource.getDocenteCarreras(docente_id);
    }

    deleteDocenteCarrera(id: number): Promise<boolean> {
        return this.docenteDatasource.deleteDocenteCarrera(id);
    }

    // Métodos para asignaturas
    getAsignaturasByCarreras(carreraIds: number[]): Promise<AsignaturaEntity[]> {
        return this.docenteDatasource.getAsignaturasByCarreras(carreraIds);
    }

    // Métodos para solicitudes
    createSolicitud(dto: CreateSolicitudDto): Promise<SolicitudEntity> {
        return this.docenteDatasource.createSolicitud(dto);
    }

    getSolicitudesByDocente(docente_id: number): Promise<SolicitudEntity[]> {
        return this.docenteDatasource.getSolicitudesByDocente(docente_id);
    }

    getAllSolicitudes(): Promise<SolicitudEntity[]> {
        return this.docenteDatasource.getAllSolicitudes();
    }

    updateSolicitudStatus(id: number, estado_id: number): Promise<SolicitudEntity> {
        return this.docenteDatasource.updateSolicitudStatus(id, estado_id);
    }

    // Métodos para docentes_asignaturas
    createDocenteAsignatura(dto: CreateDocenteAsignaturaDto): Promise<DocenteAsignaturaEntity> {
        return this.docenteDatasource.createDocenteAsignatura(dto);
    }

    getDocenteAsignaturas(docente_id: number): Promise<DocenteAsignaturaEntity[]> {
        return this.docenteDatasource.getDocenteAsignaturas(docente_id);
    }

    deleteDocenteAsignatura(id: number): Promise<boolean> {
        return this.docenteDatasource.deleteDocenteAsignatura(id);
    }
}