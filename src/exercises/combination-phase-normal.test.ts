import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

// TODO - 1: remove skip marker
describe.skip("combination phase - normal", () => {
  type Item = {
    qty: number
  }

  const itemCtor = (qty: number): Item => ({ qty })

  const createItem = (qty: string): Option<Item> =>
    qty.match(/^[0-9]+$/i) ? O.some(itemCtor(parseInt(qty, 10))) : O.none

  const checkIn =
    (value: number) =>
    (item: Item): Item =>
      itemCtor(item.qty + value)

  test("checkIn after valid creation", () => {
    const result = pipe(
      createItem("100"),
      // TODO - 2: use 'map' to check in 10
    )

    // TODO - 3: change expectation
    expect(result).toStrictEqual(null)
  })

  test("checkIn after invalid creation", () => {
    const result = pipe(
      createItem("asd"),
      // TODO - 4: check in 10
    )

    // TODO - 5: change expectation
    expect(result).toStrictEqual(null)
  })
})
