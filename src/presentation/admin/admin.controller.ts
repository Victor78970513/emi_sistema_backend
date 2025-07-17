import { Request, Response } from "express"
import { UpdateUserStatus, CustomError, DocenteRepository, GetPendingUsers, UserRepository } from "../../domain";
import { EmailService } from "../../domain/services/email.service";
import { SafeUserDto } from "../../domain/dtos/auth/login-user.dto";
import { GetAllSolicitudes, UpdateSolicitudStatus } from "../../domain";
import { GetAllAsignaturasByCarreras, GetAsignaturaById, GetDocentesByAsignatura } from "../../domain";
import { AssociateDocenteAsignatura } from "../../domain/use-cases/admin/associate-docente-asignatura.use-case";
import { DisassociateDocenteAsignatura } from "../../domain/use-cases/admin/disassociate-docente-asignatura.use-case";
import { GetDocenteById } from "../../domain/use-cases/admin/get-docente-by-id.use-case";
import { GetAsignaturasByCarrera } from "../../domain/use-cases/admin/get-asignaturas-by-carrera.use-case";
import { CreateDocenteAsignaturaDto } from "../../domain/dtos/docente/create-docente.dto";
import { PDFService } from "../../infrastructure/services/pdf.service";

export class AdminController {

    constructor(
        private readonly userRepository: UserRepository,
        private readonly docenteRepository: DocenteRepository,
        private readonly emailService: EmailService,
    ) {}

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.log(error)
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    getPendingUsers = (req: Request, res: Response) => {
        new GetPendingUsers(this.userRepository)
            .execute()
            .then(data => {
                const safeUsers = data.map(SafeUserDto.fromEntity);
                res.json(safeUsers)
            })
            .catch(error => this.handleError(error, res))
    }

    approveUser = (req: Request, res: Response) => {
        const { id } = req.params;
        console.log(`Aprobando usuario: ${id}`)
        if (!id) {
            res.status(400).json({ error: 'Falta el ID del usuario en la URL' });
            return;
        }
        console.log('Ejecutando UpdateUserStatus con:', { userId: id, action: 'approve' });
        new UpdateUserStatus(this.userRepository, this.docenteRepository, this.emailService)
            .execute({ userId: id, action: 'approve' })
            .then(data => {
                console.log('UpdateUserStatus completado exitosamente:', data);
                res.json(data);
            })
            .catch(error => {
                console.log('Error en UpdateUserStatus:', error);
                this.handleError(error, res);
            })
    }

    rejectUser = (req: Request, res: Response) => {
        const { id } = req.params;
        const { reason } = req.body || {};
        console.log(`Rechazando usuario: ${id}, razón: ${reason}`)
        
        if (!id) {
            res.status(400).json({ error: 'Falta el ID del usuario en la URL' });
            return;
        }
        
        if (!reason || reason.trim() === '') {
            res.status(400).json({ error: 'Falta la razón de rechazo' });
            return;
        }
        
        new UpdateUserStatus(this.userRepository, this.docenteRepository, this.emailService)
            .execute({ userId: id, action: 'reject', reason: reason })
            .then(data => res.json(data))
            .catch(error => this.handleError(error, res))
    }

    // Métodos para solicitudes
    getAllSolicitudes = (req: Request, res: Response) => {
        new GetAllSolicitudes(this.docenteRepository)
            .execute()
            .then(solicitudes => res.json(solicitudes))
            .catch(error => this.handleError(error, res))
    }

    approveSolicitud = (req: Request, res: Response) => {
        const { id } = req.params;
        
        if (!id) {
            res.status(400).json({ error: 'Falta el ID de la solicitud en la URL' });
            return;
        }
        
        // Obtener el estado_id para 'aprobada'
        const estadoAprobadaId = 1;
        
        new UpdateSolicitudStatus(this.docenteRepository)
            .execute(Number(id), estadoAprobadaId)
            .then(solicitud => res.json({ 
                message: 'Solicitud aprobada correctamente', 
                solicitud 
            }))
            .catch(error => this.handleError(error, res))
    }

    rejectSolicitud = (req: Request, res: Response) => {
        const { id } = req.params;
        const { motivo_rechazo } = req.body;
        
        if (!id) {
            res.status(400).json({ error: 'ID de la solicitud es requerido' });
            return;
        }

        if (!motivo_rechazo || motivo_rechazo.trim() === '') {
            res.status(400).json({ error: 'motivo_rechazo es requerido' });
            return;
        }

        new UpdateSolicitudStatus(this.docenteRepository)
            .execute(Number(id), 2, motivo_rechazo) // 2 = rechazado
            .then((data: any) => res.json({ 
                message: 'Solicitud rechazada correctamente', 
                solicitud: data 
            }))
            .catch((error: any) => this.handleError(error, res));
    }

    // Métodos para asignaturas
    getAllAsignaturasByCarreras = (req: Request, res: Response) => {
        new GetAllAsignaturasByCarreras(this.docenteRepository)
            .execute()
            .then(data => res.json({ carreras: data }))
            .catch(error => this.handleError(error, res));
    }

    getAsignaturaById = (req: Request, res: Response) => {
        const { id } = req.params;
        
        if (!id) {
            res.status(400).json({ error: 'ID de la asignatura es requerido' });
            return;
        }

        new GetAsignaturaById(this.docenteRepository)
            .execute(Number(id))
            .then(data => res.json(data))
            .catch(error => this.handleError(error, res));
    }

    getDocentesByAsignatura = (req: Request, res: Response) => {
        const { id } = req.params;
        
        if (!id) {
            res.status(400).json({ error: 'ID de la asignatura es requerido' });
            return;
        }

        new GetDocentesByAsignatura(this.docenteRepository)
            .execute(Number(id))
            .then(data => res.json(data))
            .catch(error => this.handleError(error, res));
    }

    // Métodos para asociar/desasociar docentes de asignaturas
    associateDocenteAsignatura = (req: Request, res: Response) => {
        const { id } = req.params;
        const { docente_id } = req.body;
        
        if (!id) {
            res.status(400).json({ error: 'ID de la asignatura es requerido' });
            return;
        }

        if (!docente_id) {
            res.status(400).json({ error: 'docente_id es requerido' });
            return;
        }

        const dto = new CreateDocenteAsignaturaDto(Number(docente_id), Number(id));

        new AssociateDocenteAsignatura(this.docenteRepository)
            .execute(dto)
            .then(data => res.status(201).json({ 
                message: 'Docente asociado a la asignatura correctamente',
                data 
            }))
            .catch(error => this.handleError(error, res));
    }

    disassociateDocenteAsignatura = (req: Request, res: Response) => {
        const { id, docenteId } = req.params;
        
        if (!id) {
            res.status(400).json({ error: 'ID de la asignatura es requerido' });
            return;
        }

        if (!docenteId) {
            res.status(400).json({ error: 'ID del docente es requerido' });
            return;
        }

        new DisassociateDocenteAsignatura(this.docenteRepository)
            .execute(Number(id), Number(docenteId))
            .then(deleted => {
                if (deleted) {
                    res.json({ message: 'Docente desasociado de la asignatura correctamente' });
                } else {
                    res.status(404).json({ error: 'Relación docente-asignatura no encontrada' });
                }
            })
            .catch(error => this.handleError(error, res));
    }

    // Método para obtener docente por ID
    getDocenteById = async (req: Request, res: Response) => {
        const { id } = req.params;
        
        if (!id) {
            res.status(400).json({ error: 'ID del docente es requerido' });
            return;
        }

        try {
            // Obtener datos del docente
            const docente = await new GetDocenteById(this.docenteRepository).execute(Number(id));
            // Obtener asignaturas asociadas
            const asignaturas = await this.docenteRepository.getDocenteAsignaturas(Number(id));
            // Calcular total de horas semanales
            const total_horas_semanales = asignaturas.reduce((acc, a) => acc + (a.horas_semanales || 0), 0);
            res.json({
                docente,
                asignaturas,
                total_horas_semanales
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // Método para descargar PDF de asignaturas por carrera
    downloadAsignaturasPDF = (req: Request, res: Response) => {
        const { carreraId } = req.params;
        
        if (!carreraId) {
            res.status(400).json({ error: 'ID de la carrera es requerido' });
            return;
        }

        new GetAsignaturasByCarrera(this.docenteRepository)
            .execute(Number(carreraId))
            .then(async data => {
                const { carrera, asignaturas } = data;
                
                try {
                    // Generar el PDF
                    const pdfBuffer = await PDFService.generateAsignaturasPDF(asignaturas, carrera.nombre);
                    
                    // Configurar headers para descarga
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename="asignaturas_${carrera.nombre.replace(/\s+/g, '_')}.pdf"`);
                    res.setHeader('Content-Length', pdfBuffer.length);
                    
                    // Enviar el PDF
                    res.send(pdfBuffer);
                } catch (error) {
                    console.error('Error generando PDF:', error);
                    res.status(500).json({ error: 'Error generando el PDF' });
                }
            })
            .catch(error => this.handleError(error, res));
    }
}