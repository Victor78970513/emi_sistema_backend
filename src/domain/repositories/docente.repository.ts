import { CreateDocenteDto } from "../dtos/docente/create-docente.dto";
import { DocenteEntity } from "../entities/docente.entity";
import { UpdateDocenteDto } from "../dtos/docente/create-docente.dto";
import { CreateEstudioAcademicoDto } from "../dtos/docente/create-docente.dto";
import { EstudioAcademicoEntity } from "../entities/docente.entity";
import { CarreraEntity, InstitucionEntity, GradoAcademicoEntity, DocenteCarreraEntity, AsignaturaEntity, SolicitudEntity, DocenteAsignaturaEntity } from "../entities/docente.entity";
import { CreateDocenteCarreraDto, CreateSolicitudDto, CreateDocenteAsignaturaDto } from "../dtos/docente/create-docente.dto";


export abstract class DocenteRepository{
    abstract createDocente(createDocenteDto: CreateDocenteDto):Promise<DocenteEntity>

    abstract getPersonalInfo(docenteId:string):Promise<DocenteEntity>

    abstract getDocenteById(docenteId: number): Promise<DocenteEntity>

    abstract getAllDocentes(): Promise<DocenteEntity[]>

    abstract updateDocente(docenteId: string, update: UpdateDocenteDto): Promise<DocenteEntity>

    abstract createEstudioAcademico(dto: CreateEstudioAcademicoDto): Promise<EstudioAcademicoEntity>;
    abstract getEstudiosAcademicosByDocente(docente_id: number): Promise<EstudioAcademicoEntity[]>;
    abstract deleteEstudioAcademico(estudioId: number, docenteId: number): Promise<boolean>;

    abstract getCarreras(): Promise<CarreraEntity[]>;

    abstract getInstituciones(): Promise<InstitucionEntity[]>;

    abstract getGradosAcademicos(): Promise<GradoAcademicoEntity[]>;

    // Métodos para docentes_carreras
    abstract createDocenteCarrera(dto: CreateDocenteCarreraDto): Promise<DocenteCarreraEntity>;
    abstract getDocenteCarreras(docente_id: number): Promise<DocenteCarreraEntity[]>;
    abstract deleteDocenteCarrera(id: number): Promise<boolean>;

    // Métodos para asignaturas
    abstract getAsignaturasByCarreras(carreraIds: number[]): Promise<AsignaturaEntity[]>;

    // Métodos para solicitudes
    abstract createSolicitud(dto: CreateSolicitudDto): Promise<SolicitudEntity>;
    abstract getSolicitudesByDocente(docente_id: number): Promise<SolicitudEntity[]>;
    abstract getSolicitudesPendientesByDocente(docente_id: number): Promise<SolicitudEntity[]>;
    abstract getAllSolicitudes(): Promise<SolicitudEntity[]>;
    abstract updateSolicitudStatus(id: number, estado_id: number, motivo_rechazo?: string): Promise<SolicitudEntity>;

    // Métodos para docentes_asignaturas
    abstract createDocenteAsignatura(dto: CreateDocenteAsignaturaDto): Promise<DocenteAsignaturaEntity>;
    abstract getDocenteAsignaturas(docente_id: number): Promise<DocenteAsignaturaEntity[]>;
    abstract deleteDocenteAsignatura(id: number): Promise<boolean>;
    abstract deleteDocenteAsignaturaByAsignaturaAndDocente(asignatura_id: number, docente_id: number): Promise<boolean>;

    // Métodos para admin - asignaturas
    abstract getAllAsignaturasByCarreras(): Promise<any[]>;
    abstract getAsignaturaById(asignatura_id: number): Promise<any>;
    abstract getDocentesByAsignatura(asignatura_id: number): Promise<any>;
    abstract getAsignaturasByCarrera(carrera_id: number): Promise<any>;
}