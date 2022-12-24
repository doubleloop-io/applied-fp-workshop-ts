import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

// TODO - 1: remove skip marker
describe.skip("removal phase", () => {
  type Item = {
    qty: number
  }

  const itemCtor = (qty: number): Item => ({ qty })

  type createItemFn = (qty: string) => Option<Item>
  const createItem: createItemFn = (qty) =>
    qty.match(/^[0-9]+$/i) ? O.some(itemCtor(parseInt(qty, 10))) : O.none

  test("item creation", () => {
    const result = pipe(
      createItem("100"),
      // TODO - 2: use 'fold' to produce a string (valid case)
    )

    expect(result).toStrictEqual("100")
  })

  test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
    const result = pipe(
      createItem(x),
      // TODO - 3: use 'fold' to produce a string (invalid case)
    )

    expect(result).toStrictEqual("alternative value")
  })

  test("get or default - valid", () => {
    const result = pipe(
      createItem("10"),
      O.getOrElse(() => itemCtor(0)),
    )

    // TODO - 4: change expectation
    expect(result).toStrictEqual(null)
  })

  test("get or default - invalid", () => {
    const result = pipe(
      createItem("asd"),
      O.getOrElse(() => itemCtor(0)),
    )

    // TODO - 5: change expectation
    expect(result).toStrictEqual(null)
  })
})
