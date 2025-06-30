import { EmailService } from "../../domain/services/email.service";
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { envs } from "../../config";
import { UserEntity } from "../../domain";

const resend = new Resend(envs.RESEND_API_KEY)

export class ResendEmailService implements EmailService{
    async sendApprovalAccountMail(sendMailTo: string,user: UserEntity): Promise<void> {
        const html =
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <div style="background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">🎉 ¡Solicitud Aprobada!</h2>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa;">
            <h3 style="color: #333; margin-top: 0;">Estimado/a ${user.name} ${user.lastName},</h3>
            
            <p style="color: #555; line-height: 1.6;">
                Nos complace informarte que tu solicitud de acceso al <strong>Sistema EMI</strong> ha sido 
                <span style="color: #28a745; font-weight: bold;">APROBADA</span>.
            </p>
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <h4 style="color: #155724; margin-top: 0;">Datos de tu cuenta:</h4>
                <p style="color: #155724; margin: 5px 0;"><strong>Correo:</strong> ${user.email}</p>
                <p style="color: #155724; margin: 5px 0;"><strong>Rol:</strong> Docente</p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
                Ya puedes iniciar sesión en el sistema utilizando tu correo electrónico y la contraseña 
                que registraste durante el proceso de solicitud.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://tusistema.com/login" target="_blank" rel="noopener noreferrer"
                style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Iniciar Sesión
                </a>
            </div>
            </div>
            
            <div style="padding: 20px; text-align: center; background-color: #e9ecef; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
            </p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
                <strong>Sistema EMI</strong> - Administración Académica
            </p>
            </div>
        </div>
        `
        await resend.emails.send({
            from: envs.RESEND_FROM,
            to: sendMailTo,
            subject: "Tu cuenta ha sido aprobada",
            html:html
        });
    }

    async requestRegistrationMail(user: UserEntity): Promise<void> {
        const html = 
        `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">📋 Nueva Solicitud de Registro</h2>
            </div>

            <div style="padding: 20px; background-color: #f8f9fa;">
            <h3 style="color: #333; margin-top: 0;">Detalles del Solicitante</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                <th style="text-align: left; padding: 10px; color: #555;">Nombre Completo:</th>
                <td style="padding: 10px;">${user.name} ${user.lastName}</td>
                </tr>
                <tr>
                <th style="text-align: left; padding: 10px; color: #555;">Correo Electrónico:</th>
                <td style="padding: 10px;">${user.email}</td>
                </tr>
                <tr>
                <th style="text-align: left; padding: 10px; color: #555;">Fecha de Solicitud:</th>
                <td style="padding: 10px;">${new Date().toLocaleString('es-ES')}</td>
                </tr>
            </table>
            </div>

            <div style="padding: 20px; text-align: center; background-color: #e9ecef;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                Para aprobar o rechazar esta solicitud, ingrese al panel de administración.
            </p>
            <a href="https://tusistema.com/admin/solicitudes" 
                style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: bold;">
                Revisar Solicitudes
            </a>
            </div>

            <div style="padding: 10px; text-align: center; font-size: 12px; color: #999;">
            Este mensaje fue generado automáticamente por el sistema.
            </div>
        </div>
        `
        // const html = 
        // `
        //     <div style="font-family: Arial, sans-serif; padding: 20px;">
        //     <h2 style="color: #ff9800;">Nueva Solicitud de Registro 📥</h2>
        //     <p>Estimado administrador,</p>
        //     <p>El usuario <strong>${fullName}</strong> ha enviado una solicitud para registrarse en el sistema.</p>
        //     <p>Por favor, revisa la plataforma para aprobar o rechazar esta solicitud.</p>
        // `;
        await resend.emails.send({
            from: envs.RESEND_FROM,
            to: envs.ADMIN_MAIL,
            subject: "Solicitud de Registro Recibida",
            html:html,
        });
    }

}