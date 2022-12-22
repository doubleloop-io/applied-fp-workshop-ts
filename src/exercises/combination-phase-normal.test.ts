import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

// TODO - 1: remove skip marker
describe.skip("combination phase - normal", () => {
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

    test("checkIn after valid creation", () => {
        const result = pipe(
            createItem("100"),
            // TODO - 2: "call" checkIn 10
        )

        // TODO - 3: change expected
        expect(result).toStrictEqual(null)
    })

    test("checkIn after invalid creation", () => {
        const result = pipe(
            createItem("asd"),
            // TODO - 4: "call" checkIn 10
        )

        // TODO - 5: change expected
        expect(result).toStrictEqual(null)
    })
})
