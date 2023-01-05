import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

describe.skip("removal phase", () => {
  type Item = {
    qty: number
  }

  const itemCtor = (qty: number): Item => ({ qty })

  const createItem = (qty: string): Option<Item> =>
    qty.match(/^[0-9]+$/i) ? O.some(itemCtor(Number(qty))) : O.none

  test("item creation", () => {
    const result = pipe(
      createItem("100"),
      O.fold(
        () => "alternative value",
        (x) => x.qty.toString(),
      ),
    )

    expect(result).toStrictEqual("100")
  })

  test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
    const result = pipe(
      createItem(x),
      O.fold(
        () => "alternative value",
        (x) => x.qty.toString(),
      ),
    )

    expect(result).toStrictEqual("alternative value")
  })

  test("get or default - valid", () => {
    const result = pipe(
      createItem("10"),
      O.getOrElse(() => itemCtor(0)),
    )

    expect(result).toStrictEqual(itemCtor(10))
  })

  test("get or default - invalid", () => {
    const result = pipe(
      createItem("asd"),
      O.getOrElse(() => itemCtor(0)),
    )

    expect(result).toStrictEqual(itemCtor(0))
  })
})
