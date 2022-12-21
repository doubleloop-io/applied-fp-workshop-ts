import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"

describe("creation phase", () => {
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

    const createItem: (qty: string) => OptionalItem = (qty) =>
        qty.match(/^[0-9]+$/i)
            ? { _tag: "Valid", value: { qty: parseInt(qty, 10) } }
            : { _tag: "Invalid" }

    test("item creation", () => {
        expect(createItem("10")).toStrictEqual({
            _tag: "Valid",
            value: { qty: 10 },
        })
    })

    test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
        expect(createItem(x)).toStrictEqual({
            _tag: "Invalid",
        })
    })

    const createItemFpTs: (qty: string) => Option<Item> = (qty) =>
        qty.match(/^[0-9]+$/i) ? O.some({ qty: parseInt(qty, 10) }) : O.none

    test("item creation", () => {
        expect(createItemFpTs("10")).toStrictEqual(O.some({ qty: 10 }))
    })

    test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
        expect(createItemFpTs(x)).toStrictEqual(O.none)
    })
})
