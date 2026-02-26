import { Controller, FileTypeValidator, InternalServerErrorException, MaxFileSizeValidator, NotFoundException, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { CurrentUser } from '../../../auth/current-user-decorator'
import type { UserPayload } from '../../../auth/jwt.strategy'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadAvatarUseCase } from '@/domain/identity/application/use-cases/upload-avatar'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller('/api')
@ApiTags('Profile')
export class UploadAvatarController {
    constructor(
        private uploadAvatar: UploadAvatarUseCase
    ) { }

    @Post('/profile/avatar')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'upload user avatar' })
    async handle(
        @CurrentUser() user: UserPayload,
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // 2MB
                new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' }),
            ],
        }),) file: Express.Multer.File
    ) {
        const result = await this.uploadAvatar.execute({
            userId: user.sub,
            fileName: file.filename,
            fileType: file.mimetype,
            body: file.buffer
        })

        if (result.isLeft()) {
            const error = result.value

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return
    }
}
