import { parseSize, invalidPlanet } from "../../solutions/version2"
import * as E from "fp-ts/Either"

describe("version 2", () => {
  test("it works", () => {
    const result = parseSize("10,12")

    expect(result).toStrictEqual(E.left(invalidPlanet(new Error("Cannot parse ints (x): 10,12"))))
  })
})
