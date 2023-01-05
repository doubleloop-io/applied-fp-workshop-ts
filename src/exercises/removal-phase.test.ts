import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

// TODO - 1: for each test, remove the skip marker and make it green
describe("removal phase", () => {
  type Item = {
    qty: number
  }

  const itemCtor = (qty: number): Item => ({ qty })

  const createItem = (qty: string): Option<Item> =>
    qty.match(/^[0-9]+$/i) ? O.some(itemCtor(Number(qty))) : O.none

  test.skip("item creation", () => {
    const result = pipe(
      createItem("100"),
      // TODO - 2: use 'fold' to produce a string (valid case)
    )

    expect(result).toStrictEqual("100")
  })

  test.skip.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
    const result = pipe(
      createItem(x),
      // TODO - 3: use 'fold' to produce a string (invalid case)
    )

    expect(result).toStrictEqual("alternative value")
  })

  test.skip("get or default - valid", () => {
    const result = pipe(
      createItem("10"),
      O.getOrElse(() => itemCtor(0)),
    )

    // TODO - 4: change expectation
    expect(result).toStrictEqual(null)
  })

  test.skip("get or default - invalid", () => {
    const result = pipe(
      createItem("asd"),
      O.getOrElse(() => itemCtor(0)),
    )

    // TODO - 5: change expectation
    expect(result).toStrictEqual(null)
  })
})
