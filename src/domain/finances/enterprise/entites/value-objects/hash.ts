import { compare, hash } from 'bcryptjs'

export class Hash {
  public value: string

  constructor(value: string) {
    this.value = value
  }

  /**
   * Return a hash from text received
   *
   * @param text {string}
   * @returns {Hash}
   */
  static async create(text: string) {
    const textHash = await hash(text, 6)

    return new Hash(textHash)
  }

  /**
   * Receive a value to compare with Hash value
   *
   * @param value {string}
   * @returns {boolean}
   */
  async compare(value: string) {
    const isValueCompatible = await compare(value, this.value)

    return isValueCompatible
  }
}
