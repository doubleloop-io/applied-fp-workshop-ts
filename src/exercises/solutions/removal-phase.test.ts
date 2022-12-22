import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"
import { pipe } from "fp-ts/function"

describe.skip("removal phase", () => {
    type Item = {
        qty: number
    }

    type createItemFn = (qty: string) => Option<Item>
    const createItem: createItemFn = (qty) =>
        qty.match(/^[0-9]+$/i) ? O.some({ qty: parseInt(qty, 10) }) : O.none

    test("item creation", () => {
        const result = pipe(
            createItem("100"),
            O.fold(
                () => "alternative value",
                (x) => x.qty.toString(),
            ),
        )

        expect(result).toStrictEqual("100")
    })

    test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
        const result = pipe(
            createItem("asd"),
            O.fold(
                () => "alternative value",
                (x) => x.qty.toString(),
            ),
        )

        expect(result).toStrictEqual("alternative value")
    })
})
