import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

// TODO - 1: remove skip marker
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
    const result = pipe(
      createItem("100"),
      // TODO - 2: use 'chain' to check out 10
    )

    // TODO - 3: change expectation
    expect(result).toStrictEqual(null)
  })

  test("checkOut after invalid creation", () => {
    const result = pipe(
      createItem("asd"),
      // TODO - 4: check out 10
    )

    // TODO - 5: change expectation
    expect(result).toStrictEqual(null)
  })

  test("checkIn and checkOut after valid creation", () => {
    const result = pipe(
      createItem("100"),
      // TODO - 6: check in 10
      // TODO - 7: check out 20
    )

    // TODO - 8: change expectation
    expect(result).toStrictEqual(null)
  })
})
