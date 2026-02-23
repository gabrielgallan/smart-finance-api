import { EnvService } from "../env/env.service";
import { Injectable } from "@nestjs/common";
import { createTransport, type Transporter } from 'nodemailer'

interface EmailProps {
    to: string
    subject: string
    text: string
    html?: string
}

@Injectable()
export class EmailService {
    constructor(
        private env: EnvService,
    ) {}

    async sendEmail({ to, subject, text, html }: EmailProps) {
        const transporter: Transporter = createTransport({
            service: 'gmail',
            auth: {
                user: this.env.get('GMAIL_USER'),
                pass: this.env.get('GMAIL_PASSWORD')
            }
        })

        await transporter.sendMail({
            from: `"Smart Finance" <${this.env.get('GMAIL_USER')}>`,
            to,
            subject,
            text,
            html
        })
    }
}