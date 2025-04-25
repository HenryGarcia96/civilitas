import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor(private configService: ConfigService){
        this.transporter = nodemailer.createTransport({
            // service: 'gmail',
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASS'),
            }
        });
    }

    async sendPasswordResetEmail(email:string, token:string){
        const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

        const info = await this.transporter.sendMail({
            from: this.configService.get<string>('MAIL_FROM'),
            to: email,
            subject: 'Recuperación de contraseña',
            html:`
                <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                <p>Haz clic en el siguiente enlace para restablecerla:</p>
                <a href="${resetLink}">Restablecer contraseña</a>
            `
        });

        return info;
    }
}
