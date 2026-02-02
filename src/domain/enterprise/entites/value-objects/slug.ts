export class Slug {
  public value: string

  constructor(value: string) {
    this.value = value
  }

  /**
   * Receive a string and it returns a slug
   *
   * Example "An example text" => "an-example-slug"
   *
   * @param text {string}
   * @returns {Slug}
   */

  static createFromText(text: string) {
    const slugText = text
      .normalize('NFKD')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/_/g, '-')
      .replace(/--+/g, '-')
      .replace(/-$/g, '')

    return new Slug(slugText)
  }
}
