import { AuthDatasource, CustomError, RegisterUserDto, UserEntity } from "../../domain";
import {Pool} from "pg";
import bcrypt from 'bcrypt';

export class AuthDatasourceImpl implements AuthDatasource{
    constructor(private readonly db:Pool){}

    async findByEmail(email:string):Promise<UserEntity|null>{
        const result = await this.db.query('SELECT * FROM users WHERE email = $1',[email]);
        if(result.rows,length == 0) return null;
        return result.rows[0];
    }

    async register(registerUserDto: RegisterUserDto): Promise<UserEntity> {
        const {name,lastName,email,password,rol} = registerUserDto;

        try {
            //1. Verificar si el correo existe
            // const exists = await this.findByEmail(email);
            // if(exists) throw CustomError.badRequest('User already exists')

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await this.db.query(
                'INSERT INTO usuarios(nombre,apellidos,correo,contrasena,rol) VALUES($1, $2, $3, $4, $5) RETURNING id',
                // [name,lastName,email,hashedPassword,rol]
                ["Victor","Choque","prueba@gmail.com","123456","docente"]
            );
            return new UserEntity(
                "1",
                "Victor",
                "Choque",
                "prueba@gmail.com",
                "aniaania",
                "docente"
            );
            // return result.rows[0];            
            // return new UserEntity(
            //     '1',
            //     name,
            //     '',
            //     email,
            //     password,
            //     new Date(Date.now()),
            //     [2]
            // );
        } catch (error) {
            if(error instanceof CustomError){
                throw error;
            }
            console.log(error)
            throw CustomError.badRequest(`${error}`);
        }
    }

}