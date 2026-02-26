import { Injectable } from '@nestjs/common'
import { EmailSender, EmailProps } from '@/domain/identity/application/email/email-sender'
import { EnvService } from '@/infra/env/env.service'
import { Resend } from 'resend'

@Injectable()
export class ResendEmailSenderService implements EmailSender {
    private resend: Resend

    constructor(private env: EnvService) {
        this.resend = new Resend(env.get('RESEND_API_KEY'))
    }

    async send({ to, subject, text, html }: EmailProps) {
        const { error } = await this.resend.emails.send({
            from: `"Smart Finance" <onboarding@resend.dev>`,
            to,
            subject,
            text,
            html
        })

        if (error) {
            console.error(error)
        }
    }
}