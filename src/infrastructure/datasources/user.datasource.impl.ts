import { Pool } from "pg";
import { CustomError, UserDatasource, UserEntity } from "../../domain";
import { UserMapper } from "../mappers/user.mapper";

export class UserDatasourceImpl implements UserDatasource {

    constructor(
        private readonly db: Pool
    ) {}

    async getPendingUsers(): Promise<UserEntity[]> {
        // Buscar el estado "pendiente"
        const estadoResult = await this.db.query(`SELECT id FROM estados WHERE nombre = 'pendiente' LIMIT 1`);
        if (estadoResult.rows.length === 0) throw CustomError.internalServer('Estado pendiente no existe');
        const estado_id = estadoResult.rows[0].id;

        const result = await this.db.query(
            `SELECT id, nombres, apellidos, correo, contraseña, rol_id, carrera_id, estado_id
             FROM usuarios
             WHERE estado_id = $1`,
            [estado_id]
        )
        const pendingUsers = result.rows.map(row => UserMapper.userEntityFromObject(row));
        return pendingUsers;
    }

    async updateUserStatus(userId: string, action: 'approve' | 'reject'): Promise<UserEntity> {
        try {
            // Buscar el estado correspondiente
            const estadoNombre = action === 'approve' ? 'aprobado' : 'rechazado';
            const estadoResult = await this.db.query(`SELECT id FROM estados WHERE nombre = $1 LIMIT 1`, [estadoNombre]);
            if (estadoResult.rows.length === 0) throw CustomError.internalServer(`Estado ${estadoNombre} no existe`);
            const estado_id = estadoResult.rows[0].id;

            const result = await this.db.query(
                `UPDATE usuarios 
                 SET estado_id = $1 
                 WHERE id = $2
                 RETURNING id, nombres, apellidos, correo, contraseña, rol_id, carrera_id, estado_id`,
                [estado_id, userId]
            )
            console.log('Resultado de la actualización:', result.rows[0]);
            if (result.rowCount === 0) {
                throw CustomError.notFound("No se encontro el usuario con ese ID")
            }
            const user = result.rows[0];
            console.log('Datos antes del mapper:', user);
            const mappedUser = UserMapper.userEntityFromObject(user);
            console.log('Datos después del mapper:', mappedUser);
            return mappedUser;
        } catch (error) {
            console.error('[DB ERROR]', error);
            throw CustomError.internalServer(`Error al ${action === 'approve' ? 'aprobar' : 'rechazar'} el usuario`);
        }
    }
}