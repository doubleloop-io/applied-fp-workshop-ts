import * as TE from "fp-ts/TaskEither"
import { TaskEither } from "fp-ts/TaskEither"
import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/function"

describe("TaskEither api", () => {
  // Represents an asynchronous computation that
  // yields a value or fails yielding an error

  it("constructors", async () => {
    // Right constructor fix only the right type parameter so,
    //    v-- it's type is TaskEither<never, number>
    const te1 = TE.right(5)

    // It's just a wrapper type
    // of a function () => Promise<Either<E, A>>
    const v1 = await te1()
    expect(v1).toEqual(E.right(5))

    //    v-- it's type is TaskEither<number, never>
    const te2 = TE.left(5)
    expect(await te2()).toEqual(E.left(5))

    // Explicit types to fix even the left type parameter
    //    v-- it's type is TaskEither<string, number>
    const te3 = TE.right<string, number>(5)
    expect(await te3()).toEqual(E.right(5))

    // Function definition helps the type inference
    const foo = (e: TaskEither<string, number>) => e
    //    v-- it's type is TaskEither<string, number>
    const te4 = foo(TE.right(5))
    expect(await te4()).toEqual(E.right(5))
  })

  it("mapping", async () => {
    const te1 = TE.right<string, number>(5)
    expect(await te1()).toEqual(E.right(5))

    // Change the right type parameter's type
    //    v-- it's type is TaskEither<string, string>
    const te2 = pipe(
      te1,
      TE.map((x) => x.toString()),
    )
    expect(await te2()).toEqual(E.right("5"))

    // Change either state (from right to left)
    //    v-- it's type is TaskEither<string, string>
    const te3 = pipe(
      te2,
      TE.chain((x) => TE.left<string, string>(`error${x}`)),
    )
    expect(await te3()).toEqual(E.left("error5"))

    // Change the left type parameter's type
    //    v-- it's type is TaskEither<number, string>
    const te4 = pipe(
      te3,
      TE.mapLeft((x) => x.length),
    )
    expect(await te4()).toEqual(E.left(6))

    // Change both type parameters types
    //    v-- it's type is TaskEither<string, number>
    const te5 = pipe(
      te4,
      TE.bimap(
        (l) => l.toString(),
        (r) => r.length,
      ),
    )
    expect(await te5()).toEqual(E.left("6"))
  })
})
