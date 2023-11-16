// TODO  1: for each test, remove the skip marker and make it green
describe("creation phase", () => {
  type Item = Readonly<{ qty: number }>

  const item = (qty: number): Item => ({ qty })

  // TODO  2: complete the sum type definition
  // type OptionalItem = Invalid | Valid

  // TODO  3: use OptionalItem as return type and remove throw
  const parseItem = (qty: string): Item => {
    if (qty.match(/^[0-9]+$/i)) return item(Number(qty))
    else throw new Error("invalid item") // or return null | undefined
  }

  test.skip("item creation", () => {
    const result = parseItem("10")

    // TODO  4: change test expectation
    expect(result).toStrictEqual(item(10))
  })

  test.skip.each(["asd", "1 0 0", ""])("invalid item creation", (x) => {
    const result = () => parseItem(x)

    // TODO  5: change test expectation
    expect(result).toThrow()
  })
})
