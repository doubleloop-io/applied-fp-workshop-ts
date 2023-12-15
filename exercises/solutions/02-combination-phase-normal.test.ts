import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

describe.skip("combination phase - normal", () => {
  // Functor:
  // 1. type constructor:
  //      F<A>
  // 2. map function:
  //      (A => B) => (F<A>) => F<B>
  // 3. respect laws (tests)
  //      identity, composition

  type Item = Readonly<{ qty: number }>
  const item = (qty: number): Item => ({ qty })

  const parseItem = (qty: string): Option<Item> =>
    qty.match(/^[0-9]+$/i) ? O.some(item(Number(qty))) : O.none

  const checkIn =
    (value: number) =>
    (current: Item): Item =>
      item(current.qty + value)

  test("checkIn after valid creation", () => {
    const result = pipe(parseItem("100"), O.map(checkIn(10)))

    expect(result).toStrictEqual(O.some(item(110)))
  })

  test("checkIn after invalid creation", () => {
    const result = pipe(parseItem("asd"), O.map(checkIn(10)))

    expect(result).toStrictEqual(O.none)
  })
})
