import { pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"
import * as A from "fp-ts/Array"

// TODO  1: for each test, remove the skip marker and make it green
describe("combination phase - list", () => {
  type Item = Readonly<{ qty: number }>

  const item = (qty: number): Item => ({ qty })

  const parseItem = (qty: string): Option<Item> =>
    qty.match(/^[0-9]+$/i) ? O.some(item(Number(qty))) : O.none

  test.skip("all valid - individual results", () => {
    const values = ["1", "10", "100"]
    const result = pipe(
      values,
      // TODO  2: map over values and create items
    )

    expect(result).toStrictEqual([
      O.some(item(1)),
      O.some(item(10)),
      O.some(item(100)),
    ])
  })

  test.skip("some invalid - individual results", () => {
    const values = ["1", "asd", "100"]
    const result = pipe(
      values,
      // TODO  3: map over values and create items
    )

    expect(result).toStrictEqual([
      O.some(item(1)),
      O.none,
      O.some(item(100)),
    ])
  })

  test.skip("all valid - summon result", () => {
    const values = ["1", "10", "100"]
    const result = pipe(values, O.traverseArray(parseItem))

    // TODO  4: change expectation
    expect(result).toStrictEqual(null)
  })

  test.skip("some invalid - summon result", () => {
    const values = ["1", "asd", "100"]
    const result = pipe(values, O.traverseArray(parseItem))

    // TODO  5: change expectation
    expect(result).toStrictEqual(null)
  })
})
