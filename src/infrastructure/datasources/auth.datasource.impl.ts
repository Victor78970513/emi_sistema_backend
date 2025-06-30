import { BcryptAdapter, JwtAdapter } from "../../config";
import { AuthDatasource, CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";
import {Pool} from "pg";
import { UserMapper } from "../mappers/user.mapper";

type HashFunction = (password:string)=>string
type CompareFunction = (password:string, hashed:string)=>boolean
interface JWTPayload {
  id: string;
}
export class AuthDatasourceImpl implements AuthDatasource{
    constructor(
        private readonly db:Pool,
        private readonly hashPassword: HashFunction = BcryptAdapter.hash,
        private readonly comparePassword: CompareFunction = BcryptAdapter.compare,
    ){}

    async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.db.query(
        `SELECT id, nombre AS name, apellidos AS "lastName", correo AS email, contrasena AS password, rol
        FROM usuarios WHERE correo = $1`,
        [email]
    );
    if (result.rows.length === 0) return null;
    return UserMapper.userEntityFromObject(result.rows[0]);
    }

    async register(registerUserDto: RegisterUserDto): Promise<UserEntity> {
        const {name,lastName,email,password,rol} = registerUserDto;

        try {
            //1. Verificar si el correo existe
            const exists = await this.findByEmail(email);
            if(exists) {
                throw CustomError.badRequest('User already exists')
            }

            const hashedPassword = this.hashPassword(password);
            const result = await this.db.query(
                  `
                    INSERT INTO usuarios(nombre, apellidos, correo, contrasena, rol, esta_activo)
                    VALUES($1, $2, $3, $4, $5, $6)
                    RETURNING 
                        id, 
                        nombre AS name, 
                        apellidos AS "lastName", 
                        correo AS email, 
                        contrasena AS password, 
                        rol,
                        esta_activo AS "isActive"
                    `,
                [name,lastName,email,hashedPassword,rol,false]
            );
            const row = result.rows[0];
            return UserMapper.userEntityFromObject(row);
        } catch (error) {
            if(error instanceof CustomError){
                throw error;
            }
            console.log(error)
            throw CustomError.badRequest(`${error}`);
        }
    }

    async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
        const {email,password} = loginUserDto;
        try {
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
                    WHERE correo = $1 AND esta_activo = TRUE;
                `,
                [email]
            );
            if(result.rows.length ===0){
                throw CustomError.unauthorized('Invalid credentials');
            }
            const user = result.rows[0];

            const isMatch = this.comparePassword(password, user.password);

            if(!isMatch){
                throw CustomError.unauthorized('invalid credentials');
            }
            console.log(user)
            return UserMapper.userEntityFromObject(user);
        } catch (error) {
            if(error instanceof CustomError){
                throw error
            }
            console.log(error)
            throw CustomError.internalServer('Internal server error');
        }
    }

    async checkAuth(token: string): Promise<UserEntity> {
        const payload = await JwtAdapter.validateToken<JWTPayload>(token);
        console.log(`PAYLOAD: ${payload}`)
        if(!payload || !payload.id){
            throw CustomError.unauthorized('Token inválido o expirado');
        }

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
            WHERE id = $1
            `,
            [payload.id]
        );
        if (result.rows.length === 0) {
            throw CustomError.notFound('Usuario no encontrado');
        }
        return UserMapper.userEntityFromObject(result.rows[0]);
    }
}