import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

describe.skip("creation phase", () => {
  type Item = {
    qty: number
  }

  const item = (qty: number): Item => ({ qty })

  type OptionalItem = Invalid | Valid
  type Invalid = {
    readonly _tag: "Invalid"
  }
  type Valid = {
    readonly _tag: "Valid"
    readonly value: Item
  }
  const invalid = (): Invalid => ({ _tag: "Invalid" })

  const valid = (item: Item): Valid => ({ _tag: "Valid", value: item })

  const createItem = (qty: string): OptionalItem =>
    qty.match(/^[0-9]+$/i) ? valid(item(Number(qty))) : invalid()

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

  const createItemFpTs = (qty: string): Option<Item> =>
    qty.match(/^[0-9]+$/i) ? O.some({ qty: Number(qty) }) : O.none

  test("item creation", () => {
    const result = createItemFpTs("10")

    expect(result).toStrictEqual(O.some({ qty: 10 }))
  })

  test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
    const result = createItemFpTs(x)

    expect(result).toStrictEqual(O.none)
  })
})
