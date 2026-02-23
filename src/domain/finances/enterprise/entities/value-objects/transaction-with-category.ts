import { Optional } from '@/core/types/optional'
import { ValueObject } from '@/core/entities/value-object'

export interface TransactionWithCategoryProps {
    title: string
    amount: number
    operation: 'income' | 'expense'
    method: string | null
    category: {
        name: string
        slug: string
    } | null
    createdAt: Date
}

export class TransactionWithCategory extends ValueObject<TransactionWithCategoryProps> {
    static create(
        props: Optional<TransactionWithCategoryProps, 'category' | 'method'>,
    ) {
        return new TransactionWithCategory(
            {
                ...props,
                method: props.method ?? null,
                category: props.category ?? null
            },
        )
    }

    get title() {
    return this.props.title
  }

  get amount() {
    return this.props.amount
  }

  get operation() {
    return this.props.operation
  }

  get method() {
    return this.props.method
  }

  get createdAt() {
    return this.props.createdAt
  }

  get category() {
    return this.props.category
  }
}