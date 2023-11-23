import * as E from "fp-ts/Either"
import { Either } from "fp-ts/Either"
import { pipe } from "fp-ts/function"

describe("Either api", () => {
  // Represents a value of one of two possible types (a disjoint union).
  // An instance of Either is either an instance of Left or Right.

  test("constructors", () => {
    // Right constructor fix only the right type parameter so,
    //    v-- it's type is Either<never, number>
    const e1 = E.right(5)
    expect(e1).toStrictEqual(E.right(5))
    //    v-- it's type is Either<number, never>
    const e2 = E.left(5)
    expect(e2).toStrictEqual(E.left(5))

    // Explicit types to fix even the left type parameter
    //    v-- it's type is Either<string, number>
    const e3 = E.right<string, number>(5)
    expect(e3).toStrictEqual(E.right(5))

    // Function definition helps the type inference
    const foo = (e: Either<string, number>) => e
    //    v-- it's type is Either<string, number>
    const e4 = foo(E.right(5))
    expect(e4).toStrictEqual(E.right(5))
  })

  test("mapping", () => {
    const e1 = E.right<string, number>(5)
    expect(e1).toStrictEqual(E.right(5))

    // Change the right type parameter's type
    //    v-- it's type is Either<string, string>
    const e2 = pipe(
      e1,
      E.map((x) => x.toString()),
    )
    expect(e2).toStrictEqual(E.right("5"))

    // Change either state (from right to left)
    //    v-- it's type is Either<string, string>
    const e3 = pipe(
      e2,
      E.flatMap((x) => E.left<string, string>(`error${x}`)),
    )
    expect(e3).toStrictEqual(E.left("error5"))

    // Change the left type parameter's type
    //    v-- it's type is Either<number, string>
    const e4 = pipe(
      e3,
      E.mapLeft((x) => x.length),
    )
    expect(e4).toStrictEqual(E.left(6))

    // Change both type parameters types
    //    v-- it's type is Either<string, number>
    const e5 = pipe(
      e4,
      E.bimap(
        (l) => l.toString(),
        (r) => r.length,
      ),
    )
    expect(e5).toStrictEqual(E.left("6"))
  })

  test("error handling", () => {
    // Provide alternative operation
    //    v-- it's type is Either<string, number>
    const e1 = pipe(
      E.left("a"),
      E.alt(() => E.right(2)),
    )
    expect(e1).toStrictEqual(E.right(2))

    // Provide alternative value
    //    v-- it's type is number
    const e2 = pipe(
      E.left("a"),
      E.getOrElse(() => 2),
    )
    expect(e2).toStrictEqual(2)

    // Provide alternative lifted value
    //    v-- it's type is Either<never, number>
    const e3 = pipe(
      E.left("a"),
      E.orElse((err) => E.right(err.length)),
    )
    expect(e3).toStrictEqual(E.right(1))
  })
})
