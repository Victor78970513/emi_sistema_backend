import { Request, Response } from "express"
import { CustomError, DocenteRepository } from "../../domain"
import { GetPersonalInfo } from "../../domain/use-cases/docente/get-personal-info.use-case";
import { UpdatePersonalInfo } from "../../domain";
import { UpdateDocenteDto } from "../../domain/dtos/docente/create-docente.dto";
import { UploadDocentePhoto, UploadPhotoDto } from "../../domain";
import { RegisterEstudioAcademico, CreateEstudioAcademicoDto, UploadEstudioPDFDto } from "../../domain";


export class DocenteController{

    constructor(
        private readonly docenteRepository: DocenteRepository,
    ){}

    private handleError = (error: unknown, res:Response) => {
        if(error instanceof CustomError){
            return res.status(error.statusCode).json({error: error.message});
        }
        console.log(error)
        return res.status(500).json({error: 'Internal Server Error'});
    }

    
    getPersonalInfo = (req: Request,res:Response) => {
        const {docenteId} = req.query;
        if (!docenteId || (Array.isArray(docenteId) && docenteId.length === 0)) {
            res.status(400).json({ message: 'docenteId es un parámetro de consulta requerido.' });
            return;
        }
        new GetPersonalInfo(this.docenteRepository)
        .execute(docenteId as string)
        .then(data => res.json(data))
        .catch(error => this.handleError(error,res))   
    }

    getMe = (req: Request, res: Response): void => {
        // El middleware pone el payload en req.user
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }
        new GetPersonalInfo(this.docenteRepository)
            .execute(payload.id)
            .then(data => res.json(data))
            .catch(error => this.handleError(error, res));
    }

    updateMe = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }
        const update = req.body as UpdateDocenteDto;
        new UpdatePersonalInfo(this.docenteRepository)
            .execute(payload.id, update)
            .then(data => res.json(data))
            .catch(error => this.handleError(error, res));
    }

    uploadPhoto = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: 'No se ha subido ningún archivo' });
            return;
        }

        const photoData = new UploadPhotoDto(
            req.file.filename,
            req.file.originalname,
            req.file.mimetype,
            req.file.size,
            req.file.path
        );

        new UploadDocentePhoto(this.docenteRepository)
            .execute(payload.id, photoData)
            .then(data => {
                res.json({
                    message: 'Foto subida exitosamente',
                    filename: req.file?.filename,
                    docente: data
                });
            })
            .catch(error => this.handleError(error, res));
    }

    registerEstudioAcademico = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: 'No se ha subido ningún archivo PDF' });
            return;
        }
        
        console.log('Body recibido:', req.body);
        console.log('Archivo recibido:', req.file);
        
        const { titulo, institucion_id, grado_academico_id, año_titulacion } = req.body;
        console.log('Campos extraídos:', { titulo, institucion_id, grado_academico_id, año_titulacion });
        
        // Manejar el problema de codificación del campo año_titulacion
        const añoTitulacion = req.body['año_titulacion'] || req.body['aÃ±o_titulacion'];
        
        if (!titulo || !institucion_id || !grado_academico_id || !añoTitulacion) {
            res.status(400).json({ 
                error: 'Faltan campos obligatorios',
                campos_recibidos: { titulo, institucion_id, grado_academico_id, año_titulacion: añoTitulacion }
            });
            return;
        }

        // Primero obtener el docente para obtener su ID real
        new GetPersonalInfo(this.docenteRepository)
            .execute(payload.id)
            .then(docente => {
                const estudioDto = new CreateEstudioAcademicoDto(
                    titulo,
                    req.file!.filename,
                    Number(institucion_id),
                    Number(grado_academico_id),
                    Number(añoTitulacion),
                    docente.docente_id
                );
                
                return new RegisterEstudioAcademico(this.docenteRepository)
                    .execute(estudioDto);
            })
            .then(data => res.json({ message: 'Estudio académico registrado', estudio: data }))
            .catch(error => this.handleError(error, res));
    }
}