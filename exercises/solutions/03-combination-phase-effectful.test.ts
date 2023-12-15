import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

describe.skip("combination phase - effectful", () => {
  type Item = Readonly<{ qty: number }>

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

  // flatMap: (A => Option<B>) => (Option<A>) => Option<B>

  test("checkOut after valid creation", () => {
    const result = pipe(parseItem("100"), O.flatMap(checkOut(10)))

    expect(result).toStrictEqual(O.some(item(90)))
  })

  test("checkOut after invalid creation", () => {
    const result = pipe(parseItem("asd"), O.flatMap(checkOut(10)))

    expect(result).toStrictEqual(O.none)
  })

  test("too musch checkOut after valid creation", () => {
    const result = pipe(parseItem("100"), O.flatMap(checkOut(110)))

    expect(result).toStrictEqual(O.none)
  })

  test("checkIn and checkOut after valid creation", () => {
    const result = pipe(
      parseItem("100"),
      O.map(checkIn(10)),
      O.flatMap(checkOut(20)),
    )

    expect(result).toStrictEqual(O.some(item(90)))
  })
})
