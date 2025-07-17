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

    async getDocenteById(docenteId: number): Promise<DocenteEntity> {
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
                    WHERE d.id = $1
                `,
                [docenteId]
            );
            
            if (result.rows.length === 0) {
                throw CustomError.notFound('Docente no encontrado');
            }
            
            return DocenteMapper.docenteEntityFromObject(result.rows[0]);
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
              UPPER($1), UPPER($2), $3, $4
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

            // Validación de carga horaria si es solicitud de asignatura
            if (tipo_solicitud === 'asignatura' && asignatura_id) {
                // Obtener carga_horaria de la asignatura
                const asignaturaResult = await this.db.query('SELECT id, carga_horaria FROM asignaturas WHERE id = $1', [asignatura_id]);
                if (asignaturaResult.rows.length === 0) {
                    throw CustomError.notFound('Asignatura no encontrada');
                }
                const carga_horaria = asignaturaResult.rows[0].carga_horaria;
                const horas_semanales_nueva = carga_horaria / 40;
                // Calcular la carga horaria semanal actual del docente
                const horasResult = await this.db.query(
                    `SELECT SUM(a.carga_horaria) as total_carga
                     FROM docentes_asignaturas da
                     INNER JOIN asignaturas a ON da.asignatura_id = a.id
                     WHERE da.docente_id = $1`,
                    [docente_id]
                );
                const total_carga = horasResult.rows[0].total_carga || 0;
                const horas_semanales_actual = total_carga / 40;
                const horas_semanales_total = horas_semanales_actual + horas_semanales_nueva;
                // LOGS PARA DEPURACIÓN
                console.log('--- VALIDACIÓN DE CARGA HORARIA (SOLICITUD) ---');
                console.log('Docente ID:', docente_id);
                console.log('Horas semanales actuales:', horas_semanales_actual);
                console.log('Horas semanales nueva asignatura:', horas_semanales_nueva);
                console.log('Horas semanales total:', horas_semanales_total);
                // FIN LOGS
                if (horas_semanales_total >= 25) {
                    throw CustomError.badRequest('No se puede solicitar: el docente igualaría o superaría las 25 horas semanales.');
                }
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

            // Verificar que el docente no esté ya asociado a la carrera/asignatura
            if (tipo_solicitud === 'carrera' && carrera_id) {
                const carreraAsociadaResult = await this.db.query(
                    'SELECT id FROM docentes_carreras WHERE docente_id = $1 AND carrera_id = $2',
                    [docente_id, carrera_id]
                );
                if (carreraAsociadaResult.rows.length > 0) {
                    throw CustomError.badRequest('El docente ya está asociado a esta carrera');
                }
            }

            if (tipo_solicitud === 'asignatura' && asignatura_id) {
                const asignaturaAsociadaResult = await this.db.query(
                    'SELECT id FROM docentes_asignaturas WHERE docente_id = $1 AND asignatura_id = $2',
                    [docente_id, asignatura_id]
                );
                if (asignaturaAsociadaResult.rows.length > 0) {
                    throw CustomError.badRequest('El docente ya está asociado a esta asignatura');
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
                throw CustomError.badRequest('Ya existe una solicitud pendiente para esta carrera/asignatura');
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
            
            // Obtener información adicional del docente y relacionados
            const solicitudCompleta = await this.db.query(
                `SELECT 
                    s.*,
                    d.nombres as docente_nombre,
                    d.apellidos as docente_apellidos,
                    c.nombre as carrera_nombre,
                    a.materia as asignatura_nombre,
                    e.nombre as estado_nombre
                 FROM solicitudes s
                 INNER JOIN docentes d ON s.docente_id = d.id
                 LEFT JOIN carreras c ON s.carrera_id = c.id
                 LEFT JOIN asignaturas a ON s.asignatura_id = a.id
                 LEFT JOIN estados e ON s.estado_id = e.id
                 WHERE s.id = $1`,
                [solicitud.id]
            );
            
            return this.mapSolicitud(solicitudCompleta.rows[0]);
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
                    d.apellidos as docente_apellidos,
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

    async getSolicitudesPendientesByDocente(docente_id: number): Promise<SolicitudEntity[]> {
        try {
            const result = await this.db.query(
                `SELECT 
                    s.*,
                    d.nombres as docente_nombre,
                    d.apellidos as docente_apellidos,
                    c.nombre as carrera_nombre,
                    a.materia as asignatura_nombre,
                    e.nombre as estado_nombre
                 FROM solicitudes s
                 INNER JOIN docentes d ON s.docente_id = d.id
                 LEFT JOIN carreras c ON s.carrera_id = c.id
                 LEFT JOIN asignaturas a ON s.asignatura_id = a.id
                 LEFT JOIN estados e ON s.estado_id = e.id
                 WHERE s.docente_id = $1 AND s.estado_id = 3
                 ORDER BY s.creado_en DESC`,
                [docente_id]
            );
            
            return result.rows.map(row => this.mapSolicitud(row));
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer('Error al obtener las solicitudes pendientes del docente');
        }
    }

    async getAllSolicitudes(): Promise<SolicitudEntity[]> {
        try {
            const result = await this.db.query(
                `SELECT 
                    s.*,
                    d.nombres as docente_nombre,
                    d.apellidos as docente_apellidos,
                    c.nombre as carrera_nombre,
                    a.materia as asignatura_nombre,
                    e.nombre as estado_nombre
                 FROM solicitudes s
                 INNER JOIN docentes d ON s.docente_id = d.id
                 LEFT JOIN carreras c ON s.carrera_id = c.id
                 LEFT JOIN asignaturas a ON s.asignatura_id = a.id
                 LEFT JOIN estados e ON s.estado_id = e.id
                 ORDER BY 
                    CASE s.estado_id 
                        WHEN 3 THEN 1  -- Pendientes primero
                        WHEN 1 THEN 2  -- Aprobadas segundo
                        WHEN 2 THEN 3  -- Rechazadas tercero
                        ELSE 4
                    END,
                    s.creado_en DESC`
            );
            
            return result.rows.map(row => this.mapSolicitud(row));
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer('Error al obtener todas las solicitudes');
        }
    }

    async updateSolicitudStatus(id: number, estado_id: number, motivo_rechazo?: string): Promise<SolicitudEntity> {
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
            
            // Obtener la solicitud actualizada con información completa
            const solicitudCompleta = await this.db.query(
                `SELECT 
                    s.*,
                    d.nombres as docente_nombre,
                    d.apellidos as docente_apellidos,
                    c.nombre as carrera_nombre,
                    a.materia as asignatura_nombre,
                    e.nombre as estado_nombre
                 FROM solicitudes s
                 INNER JOIN docentes d ON s.docente_id = d.id
                 LEFT JOIN carreras c ON s.carrera_id = c.id
                 LEFT JOIN asignaturas a ON s.asignatura_id = a.id
                 LEFT JOIN estados e ON s.estado_id = e.id
                 WHERE s.id = $1`,
                [id]
            );
            
            return this.mapSolicitud(solicitudCompleta.rows[0]);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            console.log(error);
            throw CustomError.internalServer('Error al actualizar el estado de la solicitud');
        }
    }

    async getAsignaturasByCarrera(carrera_id: number): Promise<any> {
        try {
            // Primero obtener información de la carrera
            const carreraResult = await this.db.query(`
                SELECT id, nombre FROM carreras WHERE id = $1
            `, [carrera_id]);

            if (carreraResult.rows.length === 0) {
                throw CustomError.notFound('Carrera no encontrada');
            }

            const carrera = carreraResult.rows[0];

            // Obtener asignaturas de la carrera con docentes asociados
            const asignaturasResult = await this.db.query(`
                SELECT 
                    a.id,
                    a.materia,
                    a.gestion,
                    a.periodo,
                    a.sem,
                    a.semestres,
                    a.carga_horaria,
                    a.carrera_id,
                    a.creado_en,
                    a.modificado_en,
                    STRING_AGG(
                        CONCAT(d.nombres, ' ', d.apellidos), 
                        ', ' ORDER BY d.nombres, d.apellidos
                    ) as docentes_asociados
                FROM asignaturas a
                LEFT JOIN docentes_asignaturas da ON a.id = da.asignatura_id
                LEFT JOIN docentes d ON da.docente_id = d.id
                WHERE a.carrera_id = $1
                GROUP BY a.id, a.materia, a.gestion, a.periodo, a.sem, a.semestres, a.carga_horaria, a.carrera_id, a.creado_en, a.modificado_en
                ORDER BY a.sem, a.materia
            `, [carrera_id]);

            return {
                carrera: {
                    id: carrera.id,
                    nombre: carrera.nombre
                },
                asignaturas: asignaturasResult.rows.map(row => DocenteMapper.asignaturaEntityFromObject({
                    ...row,
                    docentes_asociados: row.docentes_asociados || 'Sin docentes asignados'
                }))
            };
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            console.log(error);
            throw CustomError.internalServer('Error al obtener asignaturas de la carrera');
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
            null, // motivo_rechazo - será null hasta que se agregue la columna
            row.docente_nombre,
            row.docente_apellidos,
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

            // Verificar que la asignatura existe y obtener su carga_horaria
            const asignaturaResult = await this.db.query('SELECT id, carga_horaria FROM asignaturas WHERE id = $1', [asignatura_id]);
            if (asignaturaResult.rows.length === 0) {
                throw CustomError.notFound('Asignatura no encontrada');
            }
            const carga_horaria = asignaturaResult.rows[0].carga_horaria;
            const horas_semanales_nueva = carga_horaria / 40;

            // Calcular la carga horaria semanal actual del docente
            const horasResult = await this.db.query(
                `SELECT SUM(a.carga_horaria) as total_carga
                 FROM docentes_asignaturas da
                 INNER JOIN asignaturas a ON da.asignatura_id = a.id
                 WHERE da.docente_id = $1`,
                [docente_id]
            );
            const total_carga = horasResult.rows[0].total_carga || 0;
            const horas_semanales_actual = total_carga / 40;
            const horas_semanales_total = horas_semanales_actual + horas_semanales_nueva;
            // LOGS PARA DEPURACIÓN
            console.log('--- VALIDACIÓN DE CARGA HORARIA ---');
            console.log('Docente ID:', docente_id);
            console.log('Horas semanales actuales:', horas_semanales_actual);
            console.log('Horas semanales nueva asignatura:', horas_semanales_nueva);
            console.log('Horas semanales total:', horas_semanales_total);
            // FIN LOGS
            if (horas_semanales_total >= 25) {
                throw CustomError.badRequest('No se puede asociar: el docente igualaría o superaría las 25 horas semanales.');
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
                    a.semestres,
                    a.carga_horaria,
                    c.nombre as carrera_nombre
                 FROM docentes_asignaturas da
                 INNER JOIN docentes d ON da.docente_id = d.id
                 INNER JOIN asignaturas a ON da.asignatura_id = a.id
                 INNER JOIN carreras c ON a.carrera_id = c.id
                 WHERE da.docente_id = $1
                 ORDER BY da.creado_en DESC`,
                [docente_id]
            );
            // Agregar campo horas_semanales calculado
            return result.rows.map(row => {
                const horas_semanales = row.carga_horaria ? row.carga_horaria / 40 : 0;
                const entity = this.mapDocenteAsignatura(row);
                (entity as any).horas_semanales = horas_semanales;
                (entity as any).carga_horaria = row.carga_horaria;
                (entity as any).carrera_nombre = row.carrera_nombre;
                return entity;
            });
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer('Error al obtener las asignaturas del docente');
        }
    }

    async deleteDocenteAsignatura(id: number): Promise<boolean> {
        try {
            const result = await this.db.query(
                'DELETE FROM docentes_asignaturas WHERE id = $1 RETURNING *',
                [id]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer('Error al eliminar relación docente-asignatura');
        }
    }

    async deleteDocenteAsignaturaByAsignaturaAndDocente(asignatura_id: number, docente_id: number): Promise<boolean> {
        try {
            const result = await this.db.query(
                'DELETE FROM docentes_asignaturas WHERE asignatura_id = $1 AND docente_id = $2 RETURNING *',
                [asignatura_id, docente_id]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer('Error al eliminar relación docente-asignatura');
        }
    }

    // Métodos para admin - asignaturas
    async getAllAsignaturasByCarreras(): Promise<any[]> {
        try {
            const result = await this.db.query(`
                SELECT 
                    c.id as carrera_id,
                    c.nombre as carrera_nombre,
                    a.id as asignatura_id,
                    a.materia,
                    a.gestion,
                    a.periodo,
                    a.sem,
                    a.semestres,
                    a.carga_horaria
                FROM carreras c
                LEFT JOIN asignaturas a ON c.id = a.carrera_id
                ORDER BY c.nombre, a.sem, a.materia
            `);

            // Agrupar por carreras
            const carrerasMap = new Map();
            
            result.rows.forEach(row => {
                const carreraId = row.carrera_id;
                
                if (!carrerasMap.has(carreraId)) {
                    carrerasMap.set(carreraId, {
                        id: carreraId,
                        nombre: row.carrera_nombre,
                        asignaturas: []
                    });
                }
                
                if (row.asignatura_id) {
                    carrerasMap.get(carreraId).asignaturas.push({
                        id: row.asignatura_id,
                        materia: row.materia,
                        gestion: row.gestion,
                        periodo: row.periodo,
                        sem: row.sem,
                        semestres: row.semestres,
                        carga_horaria: row.carga_horaria
                    });
                }
            });

            return Array.from(carrerasMap.values());
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer('Error al obtener asignaturas por carreras');
        }
    }

    async getAsignaturaById(asignatura_id: number): Promise<any> {
        try {
            const result = await this.db.query(`
                SELECT 
                    a.id,
                    a.materia,
                    a.gestion,
                    a.periodo,
                    a.sem,
                    a.semestres,
                    a.carga_horaria,
                    a.creado_en,
                    a.modificado_en,
                    c.id as carrera_id,
                    c.nombre as carrera_nombre
                FROM asignaturas a
                LEFT JOIN carreras c ON a.carrera_id = c.id
                WHERE a.id = $1
            `, [asignatura_id]);

            if (result.rows.length === 0) {
                throw CustomError.notFound('Asignatura no encontrada');
            }

            const asignatura = result.rows[0];
            return {
                id: asignatura.id,
                materia: asignatura.materia,
                gestion: asignatura.gestion,
                periodo: asignatura.periodo,
                sem: asignatura.sem,
                semestres: asignatura.semestres,
                carga_horaria: asignatura.carga_horaria,
                creado_en: asignatura.creado_en,
                modificado_en: asignatura.modificado_en,
                carrera: {
                    id: asignatura.carrera_id,
                    nombre: asignatura.carrera_nombre
                }
            };
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            console.log(error);
            throw CustomError.internalServer('Error al obtener asignatura');
        }
    }

    async getDocentesByAsignatura(asignatura_id: number): Promise<any> {
        try {
            // Primero obtener información de la asignatura
            const asignaturaResult = await this.db.query(`
                SELECT id, materia FROM asignaturas WHERE id = $1
            `, [asignatura_id]);

            if (asignaturaResult.rows.length === 0) {
                throw CustomError.notFound('Asignatura no encontrada');
            }

            const asignatura = asignaturaResult.rows[0];

            // Obtener docentes asociados a la asignatura
            const docentesResult = await this.db.query(`
                SELECT 
                    d.id,
                    d.nombres,
                    d.apellidos,
                    d.correo_electronico,
                    d.foto_docente
                FROM docentes d
                INNER JOIN docentes_asignaturas da ON d.id = da.docente_id
                WHERE da.asignatura_id = $1
                ORDER BY d.apellidos, d.nombres
            `, [asignatura_id]);

            return {
                asignatura: {
                    id: asignatura.id,
                    materia: asignatura.materia
                },
                docentes: docentesResult.rows
            };
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            console.log(error);
            throw CustomError.internalServer('Error al obtener docentes de la asignatura');
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