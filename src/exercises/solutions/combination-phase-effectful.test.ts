import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"
import { pipe } from "fp-ts/function"

describe.skip("combination phase", () => {
    type Item = {
        qty: number
    }

    type createItemFn = (qty: string) => Option<Item>
    const createItem: createItemFn = (qty) =>
        qty.match(/^[0-9]+$/i) ? O.some({ qty: parseInt(qty, 10) }) : O.none

    type checkInFn = (value: number) => (item: Item) => Item
    const checkIn: checkInFn = (value) => (item) => ({ qty: item.qty + value })

    type checkOutFn = (value: number) => (item: Item) => Option<Item>
    const checkOut: checkOutFn = (value) => (item) =>
        value <= item.qty ? O.some({ qty: item.qty - value }) : O.none

    test("checkOut after valid creation", () => {
        const result = pipe(createItem("100"), O.chain(checkOut(10)))

        expect(result).toStrictEqual(O.some({ qty: 90 }))
    })

    test("checkOut after invalid creation", () => {
        const result = pipe(createItem("asd"), O.chain(checkOut(10)))

        expect(result).toStrictEqual(O.none)
    })

    test("checkIn and checkOut after valid creation", () => {
        const result = pipe(
            createItem("100"),
            O.map(checkIn(10)),
            O.chain(checkOut(20)),
        )

        expect(result).toStrictEqual(O.some({ qty: 90 }))
    })
})
