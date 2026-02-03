import { Method, TransactionMethod } from "./transaction-method"

describe('Value object TransactionMethod', () => {
    it('should be able to create a Method from class methods', async () => {
        const method = TransactionMethod.debit()

        expect(method).toBeInstanceOf(TransactionMethod)
        expect(method.value).toBe(Method.DEBIT_CARD)
    })

    it('should be able to create a Method from inputs', async () => {
        const method = TransactionMethod.from('PIX')

        expect(method).toBeInstanceOf(TransactionMethod)
        expect(method.value).toBe(Method.PIX)
    })
})