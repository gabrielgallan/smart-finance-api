export enum Method {
    DEBIT_CARD = "DEBIT_CARD",
    CREDIT_CARD = "CREDIT_CARD",
    PIX = "PIX",
    UNKNOWN = "UNKNOWN"
}

/**
 * Manage property method from entity {Transaction}
 * 
 * Receive a input string and it returns a Method of payment
 * 
 * @example
 * 
 * method: TransactionMethod.debit() => Method.DEBIT_CARD
 *  or
 * method: TransactionMethod.from('CREDIT_CARD') => Method.CREDIT_CARD
 */
export class TransactionMethod {
  private constructor(
    public readonly value: Method
  ) {}

  static debit() {
    return new TransactionMethod(Method.DEBIT_CARD)
  }

  static credit() {
    return new TransactionMethod(Method.CREDIT_CARD)
  }

  static pix() {
    return new TransactionMethod(Method.PIX)
  }

  static unknown() {
    return new TransactionMethod(Method.UNKNOWN)
  }

  static from(input?: string) {
    switch (input) {
      case 'DEBIT_CARD':
        return this.debit()
      case 'CREDIT_CARD':
        return this.credit()
      case 'PIX':
        return this.pix()
      default:
        return this.unknown()
    }
  }
}
