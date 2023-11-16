import { flow, identity, pipe } from "fp-ts/function"

describe.skip("custom lazy monad", () => {
  let logs: string[] = []

  beforeEach(() => {
    logs = []
  })

  const log: (l: string) => void = (l) => (logs = [...logs, l])

  const increment: (x: number) => number = (x) => {
    log("increment")
    return x + 1
  }

  const reverseString: (x: number) => Lazy<string> = (x) => {
    log("reverseString")
    return of(x.toString().split("").reverse().join(""))
  }

  test("creation phase", () => {
    const result = of(10)

    expect(result()).toStrictEqual(10)
  })

  test("combination phase - normal", () => {
    const result = pipe(of(10), map(increment))

    expect(logs).toStrictEqual([])
    expect(result()).toStrictEqual(11)
    expect(logs).toStrictEqual(["increment"])
  })

  test("combination phase - effectful", () => {
    const result = pipe(of(10), chain(reverseString))

    expect(logs).toStrictEqual([])
    expect(result()).toStrictEqual("01")
    expect(logs).toStrictEqual(["reverseString"])
  })

  test("removal phase - value", () => {
    const result = pipe(of(10), run())

    expect(result).toStrictEqual(10)
  })

  describe("functor laws", () => {
    test("identity: identities map to identities", () => {
      const result = pipe(of(10), map(identity))
      const expected = pipe(10, identity, of)
      expect(result()).toStrictEqual(expected())
    })

    test("composition: mapping a composition is the composition of the mappings", () => {
      const result = pipe(of(10), map(increment), map(increment))
      const expected = pipe(of(10), map(flow(increment, increment)))
      expect(result()).toStrictEqual(expected())
    })
  })

  describe("monad laws", () => {
    test("left identity", () => {
      const result = pipe(of(10), chain(reverseString))
      const expected = pipe(10, reverseString)
      expect(result()).toStrictEqual(expected())
    })

    test("right identity", () => {
      const result = pipe(of(10), chain(of))
      const expected = pipe(10, of)
      expect(result()).toStrictEqual(expected())
    })

    test("associativity", () => {
      const result = pipe(of(10), chain(of), chain(reverseString))
      const expected = pipe(
        of(10),
        chain((x) => pipe(of(x), chain(reverseString))),
      )
      expect(result()).toStrictEqual(expected())
    })
  })

  // data types
  type Lazy<A> = () => A

  // constructors
  const of =
    <A>(a: A): Lazy<A> =>
    () =>
      a

  // combiners
  const map =
    <A, B>(f: (a: A) => B) =>
    (fa: Lazy<A>): Lazy<B> =>
    () =>
      f(fa())

  const chain =
    <A, B>(f: (a: A) => Lazy<B>) =>
    (fa: Lazy<A>): Lazy<B> =>
    () =>
      f(fa())()

  // folders / runners
  const run =
    <A>() =>
    (fa: Lazy<A>): A =>
      fa()
})
