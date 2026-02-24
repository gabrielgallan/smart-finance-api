import { EmailProps, EmailSender } from "@/domain/identity/application/email/email-sender";

export class EmailSenderMock extends EmailSender {
    public emails: EmailProps[] = []

    async send({ to, subject, text }: EmailProps) {
        this.emails.push({ to, subject, text })
    }
}