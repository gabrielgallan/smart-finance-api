import { Either, left, right } from './either'

function sut(x: boolean): Either<string, number> {
  if (x) {
    return right(10)
  } else {
    return left('error')
  }
}

describe('Functional error handling tests', () => {
  it('Testing success result', () => {
    const successResult = sut(true)

    expect(successResult.isRight()).toBe(true)
    expect(successResult.value).toBe(10)
  })

  it('Testing error result', () => {
    const errorResult = sut(false)

    expect(errorResult.isLeft()).toBe(true)
  })
})
