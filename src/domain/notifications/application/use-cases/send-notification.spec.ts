import { InMemoryNotificationsRepository } from "test/repositories/in-memory-notifications-repository"
import { INotificationsRepository } from "../repositories/notifications.repository"
import { SendNotificationUseCase } from "./send-notification"
import { Notification } from "../../enterprise/entities/notification"

let notificationsRepository: INotificationsRepository
let sut: SendNotificationUseCase

describe('Send notification use case', () => {
  beforeEach(() => {
    notificationsRepository = new InMemoryNotificationsRepository()
    sut = new SendNotificationUseCase(notificationsRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to send a notification', async () => {
    vi.setSystemTime(new Date(2026, 0, 31, 20, 0, 0))

    const result = await sut.execute({
        recipientId: 'user-1',
        title: 'new notification',
        content: 'new notification to user 1'
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.notification).toBeInstanceOf(Notification)
      expect(result.value.notification.readAt).toBe(null)
      expect(result.value.notification.content).toBe('new notification to user 1')
    }
  })
})
