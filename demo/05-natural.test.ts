import * as O from "fp-ts/Option"
import * as E from "fp-ts/Either"
import * as TE from "fp-ts/TaskEither"
import { pipe } from "fp-ts/function"

describe("natural transformation", () => {
  // Natural transformation is a conversion between two effects

  describe("from Option to Either", () => {
    test("some value", () => {
      const result = pipe(
        O.some(42),
        E.fromOption(() => "error"),
      )

      expect(result).toStrictEqual(E.right(42))
    })

    test("none value", () => {
      const result = pipe(
        O.none,
        E.fromOption(() => "error"),
      )
      expect(result).toStrictEqual(E.left("error"))
    })
  })

  describe("from Either to TaskEither", () => {
    test("right value", async () => {
      const result = await pipe(E.right(42), TE.fromEither)()

      expect(result).toStrictEqual(await TE.of(42)())
    })

    test("left value", async () => {
      const result = await pipe(E.left("error"), TE.fromEither)()

      expect(result).toStrictEqual(await TE.left("error")())
    })
  })
})
