enum Method {
    DEBIT_CARD = "DEBIT_CARD",
    CREDIT_CARD = "CREDIT_CARD",
    PIX = "PIX",
    UNKNOWN = "UNKNOWN"
}

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
