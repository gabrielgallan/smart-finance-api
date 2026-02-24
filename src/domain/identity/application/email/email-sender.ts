export interface EmailProps {
    to: string
    subject: string
    text: string
    html?: string
}

export abstract class EmailSender {
    abstract send(email: EmailProps): Promise<void>
}