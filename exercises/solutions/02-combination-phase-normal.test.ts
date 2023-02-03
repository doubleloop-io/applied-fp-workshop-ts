import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

describe.skip("combination phase - normal", () => {
  type Item = {
    qty: number
  }

  const item = (qty: number): Item => ({ qty })

  const createItem = (qty: string): Option<Item> =>
    qty.match(/^[0-9]+$/i) ? O.some(item(Number(qty))) : O.none

  const checkIn =
    (value: number) =>
    (current: Item): Item =>
      item(current.qty + value)

  test("checkIn after valid creation", () => {
    const result = pipe(createItem("100"), O.map(checkIn(10)))

    expect(result).toStrictEqual(O.some({ qty: 110 }))
  })

  test("checkIn after invalid creation", () => {
    const result = pipe(createItem("asd"), O.map(checkIn(10)))

    expect(result).toStrictEqual(O.none)
  })
})
