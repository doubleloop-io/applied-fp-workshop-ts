import * as O from "fp-ts/Option"
import { Option } from "fp-ts/Option"

describe.skip("creation phase", () => {
  type Item = Readonly<{ qty: number }>

  const item = (qty: number): Item => ({ qty })

  type OptionalItem = Invalid | Valid

  type Invalid = Readonly<{ _tag: "Invalid" }>
  type Valid = Readonly<{ _tag: "Valid"; value: Item }>

  const invalid = (): Invalid => ({ _tag: "Invalid" })

  const valid = (item: Item): Valid => ({ _tag: "Valid", value: item })

  const parseItem = (qty: string): OptionalItem =>
    qty.match(/^[0-9]+$/i) ? valid(item(Number(qty))) : invalid()

  test("item creation", () => {
    const result = parseItem("10")

    expect(result).toStrictEqual(valid(item(10)))
  })

  test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
    const result = parseItem(x)

    expect(result).toStrictEqual(invalid())
  })

  const createItemFpTs = (qty: string): Option<Item> =>
    qty.match(/^[0-9]+$/i) ? O.some({ qty: Number(qty) }) : O.none

  test("item creation", () => {
    const result = createItemFpTs("10")

    expect(result).toStrictEqual(O.some(item(10)))
  })

  test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
    const result = createItemFpTs(x)

    expect(result).toStrictEqual(O.none)
  })
})
