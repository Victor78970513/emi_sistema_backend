import { BcryptAdapter, JwtAdapter } from "../../config";
import { AuthDatasource, CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";
import { Pool } from "pg";
import { UserMapper } from "../mappers/user.mapper";
import { Console } from "console";

type HashFunction = (password: string) => string
type CompareFunction = (password: string, hashed: string) => boolean
interface JWTPayload {
  id: string;
}

export class AuthDatasourceImpl implements AuthDatasource {
    constructor(
        private readonly db: Pool,
        private readonly hashPassword: HashFunction = BcryptAdapter.hash,
        private readonly comparePassword: CompareFunction = BcryptAdapter.compare,
    ) {}

    async findByEmail(correo: string): Promise<UserEntity | null> {
        const result = await this.db.query(
            `SELECT id, nombres, apellidos, correo, contraseña, rol_id, carrera_id, estado_id
             FROM usuarios WHERE correo = $1`,
            [correo]
        );
        if (result.rows.length === 0) return null;
        return UserMapper.userEntityFromObject(result.rows[0]);
    }

    async register(registerUserDto: RegisterUserDto): Promise<UserEntity> {
        const { nombres, apellidos, correo, contraseña, rol_id, carrera_id } = registerUserDto;

        try {
            // 1. Verificar si el correo existe
            const exists = await this.findByEmail(correo);
            if (exists) {
                throw CustomError.badRequest('User already exists')
            }
            // 2. Buscar el estado "PENDIENTE"
            const estadoResult = await this.db.query(`SELECT id FROM estados WHERE nombre = 'pendiente' LIMIT 1`);
            if (estadoResult.rows.length === 0) throw CustomError.internalServer('Estado PENDIENTE no existe');
            const estado_id = estadoResult.rows[0].id;

            // 3. Hashear la contraseña
            const hashedPassword = this.hashPassword(contraseña);
            // 4. Insertar usuario
            const result = await this.db.query(
                `INSERT INTO usuarios(nombres, apellidos, correo, contraseña, rol_id, carrera_id, estado_id)
                 VALUES($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id, nombres, apellidos, correo, contraseña, rol_id, carrera_id, estado_id`,
                [nombres, apellidos, correo, hashedPassword, rol_id, carrera_id, estado_id]
            );
            const row = result.rows[0];
            return UserMapper.userEntityFromObject(row);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            console.log(error)
            throw CustomError.badRequest(`${error}`);
        }
    }

    async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
        const { correo, contraseña } = loginUserDto;
        try {
            // 1. Buscar el estado "ACTIVO"
            const estadoResult = await this.db.query(`SELECT id FROM estados WHERE nombre = 'aprobado' LIMIT 1`);
            if (estadoResult.rows.length === 0) throw CustomError.internalServer('Estado aprobado no existe');
            const estado_id = estadoResult.rows[0].id;

            // 2. Buscar usuario por correo y estado ACTIVO
            const result = await this.db.query(
                `SELECT id, nombres, apellidos, correo, contraseña, rol_id, carrera_id, estado_id
                 FROM usuarios
                 WHERE correo = $1 AND estado_id = $2`,
                [correo, estado_id]
            );
            if (result.rows.length === 0) {
                throw CustomError.unauthorized('Invalid credentials');
            }
            const user = result.rows[0];

            // 3. Comparar contraseña
            console.log(user.contraseña)
            console.log(contraseña)
            const isMatch = this.comparePassword(contraseña, user.contraseña);

            if (!isMatch) {
                throw CustomError.unauthorized('Invalid credentials');
            }
            return UserMapper.userEntityFromObject(user);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error
            }
            console.log(error)
            throw CustomError.internalServer('Internal server error');
        }
    }

    async checkAuth(token: string): Promise<UserEntity> {
        const payload = await JwtAdapter.validateToken<JWTPayload>(token);
        if (!payload || !payload.id) {
            throw CustomError.unauthorized('Token inválido o expirado');
        }

        const result = await this.db.query(
            `SELECT id, nombres, apellidos, correo, contraseña, rol_id, carrera_id, estado_id
             FROM usuarios
             WHERE id = $1`,
            [payload.id]
        );
        if (result.rows.length === 0) {
            throw CustomError.notFound('Usuario no encontrado');
        }
        return UserMapper.userEntityFromObject(result.rows[0]);
    }
}