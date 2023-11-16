import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

// TODO  1: for each test, remove the skip marker and make it green
describe("combination phase - normal", () => {
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

  test.skip("checkIn after valid creation", () => {
    const result = pipe(
      parseItem("100"),
      // TODO  2: use 'map' to check in 10
    )

    // TODO  3: change expectation
    expect(result).toStrictEqual(null)
  })

  test.skip("checkIn after invalid creation", () => {
    const result = pipe(
      parseItem("asd"),
      // TODO  4: check in 10
    )

    // TODO  5: change expectation
    expect(result).toStrictEqual(null)
  })
})
