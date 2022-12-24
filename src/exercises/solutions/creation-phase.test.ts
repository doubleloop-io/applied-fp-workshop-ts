import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

describe.skip("creation phase", () => {
  type Item = {
    qty: number
  }

  const itemCtor = (qty: number): Item => ({ qty })

  type OptionalItem = Invalid | Valid
  type Invalid = {
    readonly _tag: "Invalid"
  }
  type Valid = {
    readonly _tag: "Valid"
    readonly value: Item
  }
  type invalidFn = () => Invalid
  const invalid: invalidFn = () => ({ _tag: "Invalid" })

  type validFn = (a: Item) => Valid
  const valid: validFn = (a) => ({ _tag: "Valid", value: a })

  type createItemFn = (qty: string) => OptionalItem
  const createItem: createItemFn = (qty) =>
    qty.match(/^[0-9]+$/i) ? valid(itemCtor(parseInt(qty, 10))) : invalid()

  test("item creation", () => {
    const result = createItem("10")

    expect(result).toStrictEqual({
      _tag: "Valid",
      value: { qty: 10 },
    })
  })

  test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
    const result = createItem(x)

    expect(result).toStrictEqual({
      _tag: "Invalid",
    })
  })

  type createItemFpTsFn = (qty: string) => Option<Item>
  const createItemFpTs: createItemFpTsFn = (qty) =>
    qty.match(/^[0-9]+$/i) ? O.some({ qty: parseInt(qty, 10) }) : O.none

  test("item creation", () => {
    const result = createItemFpTs("10")

    expect(result).toStrictEqual(O.some({ qty: 10 }))
  })

  test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
    const result = createItemFpTs(x)

    expect(result).toStrictEqual(O.none)
  })
})
