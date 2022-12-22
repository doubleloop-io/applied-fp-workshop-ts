import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

describe.skip("combination phase - many", () => {
    type Item = {
        name: string
        qty: number
    }

    type itemCtorFn = (name: string) => (qty: number) => Item
    const itemCtor: itemCtorFn =
        (name) =>
        (qty): Item => ({ name, qty })

    type checkNameFn = (qty: string) => Option<string>
    const checkName: checkNameFn = (value) => (value ? O.some(value) : O.none)

    type checkQtyFn = (qty: string) => Option<number>
    const checkQty: checkQtyFn = (value) =>
        value.match(/^[0-9]+$/i) ? O.some(parseInt(value, 10)) : O.none

    type createItemFn = (name: string, qty: string) => Option<Item>
    const createItem: createItemFn = (name, qty) =>
        pipe(O.of(itemCtor), O.ap(checkName(name)), O.ap(checkQty(qty)))

    // NOTE: different way, call the first effectful function,
    // map the pure function and then use 'ap' for each remaining parameter.
    // More idiomatic in Haskell.
    const createItemDifferent: createItemFn = (name, qty) =>
        pipe(checkName(name), O.map(itemCtor), O.ap(checkQty(qty)))

    // NOTE: another different way with only Functor and Monad
    const createItemNoAp: createItemFn = (name, qty) => {
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
