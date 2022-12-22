import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

// TODO - 1: remove skip marker
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

    // TODO - 2: create an item only if name and quantity are valid
    type createItemFn = (name: string, qty: string) => Option<Item>
    const createItem: createItemFn = (name, qty) => {
        throw new Error("TODO")
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
