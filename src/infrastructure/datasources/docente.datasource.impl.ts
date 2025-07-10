import { Pool } from "pg";
import { CreateDocenteDto, CustomError, DocenteDatasource, DocenteEntity, UpdateDocenteDto } from "../../domain";
import { DocenteMapper } from "../mappers/docente.mapper";
import { CreateEstudioAcademicoDto } from "../../domain/dtos/docente/create-docente.dto";
import { EstudioAcademicoEntity, CarreraEntity, InstitucionEntity, GradoAcademicoEntity, DocenteCarreraEntity, AsignaturaEntity, SolicitudEntity, DocenteAsignaturaEntity } from "../../domain/entities/docente.entity";
import { CreateDocenteCarreraDto, CreateSolicitudDto, CreateDocenteAsignaturaDto } from "../../domain/dtos/docente/create-docente.dto";
import fs from 'fs';
import path from 'path';


export class DocenteDatasourceImpl implements DocenteDatasource{

    constructor(
        private readonly db:Pool
    ){}
    async getPersonalInfo(docenteId: string): Promise<DocenteEntity> {
        try {
            const result = await this.db.query(
                `
                    SELECT
                    *
                    FROM
                    docentes
                    WHERE
                    usuario_id = $1
                `,
                [docenteId],
            );
            if(result.rows.length===0){
                throw CustomError.unauthorized('Docente not found');
            }
            const docente = result.rows[0];
            return DocenteMapper.docenteEntityFromObject(docente);
        } catch (error) {
            if(error instanceof CustomError){
                throw error
            }
            console.log(error)
            throw CustomError.internalServer('Internal server error');
        }
    }

    async getAllDocentes(): Promise<DocenteEntity[]> {
        try {
            const result = await this.db.query(
                `
                    SELECT 
                        d.*,
                        u.nombres as user_nombres,
                        u.apellidos as user_apellidos,
                        u.correo as user_correo,
                        u.rol_id,
                        u.carrera_id,
                        u.estado_id,
                        r.nombre as rol_nombre,
                        c.nombre as carrera_nombre,
                        e.nombre as estado_nombre,
                        cat.nombre as categoria_nombre,
                        mi.nombre as modalidad_ingreso_nombre
                    FROM docentes d
                    INNER JOIN usuarios u ON d.usuario_id = u.id
                    LEFT JOIN roles r ON u.rol_id = r.id
                    LEFT JOIN carreras c ON u.carrera_id = c.id
                    LEFT JOIN estados e ON u.estado_id = e.id
                    LEFT JOIN categoria_docente cat ON d.categoria_docente_id = cat.id
                    LEFT JOIN modalidades_ingreso mi ON d.modalidad_ingreso_id = mi.id
                    ORDER BY d.creado_en DESC
                `
            );
            
            return result.rows.map(docente => DocenteMapper.docenteEntityFromObject(docente));
        } catch (error) {
            if(error instanceof CustomError){
                throw error
            }
            console.log(error)
            throw CustomError.internalServer('Internal server error');
        }
    }

    async createDocente(createDocenteDto: CreateDocenteDto): Promise<DocenteEntity> {
        const {
            nombres, 
            apellidos,
            correo_electronico,
            usuario_id,
        } = createDocenteDto
        try {
           const result = await this.db.query(
            `
            INSERT INTO docentes (
                nombres,
                apellidos,
                correo_electronico,
                usuario_id
            ) VALUES (
              $1, $2, $3, $4
            )
            RETURNING *
            `,
            [nombres,apellidos,correo_electronico,usuario_id]
           )
           const docente = result.rows[0];
           console.log('Docente creado:', docente);
           return DocenteMapper.docenteEntityFromObject(docente)
        } catch (error) {
            if(error instanceof CustomError){
                throw error;
            }
            console.log(error)
            throw CustomError.badRequest(`${error}`);            
        }
    }

    async updateDocente(docenteId: string, update: UpdateDocenteDto): Promise<DocenteEntity> {
        // Construir dinámicamente el query y los valores
        const fields = [];
        const values = [];
        let idx = 1;
        for (const key in update) {
            if (update[key as keyof UpdateDocenteDto] !== undefined) {
                fields.push(`${key} = $${idx}`);
                values.push(update[key as keyof UpdateDocenteDto]);
                idx++;
            }
        }
        if (fields.length === 0) throw new Error('No hay campos para actualizar');
        values.push(docenteId);
        const query = `UPDATE docentes SET ${fields.join(', ')} WHERE usuario_id = $${idx} RETURNING *`;
        const result = await this.db.query(query, values);
        if (result.rows.length === 0) throw new Error('Docente no encontrado');
        return DocenteMapper.docenteEntityFromObject(result.rows[0]);
    }

    async createEstudioAcademico(dto: CreateEstudioAcademicoDto): Promise<EstudioAcademicoEntity> {
        const { titulo, documento_url, institucion_id, grado_academico_id, año_titulacion, docente_id } = dto;
        const result = await this.db.query(
            `INSERT INTO estudios_academicos (titulo, documento_url, institucion_id, grado_academico_id, año_titulacion, docente_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [titulo, documento_url, institucion_id, grado_academico_id, año_titulacion, docente_id]
        );
        return result.rows[0] as EstudioAcademicoEntity;
    }

    async getEstudiosAcademicosByDocente(docente_id: number): Promise<EstudioAcademicoEntity[]> {
        const result = await this.db.query(
            `SELECT 
                ea.*,
                i.nombre as institucion_nombre,
                ga.nombre as grado_academico_nombre
             FROM estudios_academicos ea
             LEFT JOIN institucion i ON ea.institucion_id = i.id
             LEFT JOIN grado_academico ga ON ea.grado_academico_id = ga.id
             WHERE ea.docente_id = $1
             ORDER BY ea.creado_en DESC`,
            [docente_id]
        );
        return result.rows as EstudioAcademicoEntity[];
    }

    async deleteEstudioAcademico(estudioId: number, docenteId: number): Promise<boolean> {
        // Primero obtener el estudio para verificar que pertenece al docente y obtener el nombre del archivo
        const estudioResult = await this.db.query(
            `SELECT * FROM estudios_academicos WHERE id = $1 AND docente_id = $2`,
            [estudioId, docenteId]
        );
        
        if (estudioResult.rows.length === 0) {
            throw CustomError.notFound('Estudio académico no encontrado o no tienes permisos');
        }
        
        const estudio = estudioResult.rows[0];
        
        // Eliminar el archivo físico
        const filePath = path.join(process.cwd(), 'uploads/estudios_academicos', estudio.documento_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Eliminar el registro de la base de datos
        const deleteResult = await this.db.query(
            `DELETE FROM estudios_academicos WHERE id = $1 AND docente_id = $2`,
            [estudioId, docenteId]
        );
        
        return (deleteResult.rowCount || 0) > 0;
    }

    async getCarreras(): Promise<CarreraEntity[]> {
        const result = await this.db.query('SELECT id, nombre, creado_en, modificado_en FROM carreras');
        return result.rows as CarreraEntity[];
    }

    async getInstituciones(): Promise<InstitucionEntity[]> {
        const result = await this.db.query('SELECT id, nombre, creado_en, modificado_en FROM institucion ORDER BY nombre');
        return result.rows as InstitucionEntity[];
    }

    async getGradosAcademicos(): Promise<GradoAcademicoEntity[]> {
        const result = await this.db.query('SELECT id, nombre, creado_en, modificado_en FROM grado_academico ORDER BY nombre');
        return result.rows as GradoAcademicoEntity[];
    }

    // Métodos para docentes_carreras
    async createDocenteCarrera(dto: CreateDocenteCarreraDto): Promise<DocenteCarreraEntity> {
        const { docente_id, carrera_id } = dto;
        try {
            // Verificar que el docente existe
            const docenteResult = await this.db.query('SELECT id FROM docentes WHERE id = $1', [docente_id]);
            if (docenteResult.rows.length === 0) {
                throw CustomError.notFound('Docente no encontrado');
            }

            // Verificar que la carrera existe
            const carreraResult = await this.db.query('SELECT id FROM carreras WHERE id = $1', [carrera_id]);
            if (carreraResult.rows.length === 0) {
                throw CustomError.notFound('Carrera no encontrada');
            }

            // Verificar que no existe ya esta relación
            const existingResult = await this.db.query(
                'SELECT id FROM docentes_carreras WHERE docente_id = $1 AND carrera_id = $2',
                [docente_id, carrera_id]
            );
            if (existingResult.rows.length > 0) {
                throw CustomError.badRequest('El docente ya está asociado a esta carrera');
            }

            const result = await this.db.query(
                `INSERT INTO docentes_carreras (docente_id, carrera_id)
                 VALUES ($1, $2)
                 RETURNING *`,
                [docente_id, carrera_id]
            );
            
            const docenteCarrera = result.rows[0];
            return new DocenteCarreraEntity(
                docenteCarrera.id,
                docenteCarrera.docente_id,
                docenteCarrera.carrera_id,
                docenteCarrera.creado_en,
                docenteCarrera.modificado_en
            );
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            console.log(error);
            throw CustomError.badRequest(`${error}`);
        }
    }

    async getDocenteCarreras(docente_id: number): Promise<DocenteCarreraEntity[]> {
        try {
            const result = await this.db.query(
                `SELECT 
                    dc.*,
                    d.nombres as docente_nombre,
                    c.nombre as carrera_nombre
                 FROM docentes_carreras dc
                 INNER JOIN docentes d ON dc.docente_id = d.id
                 INNER JOIN carreras c ON dc.carrera_id = c.id
                 WHERE dc.docente_id = $1
                 ORDER BY dc.creado_en DESC`,
                [docente_id]
            );
            
            return result.rows.map(row => new DocenteCarreraEntity(
                row.id,
                row.docente_id,
                row.carrera_id,
                row.creado_en,
                row.modificado_en,
                row.docente_nombre,
                row.carrera_nombre
            ));
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer('Error al obtener las carreras del docente');
        }
    }

    async deleteDocenteCarrera(id: number): Promise<boolean> {
        try {
            const result = await this.db.query(
                'DELETE FROM docentes_carreras WHERE id = $1 RETURNING id',
                [id]
            );
            return (result.rowCount ?? 0) > 0;
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer('Error al eliminar la relación docente-carrera');
        }
    }

    // Métodos para asignaturas
    async getAsignaturasByCarreras(carreraIds: number[]): Promise<AsignaturaEntity[]> {
        try {
            if (carreraIds.length === 0) {
                return [];
            }

            console.log('Buscando asignaturas para carreras:', carreraIds);

            // Crear placeholders para la consulta IN
            const placeholders = carreraIds.map((_, index) => `$${index + 1}`).join(',');
            
            // Intentar con diferentes nombres de tabla
            let query = `SELECT 
                a.*,
                c.nombre as carrera_nombre
             FROM asignaturas a
             INNER JOIN carreras c ON a.carrera_id = c.id
             WHERE a.carrera_id IN (${placeholders})
             ORDER BY c.nombre, a.sem ASC, a.materia`;
            
            console.log('Query SQL:', query);
            console.log('Parámetros:', carreraIds);
            
            try {
                const result = await this.db.query(query, carreraIds);
                console.log('Tabla "asignaturas" encontrada');
                console.log('Resultados encontrados:', result.rows.length);
                console.log('Primera fila:', result.rows[0]);
                return this.mapAsignaturas(result.rows);
            } catch (error) {
                console.log('Error con tabla "asignaturas", intentando con "materias"');
                
                query = `SELECT 
                    a.*,
                    c.nombre as carrera_nombre
                 FROM materias a
                 INNER JOIN carreras c ON a.carrera_id = c.id
                 WHERE a.carrera_id IN (${placeholders})
                 ORDER BY c.nombre, a.sem ASC, a.materia`;
                
                const result = await this.db.query(query, carreraIds);
                console.log('Tabla "materias" encontrada');
                console.log('Resultados encontrados:', result.rows.length);
                console.log('Primera fila:', result.rows[0]);
                return this.mapAsignaturas(result.rows);
            }
        } catch (error) {
            console.log('Error completo:', error);
            throw CustomError.internalServer('Error al obtener las asignaturas');
        }
    }

    private mapAsignaturas(rows: any[]): AsignaturaEntity[] {
        return rows.map(row => new AsignaturaEntity(
            row.id,
            row.gestion,
            row.periodo,
            row.materia,
            row.sem,
            row.semestres,
            row.carga_horaria,
            row.carrera_id,
            row.creado_en,
            row.modificado_en,
            row.carrera_nombre
        ));
    }

    // Métodos para solicitudes
    async createSolicitud(dto: CreateSolicitudDto): Promise<SolicitudEntity> {
        const { docente_id, tipo_solicitud, carrera_id, asignatura_id } = dto;
        try {
            // Verificar que el docente existe
            const docenteResult = await this.db.query('SELECT id FROM docentes WHERE id = $1', [docente_id]);
            if (docenteResult.rows.length === 0) {
                throw CustomError.notFound('Docente no encontrado');
            }

            // Verificar que la carrera existe si se especifica
            if (carrera_id) {
                const carreraResult = await this.db.query('SELECT id FROM carreras WHERE id = $1', [carrera_id]);
                if (carreraResult.rows.length === 0) {
                    throw CustomError.notFound('Carrera no encontrada');
                }
            }

            // Verificar que la asignatura existe si se especifica
            if (asignatura_id) {
                const asignaturaResult = await this.db.query('SELECT id FROM asignaturas WHERE id = $1', [asignatura_id]);
                if (asignaturaResult.rows.length === 0) {
                    throw CustomError.notFound('Asignatura no encontrada');
                }
            }

            // Verificar que no existe una solicitud pendiente similar
            const existingResult = await this.db.query(
                `SELECT id FROM solicitudes 
                 WHERE docente_id = $1 AND tipo_solicitud = $2 AND estado_id = 3
                 AND ((carrera_id = $3 AND $3 IS NOT NULL) OR (asignatura_id = $4 AND $4 IS NOT NULL))`,
                [docente_id, tipo_solicitud, carrera_id, asignatura_id]
            );
            if (existingResult.rows.length > 0) {
                throw CustomError.badRequest('Ya existe una solicitud pendiente similar');
            }

            // Obtener el estado_id para 'pendiente'
            const estado_id = 3; // ID correcto para 'pendiente'

            const result = await this.db.query(
                `INSERT INTO solicitudes (docente_id, tipo_solicitud, carrera_id, asignatura_id, estado_id)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [docente_id, tipo_solicitud, carrera_id, asignatura_id, estado_id]
            );
            
            const solicitud = result.rows[0];
            return this.mapSolicitud(solicitud);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            console.log(error);
            throw CustomError.badRequest(`${error}`);
        }
    }

    async getSolicitudesByDocente(docente_id: number): Promise<SolicitudEntity[]> {
        try {
            const result = await this.db.query(
                `SELECT 
                    s.*,
                    d.nombres as docente_nombre,
                    c.nombre as carrera_nombre,
                    a.materia as asignatura_nombre,
                    e.nombre as estado_nombre
                 FROM solicitudes s
                 INNER JOIN docentes d ON s.docente_id = d.id
                 LEFT JOIN carreras c ON s.carrera_id = c.id
                 LEFT JOIN asignaturas a ON s.asignatura_id = a.id
                 LEFT JOIN estados e ON s.estado_id = e.id
                 WHERE s.docente_id = $1
                 ORDER BY s.creado_en DESC`,
                [docente_id]
            );
            
            return result.rows.map(row => this.mapSolicitud(row));
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer('Error al obtener las solicitudes del docente');
        }
    }

    async getAllSolicitudes(): Promise<SolicitudEntity[]> {
        try {
            const result = await this.db.query(
                `SELECT 
                    s.*,
                    d.nombres as docente_nombre,
                    c.nombre as carrera_nombre,
                    a.materia as asignatura_nombre,
                    e.nombre as estado_nombre
                 FROM solicitudes s
                 INNER JOIN docentes d ON s.docente_id = d.id
                 LEFT JOIN carreras c ON s.carrera_id = c.id
                 LEFT JOIN asignaturas a ON s.asignatura_id = a.id
                 LEFT JOIN estados e ON s.estado_id = e.id
                 ORDER BY s.creado_en DESC`
            );
            
            return result.rows.map(row => this.mapSolicitud(row));
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer('Error al obtener todas las solicitudes');
        }
    }

    async updateSolicitudStatus(id: number, estado_id: number): Promise<SolicitudEntity> {
        try {
            // Obtener la solicitud actual
            const solicitudResult = await this.db.query(
                'SELECT * FROM solicitudes WHERE id = $1',
                [id]
            );
            
            if (solicitudResult.rows.length === 0) {
                throw CustomError.notFound('Solicitud no encontrada');
            }

            const solicitud = solicitudResult.rows[0];

            // Si se aprueba (estado_id = 1), crear la relación correspondiente
            if (estado_id === 1) {
                if (solicitud.tipo_solicitud === 'carrera' && solicitud.carrera_id) {
                    // Crear relación docente-carrera
                    await this.createDocenteCarrera({
                        docente_id: solicitud.docente_id,
                        carrera_id: solicitud.carrera_id
                    });
                } else if (solicitud.tipo_solicitud === 'asignatura' && solicitud.asignatura_id) {
                    // Crear relación docente-asignatura
                    await this.createDocenteAsignatura({
                        docente_id: solicitud.docente_id,
                        asignatura_id: solicitud.asignatura_id
                    });
                }
            }

            // Actualizar el estado de la solicitud
            const result = await this.db.query(
                `UPDATE solicitudes 
                 SET estado_id = $1, modificado_en = NOW()
                 WHERE id = $2
                 RETURNING *`,
                [estado_id, id]
            );
            
            return this.mapSolicitud(result.rows[0]);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            console.log(error);
            throw CustomError.internalServer('Error al actualizar el estado de la solicitud');
        }
    }

    private mapSolicitud(row: any): SolicitudEntity {
        return new SolicitudEntity(
            row.id,
            row.docente_id,
            row.tipo_solicitud,
            row.carrera_id,
            row.asignatura_id,
            row.estado_id,
            row.creado_en,
            row.modificado_en,
            row.docente_nombre,
            row.carrera_nombre,
            row.asignatura_nombre,
            row.estado_nombre
        );
    }

    // Métodos para docentes_asignaturas
    async createDocenteAsignatura(dto: CreateDocenteAsignaturaDto): Promise<DocenteAsignaturaEntity> {
        const { docente_id, asignatura_id } = dto;
        try {
            // Verificar que el docente existe
            const docenteResult = await this.db.query('SELECT id FROM docentes WHERE id = $1', [docente_id]);
            if (docenteResult.rows.length === 0) {
                throw CustomError.notFound('Docente no encontrado');
            }

            // Verificar que la asignatura existe
            const asignaturaResult = await this.db.query('SELECT id FROM asignaturas WHERE id = $1', [asignatura_id]);
            if (asignaturaResult.rows.length === 0) {
                throw CustomError.notFound('Asignatura no encontrada');
            }

            // Verificar que no existe ya esta relación
            const existingResult = await this.db.query(
                'SELECT id FROM docentes_asignaturas WHERE docente_id = $1 AND asignatura_id = $2',
                [docente_id, asignatura_id]
            );
            if (existingResult.rows.length > 0) {
                throw CustomError.badRequest('El docente ya está asociado a esta asignatura');
            }

            const result = await this.db.query(
                `INSERT INTO docentes_asignaturas (docente_id, asignatura_id)
                 VALUES ($1, $2)
                 RETURNING *`,
                [docente_id, asignatura_id]
            );
            
            const docenteAsignatura = result.rows[0];
            return this.mapDocenteAsignatura(docenteAsignatura);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            console.log(error);
            throw CustomError.badRequest(`${error}`);
        }
    }

    async getDocenteAsignaturas(docente_id: number): Promise<DocenteAsignaturaEntity[]> {
        try {
            const result = await this.db.query(
                `SELECT 
                    da.*,
                    d.nombres as docente_nombre,
                    a.materia as asignatura_nombre,
                    a.gestion,
                    a.periodo,
                    a.semestres
                 FROM docentes_asignaturas da
                 INNER JOIN docentes d ON da.docente_id = d.id
                 INNER JOIN asignaturas a ON da.asignatura_id = a.id
                 WHERE da.docente_id = $1
                 ORDER BY da.creado_en DESC`,
                [docente_id]
            );
            
            return result.rows.map(row => this.mapDocenteAsignatura(row));
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer('Error al obtener las asignaturas del docente');
        }
    }

    async deleteDocenteAsignatura(id: number): Promise<boolean> {
        try {
            const result = await this.db.query(
                'DELETE FROM docentes_asignaturas WHERE id = $1 RETURNING id',
                [id]
            );
            return (result.rowCount ?? 0) > 0;
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer('Error al eliminar la relación docente-asignatura');
        }
    }

    private mapDocenteAsignatura(row: any): DocenteAsignaturaEntity {
        return new DocenteAsignaturaEntity(
            row.id,
            row.docente_id,
            row.asignatura_id,
            row.creado_en,
            row.modificado_en,
            row.docente_nombre,
            row.asignatura_nombre,
            row.gestion,
            row.periodo,
            row.semestres
        );
    }
}