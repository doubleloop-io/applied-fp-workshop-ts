import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"
import { pipe } from "fp-ts/lib/function"

// TODO - 1: remove skip marker
describe.skip("combination phase", () => {
    type Item = {
        qty: number
    }

    type createItemFn = (qty: string) => Option<Item>
    const createItem: createItemFn = (qty) =>
        qty.match(/^[0-9]+$/i) ? O.some({ qty: parseInt(qty, 10) }) : O.none

    type checkInFn = (value: number) => (item: Item) => Item
    const checkIn: checkInFn = (value) => (item) => ({ qty: item.qty + value })

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
