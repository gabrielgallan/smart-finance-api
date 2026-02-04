import { Method, TransactionMethod } from './transaction-method'

describe('Value object TransactionMethod', () => {
  it('should be able to create a Method from class methods', async () => {
    const debitMethod = TransactionMethod.debit()
    const creditMethod = TransactionMethod.credit()

    expect(debitMethod).toBeInstanceOf(TransactionMethod)
    expect(creditMethod).toBeInstanceOf(TransactionMethod)

    expect(debitMethod.value).toBe(Method.DEBIT)
    expect(creditMethod.value).toBe(Method.CREDIT)
  })

  it('should be able to create a Method from inputs', async () => {
    const method = TransactionMethod.from('pix')

    expect(method).toBeInstanceOf(TransactionMethod)
    expect(method.value).toBe(Method.PIX)
  })
})
