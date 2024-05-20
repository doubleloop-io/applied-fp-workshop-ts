import { pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import { Option } from "fp-ts/Option"

describe.skip("combination phase - many", () => {
  // Applicative (Functor):
  // 1. any type constructor:
  //      F<A>
  // 2. with ap function:
  //      (Option<A>) => (Option<A => B>) => Option<B>
  // 3. and with of (alias: pure) function:
  //      (A) => Option<A>
  // 4. that respect laws (tests)
  //      identity, composition, homomorphism, interchange

  type Item = Readonly<{ name: string; qty: number }>
  const item =
    (name: string) =>
      (qty: number): Item => ({ name, qty })

  const checkName = (value: string): Option<string> =>
    value ? O.some(value) : O.none

  const checkQty = (value: string): Option<number> =>
    value.match(/^[0-9]+$/i) ? O.some(Number(value)) : O.none

  const parseItem = (name: string, qty: string): Option<Item> =>
    pipe(O.of(item), O.ap(checkName(name)), O.ap(checkQty(qty)))

  // NOTE: another different way with only Functor and Monad
  const createItemNoAp = (name: string, qty: string): Option<Item> => {
    return pipe(
      checkName(name),
      O.flatMap((n) =>
        pipe(
          checkQty(qty),
          O.map((q) => item(n)(q)),
        ),
      ),
    )
  }

  test("creation with valid parameters", () => {
    const result = parseItem("foo", "100")

    expect(result).toStrictEqual(O.some(item("foo")(100)))
  })

  test("creation with invalid name", () => {
    const result = parseItem("", "100")

    expect(result).toStrictEqual(O.none)
  })

  test("creation with invalid quantity", () => {
    const result = parseItem("foo", "")

    expect(result).toStrictEqual(O.none)
  })
})
