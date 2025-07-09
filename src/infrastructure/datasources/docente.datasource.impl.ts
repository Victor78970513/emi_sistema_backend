import { Pool } from "pg";
import { CreateDocenteDto, CustomError, DocenteDatasource, DocenteEntity, UpdateDocenteDto } from "../../domain";
import { DocenteMapper } from "../mappers/docente.mapper";
import { CreateEstudioAcademicoDto } from "../../domain/dtos/docente/create-docente.dto";
import { EstudioAcademicoEntity, CarreraEntity, InstitucionEntity, GradoAcademicoEntity, AsignaturaEntity } from "../../domain/entities/docente.entity";
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
                        e.nombre as estado_nombre
                    FROM docentes d
                    INNER JOIN usuarios u ON d.usuario_id = u.id
                    LEFT JOIN roles r ON u.rol_id = r.id
                    LEFT JOIN carreras c ON u.carrera_id = c.id
                    LEFT JOIN estados e ON u.estado_id = e.id
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

    async obtenerAsignaturas(): Promise<AsignaturaEntity[]> {
        const result = await this.db.query('SELECT * FROM asignaturas');
        return result.rows;
    }


    async obtenerCarreras(): Promise<CarreraEntity[]> {
        const result = await this.db.query('SELECT * FROM carreras');
        return result.rows;
    }

}