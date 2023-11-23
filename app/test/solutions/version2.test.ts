import {
  invalidCommand,
  invalidDirection,
  invalidObstacle,
  invalidPosition,
  invalidSize,
  parseCommand,
  parseCommands,
  parseDirection,
  parseObstacle,
  parseObstacles,
  parsePlanet,
  parsePosition,
  parseSize,
  runApp,
} from "../../src/solutions/version2"
import * as E from "fp-ts/Either"
import { tuple } from "../../utils/tuple"

describe.skip("version 2", () => {
  describe("parsing", () => {
    test("valid size", () => {
      const input = "5x4"

      const result = parseSize(input)

      expect(result).toStrictEqual(E.right({ width: 5, height: 4 }))
    })

    test.each(["ax4", "5xa", "5", "x"])("invalid size", (input) => {
      const result = parseSize(input)

      expect(result).toStrictEqual(
        E.left(invalidSize(new Error(`Input: ${input}`))),
      )
    })

    test("valid obstacle", () => {
      const input = "2,0"

      const result = parseObstacle(input)

      expect(result).toStrictEqual(E.right({ position: { x: 2, y: 0 } }))
    })

    test.each(["a,0", "2,a", "2", ","])("invalid obstacle", (input) => {
      const result = parseObstacle(input)

      expect(result).toStrictEqual(
        E.left(invalidObstacle(new Error(`Input: ${input}`))),
      )
    })

    test("valid obstacles", () => {
      const input = "2,0 0,3"

      const result = parseObstacles(input)

      expect(result).toStrictEqual(
        E.right([{ position: { x: 2, y: 0 } }, { position: { x: 0, y: 3 } }]),
      )
    })

    test("invalid obstacles", () => {
      const input = "2,0 03"

      const result = parseObstacles(input)

      expect(result).toStrictEqual(
        E.left(invalidObstacle(new Error("Input: 03"))),
      )
    })

    test("valid planet", () => {
      const input = tuple("5x4", "2,0 0,3")

      const result = parsePlanet(input)

      expect(result).toStrictEqual(
        E.right({
          size: { width: 5, height: 4 },
          obstacles: [
            { position: { x: 2, y: 0 } },
            { position: { x: 0, y: 3 } },
          ],
        }),
      )
    })

    test("valid position", () => {
      const input = "2,0"

      const result = parsePosition(input)

      expect(result).toStrictEqual(E.right({ x: 2, y: 0 }))
    })

    test.each(["a,0", "2,a", "2", ","])("invalid position", (input) => {
      const result = parsePosition(input)

      expect(result).toStrictEqual(
        E.left(invalidPosition(new Error(`Input: ${input}`))),
      )
    })

    test("valid direction", () => {
      const input = "N"

      const result = parseDirection(input)

      expect(result).toStrictEqual(E.right("N"))
    })

    test.each(["H", "NS"])("invalid direction", (input) => {
      const result = parseDirection(input)

      expect(result).toStrictEqual(
        E.left(invalidDirection(new Error(`Input: ${input}`))),
      )
    })

    test("valid command", () => {
      const input = "L"

      const result = parseCommand(input)

      expect(result).toStrictEqual(E.right("TurnLeft"))
    })

    test.each(["H", "NS"])("invalid command", (input) => {
      const result = parseCommand(input)

      expect(result).toStrictEqual(
        E.left(invalidCommand(new Error(`Input: ${input}`))),
      )
    })

    test("valid commands", () => {
      const input = "LRFB"

      const result = parseCommands(input)

      expect(result).toStrictEqual(
        E.right(["TurnLeft", "TurnRight", "MoveForward", "MoveBackward"]),
      )
    })
  })

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
