import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

// TODO - 1: remove skip marker
describe.skip("combination phase - effectful", () => {
    type Item = {
        qty: number
    }

    type itemCtorFn = (qty: number) => Item
    const itemCtor: itemCtorFn = (qty): Item => ({ qty })

    type createItemFn = (qty: string) => Option<Item>
    const createItem: createItemFn = (qty) =>
        qty.match(/^[0-9]+$/i) ? O.some(itemCtor(parseInt(qty, 10))) : O.none

    type checkInFn = (value: number) => (item: Item) => Item
    const checkIn: checkInFn = (value) => (item) => itemCtor(item.qty + value)

    type checkOutFn = (value: number) => (item: Item) => Option<Item>
    const checkOut: checkOutFn = (value) => (item) =>
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
