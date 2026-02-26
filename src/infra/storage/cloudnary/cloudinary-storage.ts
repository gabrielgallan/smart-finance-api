import { Uploader, UploadParams } from '@/domain/identity/application/storage/uploader'
import { EnvService } from '@/infra/env/env.service'
import { BadGatewayException, Injectable } from '@nestjs/common'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { Readable } from 'node:stream'

type CloudinaryClient = typeof cloudinary

@Injectable()
export class CloudinaryStorage implements Uploader {
    private client: CloudinaryClient

    constructor(private env: EnvService) {
        this.client = cloudinary

        this.client.config({
            cloud_name: this.env.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.env.get('CLOUDINARY_API_KEY'),
            api_secret: this.env.get('CLOUDINARY_API_SECRET'),
        })
    }

    async upload({ fileName, body }: UploadParams): Promise<{ url: string }> {
        try {
            const result = await new Promise<UploadApiResponse>((resolve, reject) => {
                const stream = this.client.uploader.upload_stream(
                    {
                        folder: 'avatars',
                        resource_type: 'image',
                        public_id: fileName,
                        transformation: [{ width: 256, height: 256, crop: 'fill' }], // opcional para avatars
                    },
                    (error, result) => {
                        if (error) return reject(error)
                        if (!result) return reject(new Error('Upload failed'))
                        resolve(result)
                    }
                )

                Readable.from(body).pipe(stream)
            })

            return { url: result.secure_url }
        } catch (error) {
            throw new BadGatewayException(error.message ?? 'Cloudinary upload error')
        }
    }
}