import { Request, Response } from "express"
import { CustomError, DocenteRepository } from "../../domain"
import { GetPersonalInfo } from "../../domain/use-cases/docente/get-personal-info.use-case";
import { UpdatePersonalInfo } from "../../domain";
import { UpdateDocenteDto } from "../../domain/dtos/docente/create-docente.dto";
import { UploadDocentePhoto, UploadPhotoDto } from "../../domain";
import { RegisterEstudioAcademico, CreateEstudioAcademicoDto, UploadEstudioPDFDto, GetEstudiosAcademicos, DeleteEstudioAcademico } from "../../domain";
import { GetCarreras, GetAllDocentes, GetEstudiosByDocenteId, GetInstituciones, GetGradosAcademicos } from "../../domain";
import { GetDocenteCarreras, CreateDocenteCarrera, DeleteDocenteCarrera } from "../../domain";
import { GetDocenteAsignaturas } from "../../domain";
import { CreateSolicitud, GetSolicitudesByDocente } from "../../domain";
import { CreateDocenteAsignaturaUseCase, GetDocenteAsignaturasUseCase, DeleteDocenteAsignaturaUseCase } from "../../domain/use-cases/docente/get-personal-info.use-case";


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
            res.status(400).json({ error: 'No se ha subido ningún documento' });
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

    getEstudioPDF = (req: Request, res: Response): void => {
        const { estudioId } = req.params;
        if (!estudioId) {
            res.status(400).json({ error: 'ID del estudio es requerido' });
            return;
        }

        // Aquí deberías buscar el estudio en la base de datos para obtener el nombre del archivo
        // Por ahora, asumimos que el estudioId es el nombre del archivo
        const filePath = `uploads/estudios_academicos/${estudioId}`;
        
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error al descargar archivo:', err);
                res.status(404).json({ error: 'Archivo no encontrado' });
            }
        });
    }

    getEstudiosAcademicos = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }

        // Obtener el docente para obtener su ID real
        new GetPersonalInfo(this.docenteRepository)
            .execute(payload.id)
            .then(docente => {
                return new GetEstudiosAcademicos(this.docenteRepository)
                    .execute(docente.docente_id);
            })
            .then(estudios => res.json(estudios))
            .catch(error => this.handleError(error, res));
    }

    deleteEstudioAcademico = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        const { estudioId } = req.params;
        
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }
        
        if (!estudioId) {
            res.status(400).json({ error: 'ID del estudio es requerido' });
            return;
        }

        // Obtener el docente para obtener su ID real
        new GetPersonalInfo(this.docenteRepository)
            .execute(payload.id)
            .then(docente => {
                return new DeleteEstudioAcademico(this.docenteRepository)
                    .execute(Number(estudioId), docente.docente_id);
            })
            .then(deleted => {
                if (deleted) {
                    res.json({ message: 'Estudio académico eliminado correctamente' });
                } else {
                    res.status(404).json({ error: 'Estudio académico no encontrado' });
                }
            })
            .catch(error => this.handleError(error, res));
    }

    getCarreras = (req: Request, res: Response): void => {
        new GetCarreras(this.docenteRepository)
            .execute()
            .then(carreras => res.json(carreras))
            .catch(error => this.handleError(error, res));
    }

    getAllDocentes = (req: Request, res: Response): void => {
        new GetAllDocentes(this.docenteRepository)
            .execute()
            .then(docentes => res.json(docentes))
            .catch(error => this.handleError(error, res));
    }

    // Métodos para docentes_carreras
    getDocenteCarreras = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }

        // Obtener el docente para obtener su ID real
        new GetPersonalInfo(this.docenteRepository)
            .execute(payload.id)
            .then(docente => {
                return new GetDocenteCarreras(this.docenteRepository)
                    .execute(docente.docente_id);
            })
            .then(carreras => res.json(carreras))
            .catch(error => this.handleError(error, res));
    }

    createDocenteCarrera = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        const { carrera_id } = req.body;
        
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }

        if (!carrera_id) {
            res.status(400).json({ error: 'carrera_id es requerido' });
            return;
        }

        // Obtener el docente para obtener su ID real
        new GetPersonalInfo(this.docenteRepository)
            .execute(payload.id)
            .then(docente => {
                return new CreateDocenteCarrera(this.docenteRepository)
                    .execute({
                        docente_id: docente.docente_id,
                        carrera_id: Number(carrera_id)
                    });
            })
            .then(docenteCarrera => res.json({ 
                message: 'Carrera asignada correctamente', 
                docenteCarrera 
            }))
            .catch(error => this.handleError(error, res));
    }

    deleteDocenteCarrera = (req: Request, res: Response): void => {
        const { id } = req.params;
        
        if (!id) {
            res.status(400).json({ error: 'ID de la relación es requerido' });
            return;
        }

        new DeleteDocenteCarrera(this.docenteRepository)
            .execute(Number(id))
            .then(deleted => {
                if (deleted) {
                    res.json({ message: 'Relación docente-carrera eliminada correctamente' });
                } else {
                    res.status(404).json({ error: 'Relación docente-carrera no encontrada' });
                }
            })
            .catch(error => this.handleError(error, res));
    }



    // Métodos para solicitudes
    createSolicitud = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        const { tipo_solicitud, carrera_id, asignatura_id } = req.body;
        
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }

        if (!tipo_solicitud) {
            res.status(400).json({ error: 'tipo_solicitud es requerido' });
            return;
        }

        if (tipo_solicitud === 'carrera' && !carrera_id) {
            res.status(400).json({ error: 'carrera_id es requerido para solicitudes de carrera' });
            return;
        }

        if (tipo_solicitud === 'asignatura' && !asignatura_id) {
            res.status(400).json({ error: 'asignatura_id es requerido para solicitudes de asignatura' });
            return;
        }

        // Obtener el docente para obtener su ID real
        new GetPersonalInfo(this.docenteRepository)
            .execute(payload.id)
            .then(docente => {
                return new CreateSolicitud(this.docenteRepository)
                    .execute({
                        docente_id: docente.docente_id,
                        tipo_solicitud,
                        carrera_id: carrera_id ? Number(carrera_id) : null,
                        asignatura_id: asignatura_id ? Number(asignatura_id) : null
                    });
            })
            .then(solicitud => res.json({ 
                message: 'Solicitud creada correctamente', 
                solicitud 
            }))
            .catch(error => this.handleError(error, res));
    }

    getSolicitudesByDocente = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }

        // Obtener el docente para obtener su ID real
        new GetPersonalInfo(this.docenteRepository)
            .execute(payload.id)
            .then(docente => {
                return new GetSolicitudesByDocente(this.docenteRepository)
                    .execute(docente.docente_id);
            })
            .then(solicitudes => res.json(solicitudes))
            .catch(error => this.handleError(error, res));
    }

    getEstudiosByDocenteId = (req: Request, res: Response): void => {
        const { docenteId } = req.params;
        
        if (!docenteId) {
            res.status(400).json({ error: 'ID del docente es requerido' });
            return;
        }

        const docenteIdNumber = Number(docenteId);
        if (isNaN(docenteIdNumber)) {
            res.status(400).json({ error: 'ID del docente debe ser un número válido' });
            return;
        }

        new GetEstudiosByDocenteId(this.docenteRepository)
            .execute(docenteIdNumber)
            .then(estudios => res.json(estudios))
            .catch(error => this.handleError(error, res));
    }

    getGradosAcademicos = (req: Request, res: Response): void => {
        new GetGradosAcademicos(this.docenteRepository)
            .execute()
            .then(grados => res.json(grados))
            .catch(error => this.handleError(error, res));
    }

    getInstituciones = (req: Request, res: Response): void => {
        new GetInstituciones(this.docenteRepository)
            .execute()
            .then(data => res.json(data))
            .catch(error => this.handleError(error, res));
    }

    // Método para obtener asignaturas por carreras donde el docente está asociado
    getAsignaturasPorCarreras = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }

        // Obtener el docente para obtener su ID real
        new GetPersonalInfo(this.docenteRepository)
            .execute(payload.id)
            .then(docente => {
                return new GetDocenteAsignaturas(this.docenteRepository)
                    .execute(docente.docente_id);
            })
            .then(data => res.json(data))
            .catch(error => this.handleError(error, res));
    }

    // Métodos para docentes_asignaturas
    createDocenteAsignatura = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }

        const { asignatura_id } = req.body;
        if (!asignatura_id) {
            res.status(400).json({ error: 'asignatura_id es requerido' });
            return;
        }

        // Obtener el docente para obtener su ID real
        new GetPersonalInfo(this.docenteRepository)
            .execute(payload.id)
            .then(docente => {
                const dto = { docente_id: docente.docente_id, asignatura_id: Number(asignatura_id) };
                return new CreateDocenteAsignaturaUseCase(this.docenteRepository)
                    .execute(dto);
            })
            .then(data => res.status(201).json(data))
            .catch(error => this.handleError(error, res));
    }

    getMisAsignaturas = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }

        // Obtener el docente para obtener su ID real
        new GetPersonalInfo(this.docenteRepository)
            .execute(payload.id)
            .then(docente => {
                return new GetDocenteAsignaturasUseCase(this.docenteRepository)
                    .execute(docente.docente_id);
            })
            .then(data => res.json(data))
            .catch(error => this.handleError(error, res));
    }

    deleteDocenteAsignatura = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        const { id } = req.params;
        
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }
        
        if (!id) {
            res.status(400).json({ error: 'ID de la relación es requerido' });
            return;
        }

        new DeleteDocenteAsignaturaUseCase(this.docenteRepository)
            .execute(Number(id))
            .then(deleted => {
                if (deleted) {
                    res.status(200).json({ message: 'Relación docente-asignatura eliminada exitosamente' });
                } else {
                    res.status(404).json({ message: 'Relación docente-asignatura no encontrada' });
                }
            })
            .catch(error => this.handleError(error, res));
    }

    // Nuevo método para obtener asignaturas donde el docente está directamente asignado
    getMisAsignaturasAsignadas = (req: Request, res: Response): void => {
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }

        // Obtener el docente para obtener su ID real
        new GetPersonalInfo(this.docenteRepository)
            .execute(payload.id)
            .then(docente => {
                return new GetDocenteAsignaturasUseCase(this.docenteRepository)
                    .execute(docente.docente_id);
            })
            .then(data => res.json(data))
            .catch(error => this.handleError(error, res));
    }
}