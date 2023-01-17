import * as I from "fp-ts/IO"
import { IO } from "fp-ts/IO"
import { pipe } from "fp-ts/function"

describe("IO api", () => {
  // Represents a synchronous computation that
  // yields a value and never fails.

  it("constructors", () => {
    // From a value
    //    v-- it's type is IO<number>
    const io1 = I.of(5)

    // It's just a wrapper type
    // of a function () => A
    const v1 = io1()
    expect(v1).toEqual(5)

    // From a function
    const io2: IO<number> = () => 5
    const v2 = io2()
    expect(v2).toEqual(5)
  })

  it("mapping", () => {
    const io1 = I.of(5)

    // Change the type parameter's type
    //    v-- it's type is IO<string>
    const io2 = pipe(
      io1,
      I.map((x) => x.toString()),
    )
    expect(io2()).toEqual("5")
  })
})
