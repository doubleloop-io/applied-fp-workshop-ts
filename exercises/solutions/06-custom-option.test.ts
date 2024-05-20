import { flow, identity, pipe } from "fp-ts/function"

describe.skip("custom option monad", () => {
  const increment: (x: number) => number = (x) => x + 1

  const reverseString: (x: number) => Option<string> = (x) =>
    some(x.toString().split("").reverse().join(""))

  test("creation phase", () => {
    const result = of(10)

    expect(result).toStrictEqual(some(10))
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
    // https://wiki.haskell.org/Functor

    test("identity: identities map to identities", () => {
      // map(fa, a => a) == fa
      const result = pipe(some(10), map(identity))
      const expected = some(10)
      expect(result).toStrictEqual(expected)
    })

    test("composition: mapping a composition is the composition of the mappings", () => {
      // map(fa, a => bc(ab(a))) <-> F.map(F.map(fa, ab), bc)
      const result = pipe(some(10), map(increment), map(increment))
      const expected = pipe(some(10), map(flow(increment, increment)))
      expect(result).toStrictEqual(expected)
    })
  })

  describe("monad laws", () => {
    // https://wiki.haskell.org/Monad_laws

    test("left identity", () => {
      // flatMap(of(a), f) == f(a)
      const result = pipe(some(10), flatMap(reverseString))
      const expected = reverseString(10)
      expect(result).toStrictEqual(expected)
    })

    test("right identity", () => {
      // flatMap(fa, of) == fa
      const result = pipe(some(10), flatMap(some))
      const expected = some(10)
      expect(result).toStrictEqual(expected)
    })

    test("associativity", () => {
      // flatMap(flatMap(fa, afb), bfc) == flatMap(fa, a => flatMap(afb(a), bfc))
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
