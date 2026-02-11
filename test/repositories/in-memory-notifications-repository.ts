import { INotificationsRepository } from "@/domain/notifications/application/repositories/notifications.repository";
import { Notification } from "@/domain/notifications/enterprise/entities/notification";

export class InMemoryNotificationsRepository implements INotificationsRepository {
    public items: Notification[] = []
    
    async create(notification: Notification) {
        this.items.push(notification)
        return
    }
    
    async findById(id: string) {
        const notification = this.items.find(n => n.id.toString() === id)
        
        return notification ?? null
    }
    
    async findManyByRecipientId(recipietId: string) {
        const notifications = this.items.filter(n => n.recipientId.toString() === recipietId)

        return notifications
    }

    async save(notification: Notification) {
        const notificationIndex = this.items.findIndex(n => n.id.toString() === notification.id.toString())

        if (notificationIndex >= 0) {
            this.items[notificationIndex] = notification
        }

        return this.items[notificationIndex]
    }
}