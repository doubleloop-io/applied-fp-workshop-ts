describe("foldable", () => {
  type Item = Readonly<{ qty: number }>
  const item = (qty: number): Item => ({ qty })

  const merge = (item1: Item, item2: Item): Item => item(item1.qty + item2.qty)

  test("calculate total qty", () => {
    const items = [item(100), item(10), item(42)]
    const result = items.reduce((acc, cur) => acc + cur.qty, 0)
    expect(result).toEqual(152)
  })

  test("apply a function many times", () => {
    const items = [item(100), item(10), item(42)]
    const result = items.reduce(merge, item(0))
    expect(result).toEqual(item(152))
  })
})
