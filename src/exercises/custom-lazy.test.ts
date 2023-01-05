import { pipe } from "fp-ts/function"

// TODO - 1: for each test, remove the skip marker and make it green
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
    // TODO - 2: implement 'of' function
    const result = of(10)

    expect(result()).toStrictEqual(10)
  })

  test.skip("combination phase - normal", () => {
    // TODO - 3: implement 'map' function
    const result = pipe(of(10), map(increment))

    expect(logs).toStrictEqual([])
    expect(result()).toStrictEqual(11)
    expect(logs).toStrictEqual(["increment"])
  })

  test.skip("combination phase - effectful", () => {
    // TODO - 4: implement 'chain' function
    const result = pipe(of(10), chain(reverseString))

    expect(logs).toStrictEqual([])
    expect(result()).toStrictEqual("01")
    expect(logs).toStrictEqual(["reverseString"])
  })

  test.skip("removal phase - value", () => {
    // TODO - 5: implement 'fold' function
    const result = pipe(of(10), run())

    expect(result).toStrictEqual(10)
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

  const chain =
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
