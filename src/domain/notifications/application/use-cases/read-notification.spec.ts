import { InMemoryNotificationsRepository } from "test/repositories/in-memory-notifications-repository"
import { INotificationsRepository } from "../repositories/notifications.repository"
import { ReadNotificationUseCase } from "./read-notification"
import { makeNotification } from "test/factories/make-notification"
import { UniqueEntityID } from "@/core/entities/unique-entity-id"

let notificationsRepository: INotificationsRepository
let sut: ReadNotificationUseCase

describe('Read notification use case', () => {
  beforeEach(() => {
    notificationsRepository = new InMemoryNotificationsRepository()
    sut = new ReadNotificationUseCase(notificationsRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to read a notification', async () => {
    vi.setSystemTime(new Date(2026, 0, 31, 20, 0, 0))

    await notificationsRepository.create(
        makeNotification(
            {
                recipientId: new UniqueEntityID('user-1')
            },
            new UniqueEntityID('notification-1')
        )
    )

    const result = await sut.execute({
        recipientId: 'user-1',
        notificationId: 'notification-1'
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.notification.readAt).toEqual(expect.any(Date))
    }
  })
})
