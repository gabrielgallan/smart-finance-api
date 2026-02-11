import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Either, right } from '@/core/types/either'
import { Notification } from '../../enterprise/entities/notification'
import { INotificationsRepository } from '../repositories/notifications.repository'

interface SendNotificationUseCaseRequest {
  recipientId: string
  title: string
  content: string
}

type SendNotificationUseCaseResponse = Either<
  null,
  { notification: Notification }
>

export class SendNotificationUseCase {
  constructor(
    private notificationsRepository: INotificationsRepository
) {}

  async execute({
    recipientId,
    title,
    content
  }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
    const notification = Notification.create({
        recipientId: new UniqueEntityID(recipientId),
        title,
        content
    })

    await this.notificationsRepository.create(notification)

    return right({
      notification
    })
  }
}
