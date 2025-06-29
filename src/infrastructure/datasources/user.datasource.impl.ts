import { Pool } from "pg";
import { CustomError, UserDatasource, UserEntity } from "../../domain";
import { UserMapper } from "../mappers/user.mapper";



export class UserDatasourceImpl implements UserDatasource{

    constructor(
        private readonly db:Pool
    ){}

    async getPendingUsers(): Promise<UserEntity[]> {
        const result = await this.db.query(
            `
                SELECT
                id,
                nombre AS name,
                apellidos AS "lastName",
                correo AS email,
                contrasena AS password,
                rol,
                esta_activo AS "isActive"
                FROM usuarios
                WHERE esta_activo = false
            `
        )
        const pedingUsers = result.rows.map(row => UserMapper.userEntityFromObject(row));
        return pedingUsers;
    }

    async activateUser(userId: string): Promise<UserEntity> {
        try {
            const result = await this.db.query(
                `
                UPDATE usuarios 
                SET esta_activo = true 
                WHERE id = $1
                RETURNING
                    id,
                    nombre AS name,
                    apellidos AS "lastName",
                    correo AS email,
                    contrasena AS password,
                    rol,
                    esta_activo AS "isActive"
                `,
                [userId]
            )
            if(result.rowCount === 0){
                throw CustomError.notFound("No se encontro el usuario con ese ID")
            }
            const user = result.rows[0];
            return UserMapper.userEntityFromObject(user);
        } catch (error) {
            console.error('[DB ERROR]', error);
            throw CustomError.internalServer('Error al activar el usuario');
        }
    }
}