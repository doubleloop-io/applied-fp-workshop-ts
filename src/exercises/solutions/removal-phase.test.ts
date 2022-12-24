import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

describe.skip("removal phase", () => {
  type Item = {
    qty: number
  }

  type itemCtorFn = (qty: number) => Item
  const itemCtor: itemCtorFn = (qty): Item => ({ qty })

  type createItemFn = (qty: string) => Option<Item>
  const createItem: createItemFn = (qty) =>
    qty.match(/^[0-9]+$/i) ? O.some(itemCtor(parseInt(qty, 10))) : O.none

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
