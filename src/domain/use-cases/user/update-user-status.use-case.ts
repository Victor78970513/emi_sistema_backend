import { envs } from "../../../config";
import { UserEntity } from "../../entities/user.entity";
import { DocenteRepository } from "../../repositories/docente.repository";
import { UserRepository } from "../../repositories/user.repository";
import { EmailService } from "../../services/email.service";

interface UpdateUserStatusDto {
    userId: string;
    action: 'approve' | 'reject';
    reason?: string; // Para casos de rechazo
}

interface UpdateUserStatusUseCase {
    execute(updateUserStatusDto: UpdateUserStatusDto): Promise<UserEntity>;
}

export class UpdateUserStatus implements UpdateUserStatusUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly docenteRepository: DocenteRepository,
        private readonly emailService: EmailService,
    ) {}

    async execute(updateUserStatusDto: UpdateUserStatusDto): Promise<UserEntity> {
        const { userId, action, reason } = updateUserStatusDto;
        
        // Actualizar el estado del usuario
        const updatedUser = await this.userRepository.updateUserStatus(userId, action);
        
        const newUser = new UserEntity(
            userId,
            updatedUser.nombres,
            updatedUser.apellidos,
            updatedUser.correo,
            updatedUser.contraseña,
            updatedUser.rol_id,
            updatedUser.carrera_id,
            updatedUser.estado_id,
        );

        // Si se aprueba y es un docente, crear el registro de docente
        if (action === 'approve') {
            // Aquí deberías verificar si el rol_id corresponde a un docente
            // Por ahora, asumimos que si tiene carrera_id, es un docente
            if (updatedUser.carrera_id) {
                // Crear el registro de docente
                const docente = await this.docenteRepository.createDocente({
                    nombres: updatedUser.nombres,
                    apellidos: updatedUser.apellidos,
                    correo_electronico: updatedUser.correo,
                    usuario_id: Number(updatedUser.userId),
                    carnet_identidad: '',
                    genero: '',
                    foto_docente: '',
                    fecha_nacimiento: null,
                    experiencia_profesional: null,
                    experiencia_academica: null,
                    categoria_docente_id: null,
                    modalidad_ingreso_id: null,
                });

                // Crear la relación docente-carrera
                await this.docenteRepository.createDocenteCarrera({
                    docente_id: docente.docente_id,
                    carrera_id: updatedUser.carrera_id,
                });
            }
            
            // Enviar email de aprobación
            await this.emailService.sendApprovalAccountMail(envs.ADMIN_MAIL, updatedUser);
        } else {
            // Enviar email de rechazo
            await this.emailService.sendRejectionAccountMail(updatedUser.correo, reason || 'Solicitud rechazada');
        }

        return newUser;
    }
}