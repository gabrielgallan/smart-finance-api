import { TransactionWithCategory, TransactionWithCategoryProps } from "@/domain/finances/enterprise/entities/value-objects/transaction-with-category";

export class TransactionPresenter {
    static toHTTP(
        transaction: TransactionWithCategory
    ): TransactionWithCategoryProps 
    {
        return {
            title: transaction.title,
            amount: transaction.amount,
            operation: transaction.operation,
            method: transaction.method,
            createdAt: transaction.createdAt,
            category: transaction.category
        }
    }
}