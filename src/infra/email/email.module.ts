import { EmailSender } from "@/domain/identity/application/email/email-sender";
import { Module } from "@nestjs/common";
import { EnvModule } from "../env/env.module";
import { ResendEmailSenderService } from "./resend/resend-email-sender.service";

@Module({
    imports: [EnvModule],
    exports: [EmailSender],
    providers: [
        {
            provide: EmailSender,
            useClass: ResendEmailSenderService
        }
    ]
})
export class EmailModule { }