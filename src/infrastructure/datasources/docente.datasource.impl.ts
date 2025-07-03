import { Pool } from "pg";
import { CreateDocenteDto, CustomError, DocenteDatasource, DocenteEntity } from "../../domain";
import { DocenteMapper } from "../mappers/docente.mapper";


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
}