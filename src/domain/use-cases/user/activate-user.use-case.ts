import { UserEntity } from "../../entities/user.entity";
import { DocenteRepository } from "../../repositories/docente.repository";
import { UserRepository } from "../../repositories/user.repository";
import { EmailService } from "../../services/email.service";


interface ActivateUserUseCase{
    execute(userId:string):Promise<UserEntity>;
}

export class ActivateUser implements ActivateUserUseCase{
    constructor(
        private readonly userRepository: UserRepository,
        private readonly docenteRepository: DocenteRepository,
        private readonly emailService: EmailService,
    ){}

    async execute(userId: string): Promise<UserEntity> {
        const updateUser = await this.userRepository.activateUser(userId);
        const newUser = new UserEntity(
            userId,
            updateUser.name,
            updateUser.lastName,
            updateUser.email,
            updateUser.password,
            updateUser.rol,
            updateUser.isActive,
        );
        await this.docenteRepository.createDocente({
            nombres: updateUser.name,
            apellidos: updateUser.lastName,
            correo_electronico: updateUser.email,
            usuario_id: Number(updateUser.userId),
            ci: '',
            genero: '',
            foto_docente: '',
            fecha_nacimiento: null,
            experiencia_laboral_anios: null,
            experiencia_docente_semestres: null,
            categoria_docente_id: null,
            modalidad_ingreso_id: null,
        })
        await this.emailService.sendApprovalAccountMail('yer59.chok@gmail.com',`${updateUser.name} ${updateUser.lastName}`);
        return newUser;
    }
}