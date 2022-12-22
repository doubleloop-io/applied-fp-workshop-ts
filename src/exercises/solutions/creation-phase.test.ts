import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

describe.skip("creation phase", () => {
    type Item = {
        qty: number
    }

    type OptionalItem = Invalid | Valid
    type Invalid = {
        readonly _tag: "Invalid"
    }
    type Valid = {
        readonly _tag: "Valid"
        readonly value: Item
    }

    type createItemFn = (qty: string) => OptionalItem
    const createItem: createItemFn = (qty) =>
        qty.match(/^[0-9]+$/i)
            ? { _tag: "Valid", value: { qty: parseInt(qty, 10) } }
            : { _tag: "Invalid" }

    test("item creation", () => {
        const result = createItem("10")

        expect(result).toStrictEqual({
            _tag: "Valid",
            value: { qty: 10 },
        })
    })

    test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
        const result = createItem(x)

        expect(result).toStrictEqual({
            _tag: "Invalid",
        })
    })

    type createItemFpTsFn = (qty: string) => Option<Item>
    const createItemFpTs: createItemFpTsFn = (qty) =>
        qty.match(/^[0-9]+$/i) ? O.some({ qty: parseInt(qty, 10) }) : O.none

    test("item creation", () => {
        const result = createItemFpTs("10")

        expect(result).toStrictEqual(O.some({ qty: 10 }))
    })

    test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
        const result = createItemFpTs(x)

        expect(result).toStrictEqual(O.none)
    })
})
