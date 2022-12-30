import { invalidSize, runApp } from "../../solutions/version3"
import * as E from "fp-ts/Either"
import { tuple } from "../../tuple"

describe("version 3", () => {
  test("go to opposite angle", () => {
    const planet = tuple("5x4", "2,0 0,3 3,2")
    const rover = tuple("0,0", "N")
    const commands = "RBBLBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(E.right("4:3:E"))
  })

  test("hit obstacle during commands execution", () => {
    const planet = tuple("5x4", "2,0 0,3 3,2")
    const rover = tuple("0,0", "N")
    const commands = "RFF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(E.right("O:1:0:E"))
  })

  test("invalid planet size", () => {
    const planet = tuple("ax4", "2,0 0,3 3,2")
    const rover = tuple("0,0", "N")
    const commands = "RBBLBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(E.left(invalidSize(new Error("Input: ax4"))))
  })
})
