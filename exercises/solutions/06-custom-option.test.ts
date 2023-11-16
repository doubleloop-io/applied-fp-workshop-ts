import { flow, identity, pipe } from "fp-ts/function"

describe.skip("custom option monad", () => {
  const increment: (x: number) => number = (x) => x + 1

  const reverseString: (x: number) => Option<string> = (x) =>
    some(x.toString().split("").reverse().join(""))

  test("creation phase", () => {
    const result = of(10)

    expect(isSome(result)).toBeTruthy()
  })

  test("combination phase - normal", () => {
    const result = pipe(some(10), map(increment))

    expect(result).toStrictEqual(some(11))
  })

  test("combination phase - effectful", () => {
    const result = pipe(some(10), flatMap(reverseString))

    expect(result).toStrictEqual(some("01"))
  })

  test("removal phase - value", () => {
    const result = pipe(
      some(10),
      fold(
        () => "none",
        (x) => x.toString(),
      ),
    )

    expect(result).toStrictEqual("10")
  })

  test("removal phase - alternative value", () => {
    const result = pipe(
      none<string>(),
      fold(
        () => "none",
        (x) => x.toString(),
      ),
    )

    expect(result).toStrictEqual("none")
  })

  describe("functor laws", () => {
    test("identity: identities map to identities", () => {
      const result = pipe(some(10), map(identity))
      const expected = pipe(10, identity, some)
      expect(result).toStrictEqual(expected)
    })

    test("composition: mapping a composition is the composition of the mappings", () => {
      const result = pipe(some(10), map(increment), map(increment))
      const expected = pipe(some(10), map(flow(increment, increment)))
      expect(result).toStrictEqual(expected)
    })
  })

  describe("monad laws", () => {
    test("left identity", () => {
      const result = pipe(some(10), flatMap(reverseString))
      const expected = pipe(10, reverseString)
      expect(result).toStrictEqual(expected)
    })

    test("right identity", () => {
      const result = pipe(some(10), flatMap(some))
      const expected = pipe(10, some)
      expect(result).toStrictEqual(expected)
    })

    test("associativity", () => {
      const result = pipe(some(10), flatMap(some), flatMap(reverseString))
      const expected = pipe(
        some(10),
        flatMap((x) => pipe(some(x), flatMap(reverseString))),
      )
      expect(result).toStrictEqual(expected)
    })
  })

  // data types
  type Option<A> = None | Some<A>

  type None = Readonly<{ _tag: "None" }>
  type Some<A> = Readonly<{ _tag: "Some"; value: A }>

  // constructors
  const none = <A>(): Option<A> => ({ _tag: "None" })

  const some = <A>(a: A): Option<A> => ({ _tag: "Some", value: a })

  const of = <A>(a: A): Option<A> => (a ? some(a) : none())

  // utilities
  const isSome = <A>(fa: Option<A>): boolean => fa._tag === "Some"

  // combiners
  const map =
    <A, B>(f: (a: A) => B) =>
    (fa: Option<A>): Option<B> => {
      switch (fa._tag) {
        case "Some":
          return some(f(fa.value))
        case "None":
          return none()
      }
    }

  const flatMap =
    <A, B>(f: (a: A) => Option<B>) =>
    (fa: Option<A>): Option<B> => {
      switch (fa._tag) {
        case "Some":
          return f(fa.value)
        case "None":
          return none()
      }
    }

  // folders / runners
  const fold =
    <A, B>(onNone: () => B, onSome: (a: A) => B) =>
    (fa: Option<A>): B => {
      switch (fa._tag) {
        case "Some":
          return onSome(fa.value)
        case "None":
          return onNone()
      }
    }
})
