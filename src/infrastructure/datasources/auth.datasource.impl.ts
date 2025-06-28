import { BcryptAdapter } from "../../config";
import { AuthDatasource, CustomError, RegisterUserDto, UserEntity } from "../../domain";
import {Pool} from "pg";
import { UserMapper } from "../mappers/user.mapper";

type HashFunction = (password:string)=>string
type CompareFunction = (password:string, hashed:string)=>boolean
export class AuthDatasourceImpl implements AuthDatasource{
    constructor(
        private readonly db:Pool,
        private readonly hashPassword: HashFunction = BcryptAdapter.hash,
        private readonly comparePassword: CompareFunction = BcryptAdapter.compare,
    ){}

    async findByEmail(email:string):Promise<UserEntity|null>{
        const result = await this.db.query('SELECT * FROM usuarios WHERE correo = $1',[email]);
        if(result.rows.length == 0) return null;
        return result.rows[0];
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
                    INSERT INTO usuarios(nombre, apellidos, correo, contrasena, rol)
                    VALUES($1, $2, $3, $4, $5)
                    RETURNING 
                        id, 
                        nombre AS name, 
                        apellidos AS "lastName", 
                        correo AS email, 
                        contrasena AS password, 
                        rol
                    `,
                [name,lastName,email,hashedPassword,rol]
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

}