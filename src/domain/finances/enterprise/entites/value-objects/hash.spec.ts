import { Hash } from './hash'

describe('Value object Hash tests', () => {
  it('should be able to hash a text', async () => {
    const hashedText = await Hash.create('example-text')

    expect(hashedText).toBeInstanceOf(Hash)
    expect(hashedText.value).toBeTypeOf('string')
  })

  it('should be able to compare a value with the Hash created', async () => {
    const hashedText = await Hash.create('example-text')

    const isTextCompatible = await hashedText.compare('example-text')

    expect(isTextCompatible).toBe(true)
  })
})
