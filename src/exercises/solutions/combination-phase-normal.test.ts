import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"
import { pipe } from "fp-ts/lib/function"

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
        const result = pipe(createItem("100"), O.map(checkIn(10)))

        expect(result).toStrictEqual(O.some({ qty: 110 }))
    })

    test("checkIn after invalid creation", () => {
        const result = pipe(createItem("asd"), O.map(checkIn(10)))

        expect(result).toStrictEqual(O.none)
    })
})
