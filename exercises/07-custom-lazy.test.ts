import { flow, identity, pipe } from "fp-ts/function"

// TODO 1: for each test, remove the skip marker and make it green
describe("custom lazy monad", () => {
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

  test.skip("creation phase", () => {
    // TODO 2: implement 'of' function
    const result = of(10)

    expect(result()).toStrictEqual(10)
  })

  test.skip("combination phase - normal", () => {
    // TODO 3: implement 'map' function
    const result = pipe(of(10), map(increment))

    expect(logs).toStrictEqual([])
    expect(result()).toStrictEqual(11)
    expect(logs).toStrictEqual(["increment"])
  })

  test.skip("combination phase - effectful", () => {
    // TODO 4: implement 'flatMap' function
    const result = pipe(of(10), flatMap(reverseString))

    expect(logs).toStrictEqual([])
    expect(result()).toStrictEqual("01")
    expect(logs).toStrictEqual(["reverseString"])
  })

  test.skip("removal phase - value", () => {
    // TODO 5: implement 'run' function
    const result = pipe(of(10), run())

    expect(result).toStrictEqual(10)
  })

  // TODO 6: remove skip marker and check if functor laws holds
  describe.skip("functor laws", () => {
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

  // TODO 7: remove skip marker and check if monad laws holds
  describe.skip("monad laws", () => {
    test("left identity", () => {
      const result = pipe(of(10), flatMap(reverseString))
      const expected = pipe(10, reverseString)
      expect(result()).toStrictEqual(expected())
    })

    test("right identity", () => {
      const result = pipe(of(10), flatMap(of))
      const expected = pipe(10, of)
      expect(result()).toStrictEqual(expected())
    })

    test("associativity", () => {
      const result = pipe(of(10), flatMap(of), flatMap(reverseString))
      const expected = pipe(
        of(10),
        flatMap((x) => pipe(of(x), flatMap(reverseString))),
      )
      expect(result()).toStrictEqual(expected())
    })
  })

  // data types
  type Lazy<A> = () => A

  // constructors
  const of =
    <A>(a: A): Lazy<A> =>
    () => {
      throw new Error("TODO")
    }

  // combiners
  const map =
    <A, B>(f: (a: A) => B) =>
    (fa: Lazy<A>): Lazy<B> =>
    () => {
      throw new Error("TODO")
    }

  const flatMap =
    <A, B>(f: (a: A) => Lazy<B>) =>
    (fa: Lazy<A>): Lazy<B> =>
    () => {
      throw new Error("TODO")
    }

  // folders / runners
  const run =
    <A>() =>
    (fa: Lazy<A>): A => {
      throw new Error("TODO")
    }
})
