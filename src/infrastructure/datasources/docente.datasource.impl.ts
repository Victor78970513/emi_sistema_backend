import { Pool } from "pg";
import { CreateDocenteDto, CustomError, DocenteDatasource, DocenteEntity, UpdateDocenteDto } from "../../domain";
import { DocenteMapper } from "../mappers/docente.mapper";
import { CreateEstudioAcademicoDto } from "../../domain/dtos/docente/create-docente.dto";
import { EstudioAcademicoEntity } from "../../domain/entities/docente.entity";


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
            `SELECT * FROM estudios_academicos WHERE docente_id = $1`,
            [docente_id]
        );
        return result.rows as EstudioAcademicoEntity[];
    }
}