import * as O from "fp-ts/Option"
import * as E from "fp-ts/Either"
import * as TE from "fp-ts/TaskEither"
import { pipe } from "fp-ts/function"

describe("natural transformation", () => {
  // Natural transformation is a conversion between two effects

  test("from Option to Either", () => {
    expect(
      pipe(
        O.some(42),
        E.fromOption(() => "error"),
      ),
    ).toEqual(E.right(42))

    expect(
      pipe(
        O.none,
        E.fromOption(() => "error"),
      ),
    ).toEqual(E.left("error"))
  })

  test("from Either to TaskEither", async () => {
    expect(await pipe(E.right(42), TE.fromEither)()).toEqual(await TE.of(42)())
    expect(await pipe(E.left("error"), TE.fromEither)()).toEqual(
      await TE.left("error")(),
    )
  })
})
