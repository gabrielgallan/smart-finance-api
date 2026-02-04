import { Hash } from './hash'

describe('Value object Hash tests', () => {
  it('should be able to hash a text', async () => {
    const hashedText = await Hash.crate('example-text')

    expect(hashedText).toBeInstanceOf(Hash)
    expect(hashedText.value).toBeTypeOf('string')
  })
})
