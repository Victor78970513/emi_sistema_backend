import { CustomError, UserEntity } from "../../domain";



export class UserMapper{

    static userEntityFromObject(object:{[key:string]:any}){
        const{id, nombres, apellidos, correo, contraseña, rol_id, carrera_id, estado_id} = object;
        if(!id){
            throw CustomError.badRequest("Missing id");
        }
        if(!nombres) throw CustomError.badRequest("Missing nombres");
        if(!apellidos) throw CustomError.badRequest("Missing apellidos");
        if(!correo) throw CustomError.badRequest("Missing correo");
        if(!contraseña) throw CustomError.badRequest("Missing contraseña");
        if(rol_id === undefined || rol_id === null) throw CustomError.badRequest("Missing rol_id");
        if(carrera_id === undefined || carrera_id === null) throw CustomError.badRequest("Missing carrera_id");
        if(estado_id === undefined || estado_id === null) throw CustomError.badRequest("Missing estado_id");

        return new UserEntity(
            id,
            nombres,
            apellidos,
            correo,
            contraseña,
            rol_id,
            carrera_id,
            estado_id,
        );
    }

}