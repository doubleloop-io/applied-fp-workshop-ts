import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

describe.skip("combination phase - many", () => {
  type Item = {
    name: string
    qty: number
  }

  const itemCtor =
    (name: string) =>
    (qty: number): Item => ({ name, qty })

  const checkName = (value: string): Option<string> => (value ? O.some(value) : O.none)

  const checkQty = (value: string): Option<number> =>
    value.match(/^[0-9]+$/i) ? O.some(Number(value)) : O.none

  const createItem = (name: string, qty: string): Option<Item> =>
    pipe(O.of(itemCtor), O.ap(checkName(name)), O.ap(checkQty(qty)))

  // NOTE: different way, call the first effectful function,
  // map the pure function and then use 'ap' for each remaining parameter.
  // More idiomatic in Haskell.
  const createItemDifferent = (name: string, qty: string): Option<Item> =>
    pipe(checkName(name), O.map(itemCtor), O.ap(checkQty(qty)))

  // NOTE: another different way with only Functor and Monad
  const createItemNoAp = (name: string, qty: string): Option<Item> => {
    return pipe(
      checkName(name),
      O.chain((n) =>
        pipe(
          checkQty(qty),
          O.map((q) => ({ name: n, qty: q })),
        ),
      ),
    )
  }

  test("creation with valid parameters", () => {
    const result = createItem("foo", "100")

    expect(result).toStrictEqual(O.some({ name: "foo", qty: 100 }))
  })

  test("creation with invalid name", () => {
    const result = createItem("", "100")

    expect(result).toStrictEqual(O.none)
  })

  test("creation with invalid quantity", () => {
    const result = createItem("foo", "")

    expect(result).toStrictEqual(O.none)
  })
})
