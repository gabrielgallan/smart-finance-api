import { Transaction } from '@/domain/finances/enterprise/entities/transaction'

type FindHighestOperationDayInput = Transaction[]

type FindHighestOperationDayOutput = Date | null

export function findHighestOperationDay(
  transactionsByOperation: FindHighestOperationDayInput,
): FindHighestOperationDayOutput {
  if (transactionsByOperation.length === 0) {
    return null
  }

  const totalsByDay = new Map<string, number>()

  for (const transaction of transactionsByOperation) {
    // normaliza para o dia (YYYY-MM-DD)
    const dayKey = transaction.createdAt.toISOString().split('T')[0]

    const currentTotal = totalsByDay.get(dayKey) ?? 0
    
    totalsByDay.set(dayKey, currentTotal + transaction.amount)
  }

  let highestDay: string | null = null
  let highestTotal = 0

  for (const [day, total] of totalsByDay.entries()) {
    if (total > highestTotal) {
      highestTotal = total
      highestDay = day
    }
  }

  return highestDay ? new Date(highestDay) : null
}
