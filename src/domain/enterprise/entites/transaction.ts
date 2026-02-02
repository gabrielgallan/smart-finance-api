import { Entity } from "@/core/entities/entity"

interface TransactionProps {
    accountId: string
    amount: number
    title: string
}

export class Transaction extends Entity<TransactionProps> {
}