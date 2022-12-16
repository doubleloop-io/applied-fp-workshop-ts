import * as myLib from '..'

describe('greet', () => {
  it('greets the world', () => {
    expect(myLib.greet('World')).toBe(`Hello, World!`)
  })
})
