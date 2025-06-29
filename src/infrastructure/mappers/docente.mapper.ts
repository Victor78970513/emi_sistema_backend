import { CustomError, DocenteEntity } from "../../domain"


export class DocenteMapper{

    static docenteEntityFromObject(object:{[key:string]:any}){
        const {
            docente_id,
            nombres,
            apellidos,
            ci,
            genero,
            correo_electronico,
            foto_docente,
            fecha_nacimiento,
            experiencia_laboral_anios,
            experiencia_docente_semestres,
            categoria_docente_id,
            modalidad_ingreso_id, 
            usuario_id,
        } = object

        if(!docente_id) throw CustomError.badRequest("Missing id");
        if(!usuario_id) throw CustomError.badRequest("Missing user_id")
        if(!nombres) throw CustomError.badRequest("Missing nombres");
        if(!apellidos) throw CustomError.badRequest("Missing apellidos");
        if(!correo_electronico) throw CustomError.badRequest("Missing correo");
        if(!correo_electronico) throw CustomError.badRequest("Missing correo");

        return new DocenteEntity(
            docente_id,
            nombres,
            apellidos,
            ci,
            genero,
            correo_electronico,
            foto_docente,
            fecha_nacimiento,
            experiencia_laboral_anios,
            experiencia_docente_semestres,
            categoria_docente_id,
            modalidad_ingreso_id, 
            usuario_id,
        )
    }

}