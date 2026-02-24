import { EmailSender } from "@/domain/identity/application/email/email-sender";
import { Module } from "@nestjs/common";
import { NodemailerEmailSenderService } from "./nodemailer/nodemailer-email-sender.service";
import { EnvModule } from "../env/env.module";

@Module({
    imports: [EnvModule],
    exports: [EmailSender],
    providers: [
        {
            provide: EmailSender,
            useClass: NodemailerEmailSenderService
        }
    ]
})
export class EmailModule { }