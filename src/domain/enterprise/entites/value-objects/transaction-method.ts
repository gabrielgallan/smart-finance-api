export enum Method {
    DEBIT = 'debit',
    CREDIT = 'credit',
    PIX = 'pix',
    UNKNOWN = 'unknown'
}

/**
 * Manage property method from entity {Transaction}
 * 
 * Receive a input string and it returns a Method of payment
 * 
 * @example
 * 
 * method: TransactionMethod.debit() => Method.DEBIT
 *  or
 * method: TransactionMethod.from('credit') => Method.CREDIT
 */
export class TransactionMethod {
  private constructor(
    public readonly value: Method
  ) {}

  static debit() {
    return new TransactionMethod(Method.DEBIT)
  }

  static credit() {
    return new TransactionMethod(Method.CREDIT)
  }

  static pix() {
    return new TransactionMethod(Method.PIX)
  }

  static unknown() {
    return new TransactionMethod(Method.UNKNOWN)
  }

  static from(input?: string) {
    switch (input) {
      case 'debit':
        return this.debit()
      case 'credit':
        return this.credit()
      case 'pix':
        return this.pix()
      default:
        return this.unknown()
    }
  }
}
