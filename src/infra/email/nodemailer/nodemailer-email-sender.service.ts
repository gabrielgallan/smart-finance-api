import { Injectable } from '@nestjs/common'
import { createTransport, Transporter } from 'nodemailer'
import { EmailSender, EmailProps } from '@/domain/identity/application/email/email-sender'
import { EnvService } from '@/infra/env/env.service'

@Injectable()
export class NodemailerEmailSenderService implements EmailSender {
    private transporter: Transporter

    constructor(private env: EnvService) {
        this.transporter = createTransport({
            service: 'gmail',
            auth: {
                user: this.env.get('GMAIL_USER'),
                pass: this.env.get('GMAIL_PASSWORD'),
            },
        })
    }

    async send({ to, subject, text, html }: EmailProps) {
        await this.transporter.sendMail({
            from: `"Smart Finance" <${this.env.get('GMAIL_USER')}>`,
            to,
            subject,
            text,
            html,
        })
    }
}