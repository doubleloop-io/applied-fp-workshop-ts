import * as T from "fp-ts/Task"
import { Task } from "fp-ts/Task"
import { pipe } from "fp-ts/function"

describe("Task api", () => {
  // Represents an asynchronous computation that
  // yields a value and never fails.

  it("constructors", async () => {
    // From a value
    //    v-- it's type is IO<number>
    const t1 = T.of(5)

    // It's just a wrapper type
    // of a function () => Promise<A>
    const v1 = await t1()
    expect(v1).toEqual(5)

    // From a function
    const t2: Task<number> = () => Promise.resolve(5)
    const v2 = await t2()
    expect(v2).toEqual(5)
  })

  it("mapping", async () => {
    const t1 = T.of(5)

    // Change the type parameter's type
    //    v-- it's type is IO<string>
    const t2 = pipe(
      t1,
      T.map((x) => x.toString()),
    )
    expect(await t2()).toEqual("5")
  })
})
