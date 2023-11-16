import { pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import { Option } from "fp-ts/Option"

// TODO  1: for each test, remove the skip marker and make it green
describe("combination phase - effectful", () => {
  type Item = {
    qty: number
  }

  const item = (qty: number): Item => ({ qty })

  const parseItem = (qty: string): Option<Item> =>
    qty.match(/^[0-9]+$/i) ? O.some(item(Number(qty))) : O.none

  const checkIn =
    (value: number) =>
    (current: Item): Item =>
      item(current.qty + value)

  const checkOut =
    (value: number) =>
    (current: Item): Option<Item> =>
      value <= current.qty ? O.some(item(current.qty - value)) : O.none

  test.skip("checkOut after valid creation", () => {
    const result = pipe(
      parseItem("100"),
      // TODO  2: use 'chain' to check out 10
    )

    expect(result).toStrictEqual(O.some({ qty: 90 }))
  })

  test.skip("checkOut after invalid creation", () => {
    const result = pipe(
      parseItem("asd"),
      // TODO  3: check out 10
    )

    expect(result).toStrictEqual(O.none)
  })

  test.skip("checkIn and checkOut after valid creation", () => {
    const result = pipe(
      parseItem("100"),
      // TODO  4: check in 10
      // TODO  5: check out 20
    )

    expect(result).toStrictEqual(O.some({ qty: 90 }))
  })
})
