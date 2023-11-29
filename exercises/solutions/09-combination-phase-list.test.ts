import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"
import * as A from "fp-ts/Array"

describe.skip("combination phase - list", () => {
  type Item = Readonly<{ qty: number }>

  const item = (qty: number): Item => ({ qty })

  const parseItem = (qty: string): Option<Item> =>
    qty.match(/^[0-9]+$/i) ? O.some(item(Number(qty))) : O.none

  test("all valid - individual results", () => {
    const values = ["1", "10", "100"]
    const result = pipe(values, A.map(parseItem))

    expect(result).toStrictEqual([
      O.some(item(1)),
      O.some(item(10)),
      O.some(item(100)),
    ])
  })

  test("some invalid - individual results", () => {
    const values = ["1", "asd", "100"]
    const result = pipe(values, A.map(parseItem))

    expect(result).toStrictEqual([O.some(item(1)), O.none, O.some(item(100))])
  })

  test("all valid - summon result", () => {
    const values = ["1", "10", "100"]
    const result = pipe(values, O.traverseArray(parseItem))

    expect(result).toStrictEqual(O.some([item(1), item(10), item(100)]))
  })

  test("some invalid - summon result", () => {
    const values = ["1", "asd", "100"]
    const result = pipe(values, O.traverseArray(parseItem))

    expect(result).toStrictEqual(O.none)
  })
})
