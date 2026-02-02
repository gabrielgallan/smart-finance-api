import { hash } from 'bcryptjs'

export class Hash {
  public value: string

  constructor(value: string) {
    this.value = value
  }

  /**
   * Return a hash from text received
   *
   *
   * @param text {string}
   * @returns {Hash}
   */
  static async crate(text: string) {
    const textHash = await hash(text, 6)

    return new Hash(textHash)
  }
}
