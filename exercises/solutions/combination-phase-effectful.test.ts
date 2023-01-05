import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

describe.skip("combination phase - effectful", () => {
  type Item = {
    qty: number
  }

  const itemCtor = (qty: number): Item => ({ qty })

  const createItem = (qty: string): Option<Item> =>
    qty.match(/^[0-9]+$/i) ? O.some(itemCtor(Number(qty))) : O.none

  const checkIn =
    (value: number) =>
    (item: Item): Item =>
      itemCtor(item.qty + value)

  const checkOut =
    (value: number) =>
    (item: Item): Option<Item> =>
      value <= item.qty ? O.some(itemCtor(item.qty - value)) : O.none

  test("checkOut after valid creation", () => {
    const result = pipe(createItem("100"), O.chain(checkOut(10)))

    expect(result).toStrictEqual(O.some({ qty: 90 }))
  })

  test("checkOut after invalid creation", () => {
    const result = pipe(createItem("asd"), O.chain(checkOut(10)))

    expect(result).toStrictEqual(O.none)
  })

  test("checkIn and checkOut after valid creation", () => {
    const result = pipe(
      createItem("100"),
      O.map(checkIn(10)),
      O.chain(checkOut(20)),
    )

    expect(result).toStrictEqual(O.some({ qty: 90 }))
  })
})
