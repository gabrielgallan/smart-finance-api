import { Slug } from './slug'

describe('Value object Slug tests', () => {
  it('should be able to create slug from a text', async () => {
    const slugText = Slug.createFromText('Example Text ')

    expect(slugText).toBeInstanceOf(Slug)
    expect(slugText.value).toBe('example-text')
  })
})
