// TODO - 1: remove skip marker
describe.skip("creation phase", () => {
    type Item = {
        qty: number
    }

    type itemCtorFn = (qty: number) => Item
    const itemCtor: itemCtorFn = (qty): Item => ({ qty })

    // TODO - 2: complete the sum type definition
    // type OptionalItem = Invalid | Valid

    // TODO - 3: use OptionalItem as return type and remove throw
    type createItemFn = (qty: string) => Item
    const createItem: createItemFn = (qty) => {
        if (qty.match(/^[0-9]+$/i)) return itemCtor(parseInt(qty, 10))
        else throw new Error("invalid item") // or return null | undefined
    }

    // TODO - 4: change test expectation
    test("item creation", () => {
        const result = createItem("10")

        expect(result).toStrictEqual(itemCtor(10))
    })

    // TODO - 5: change test expectation
    test.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
        const result = () => createItem(x)

        expect(result).toThrow()
    })
})
