import { EmailService } from "../../domain/services/email.service";
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { envs } from "../../config";

const resend = new Resend(envs.RESEND_API_KEY)

export class ResendEmailService implements EmailService{
    async sendApprovalAccountMail(sendMailTo: string,fullName: string): Promise<void> {
        const html = 
        `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2196F3;">Cuenta Aprobada ✅</h2>
            <p>Hola <strong>${fullName}</strong>,</p>
            <p>Tu cuenta ha sido aprobada exitosamente. Ya puedes acceder al sistema con tus credenciales.</p>
            <p style="margin-top: 20px;">👉 <a href="https://tusistema.com/login" style="color: #2196F3;">Iniciar sesión ahora</a></p>
            <p style="color: #888;">Si tú no solicitaste esta cuenta, ignora este mensaje.</p>
            </div>
        `;
        await resend.emails.send({
            from: envs.RESEND_FROM,
            to: sendMailTo,
            subject: "Tu cuenta ha sido aprobada",
            html:html
        });
    }

    async requestRegistrationMail(fullName: string): Promise<void> {

        //TODO: Agregar este HMTL cuando se despliegue la pagina del frontend
        //<p style="margin-top: 20px;">🔗 <a href="https://tusistema.com/admin/solicitudes" style="color: #2196F3;">Ver solicitudes pendientes</a></p>

        // <p style="color: #888; margin-top: 30px;">Este mensaje fue generado automáticamente por el sistema.</p>
        // </div>
        const html = 
        `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #ff9800;">Nueva Solicitud de Registro 📥</h2>
            <p>Estimado administrador,</p>
            <p>El usuario <strong>${fullName}</strong> ha enviado una solicitud para registrarse en el sistema.</p>
            <p>Por favor, revisa la plataforma para aprobar o rechazar esta solicitud.</p>
        `;
        await resend.emails.send({
            from: envs.RESEND_FROM,
            to: 'yer59.chok@gmail.com',
            subject: "Solicitud de Registro Recibida",
            html:html,
        });
    }

}