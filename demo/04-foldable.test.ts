describe("foldable", () => {
  type Item = { readonly qty: number }
  const itemCtor = (qty: number): Item => ({ qty })

  const merge = (item1: Item, item2: Item): Item =>
    itemCtor(item1.qty + item2.qty)

  it("calculate total qty", () => {
    const items = [itemCtor(100), itemCtor(10), itemCtor(42)]
    const result = items.reduce((acc, cur) => acc + cur.qty, 0)
    expect(result).toEqual(152)
  })

  it("apply a function many times", () => {
    const items = [itemCtor(100), itemCtor(10), itemCtor(42)]
    const result = items.reduce(merge, itemCtor(0))
    expect(result).toEqual(itemCtor(152))
  })
})
