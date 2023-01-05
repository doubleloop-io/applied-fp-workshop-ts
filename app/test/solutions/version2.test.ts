import {
  runApp,
  invalidSize,
  invalidDirection,
  invalidCommand,
  invalidObstacle,
  invalidPosition,
} from "../../src/solutions/version2"
import * as E from "fp-ts/Either"
import { tuple } from "../../utils/tuple"

describe.skip("version 2", () => {
  test("go to opposite angle", () => {
    const planet = tuple("5x4", "2,0 0,3 3,2")
    const rover = tuple("0,0", "N")
    const commands = "RBBLBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(E.right("4:3:E"))
  })

  test("invalid planet size", () => {
    const planet = tuple("ax4", "2,0 0,3 3,2")
    const rover = tuple("0,0", "N")
    const commands = "RBBLBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(E.left(invalidSize(new Error("Input: ax4"))))
  })

  test("invalid planet obstacle", () => {
    const planet = tuple("5x4", "2,0 03 3,2")
    const rover = tuple("0,0", "N")
    const commands = "RBBLBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(
      E.left(invalidObstacle(new Error("Input: 03"))),
    )
  })

  test("invalid rover position", () => {
    const planet = tuple("5x4", "2,0 0,3 3,2")
    const rover = tuple("asd", "N")
    const commands = "RBBLBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(
      E.left(invalidPosition(new Error("Input: asd"))),
    )
  })

  test("invalid rover direction", () => {
    const planet = tuple("5x4", "2,0 0,3 3,2")
    const rover = tuple("0,0", "X")
    const commands = "RBBLBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(
      E.left(invalidDirection(new Error("Input: X"))),
    )
  })

  test("invalid command", () => {
    const planet = tuple("5x4", "2,0 0,3 3,2")
    const rover = tuple("0,0", "N")
    const commands = "RBBGBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(E.left(invalidCommand(new Error("Input: G"))))
  })
})
