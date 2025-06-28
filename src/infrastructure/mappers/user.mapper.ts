import { CustomError, UserEntity } from "../../domain";



export class UserMapper{

    static userEntityFromObject(object:{[key:string]:any}){
        const{id, name, lastName, email, password, rol} = object;
        if(!id){
            throw CustomError.badRequest("Missing id");
        }
        if(!name) throw CustomError.badRequest("Missing name");
        if(!lastName) throw CustomError.badRequest("Missing lastName");
        if(!email) throw CustomError.badRequest("Missing email");
        if(!password) throw CustomError.badRequest("Missing password");
        if(!rol) throw CustomError.badRequest("Missing rol");

        return new UserEntity(
            id,
            name,
            lastName,
            email,
            password,
            rol,
        );
    }

}