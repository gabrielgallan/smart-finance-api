import { Notification } from "../../enterprise/entities/notification"


export interface INotificationsRepository {
  create(notification: Notification): Promise<void>
  findById(id: string): Promise<Notification | null>
  findManyByRecipientId(recipietId: string): Promise<Notification[]>
  save(notification: Notification): Promise<Notification>
}
