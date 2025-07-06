import { Request, Response } from "express"
import { UpdateUserStatus, CustomError, DocenteRepository, GetPendingUsers, UserRepository } from "../../domain";
import { EmailService } from "../../domain/services/email.service";
import { SafeUserDto } from "../../domain/dtos/auth/login-user.dto";

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


}