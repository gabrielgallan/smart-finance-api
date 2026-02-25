import { Module } from "@nestjs/common";
import { EnvModule } from "../env/env.module";
import { Uploader } from "@/domain/identity/application/storage/uploader";
import { CloudinaryStorage } from "./cloudnary/cloudinary-storage";

@Module({
    imports: [EnvModule],
    exports: [Uploader],
    providers: [
        {
            provide: Uploader,
            useClass: CloudinaryStorage
        }
    ]
})
export class StorageModule {}