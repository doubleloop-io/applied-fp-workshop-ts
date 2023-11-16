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
} from "../src/version2"
import * as E from "fp-ts/Either"
import { tuple } from "../utils/tuple"

// TODO 1: gradually eliminate the "skip marker" and check that tests are green
describe.skip("version 2", () => {
  describe.skip("parsing", () => {
    test.skip("valid size", () => {
      const input = "5x4"

      const result = parseSize(input)

      expect(result).toStrictEqual(E.right({ width: 5, height: 4 }))
    })

    test.skip.each(["ax4", "5xa", "5", "x"])("invalid size", (input) => {
      const result = parseSize(input)

      expect(result).toStrictEqual(
        E.left(invalidSize(new Error(`Input: ${input}`))),
      )
    })

    test.skip("valid obstacle", () => {
      const input = "2,0"

      const result = parseObstacle(input)

      expect(result).toStrictEqual(E.right({ position: { x: 2, y: 0 } }))
    })

    test.skip.each(["a,0", "2,a", "2", ","])("invalid obstacle", (input) => {
      const result = parseObstacle(input)

      expect(result).toStrictEqual(
        E.left(invalidObstacle(new Error(`Input: ${input}`))),
      )
    })

    test.skip("valid obstacles", () => {
      const input = "2,0 0,3"

      const result = parseObstacles(input)

      expect(result).toStrictEqual(
        E.right([{ position: { x: 2, y: 0 } }, { position: { x: 0, y: 3 } }]),
      )
    })

    test.skip("invalid obstacles", () => {
      const input = "2,0 03"

      const result = parseObstacles(input)

      expect(result).toStrictEqual(
        E.left(invalidObstacle(new Error("Input: 03"))),
      )
    })

    test.skip("valid planet", () => {
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

    test.skip("valid position", () => {
      const input = "2,0"

      const result = parsePosition(input)

      expect(result).toStrictEqual(E.right({ x: 2, y: 0 }))
    })

    test.skip.each(["a,0", "2,a", "2", ","])("invalid position", (input) => {
      const result = parsePosition(input)

      expect(result).toStrictEqual(
        E.left(invalidPosition(new Error(`Input: ${input}`))),
      )
    })

    test.skip("valid direction", () => {
      const input = "N"

      const result = parseDirection(input)

      expect(result).toStrictEqual(E.right("N"))
    })

    test.skip.each(["H", "NS"])("invalid direction", (input) => {
      const result = parseDirection(input)

      expect(result).toStrictEqual(
        E.left(invalidDirection(new Error(`Input: ${input}`))),
      )
    })

    test.skip("valid command", () => {
      const input = "L"

      const result = parseCommand(input)

      expect(result).toStrictEqual(E.right("TurnLeft"))
    })

    test.skip.each(["H", "NS"])("invalid command", (input) => {
      const result = parseCommand(input)

      expect(result).toStrictEqual(
        E.left(invalidCommand(new Error(`Input: ${input}`))),
      )
    })

    test.skip("valid commands", () => {
      const input = "LRFB"

      const result = parseCommands(input)

      expect(result).toStrictEqual(
        E.right(["TurnLeft", "TurnRight", "MoveForward", "MoveBackward"]),
      )
    })
  })

  test.skip("go to opposite angle", () => {
    const planet = tuple("5x4", "2,0 0,3 3,2")
    const rover = tuple("0,0", "N")
    const commands = "RBBLBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(E.right("4:3:E"))
  })

  test.skip("invalid planet size", () => {
    const planet = tuple("ax4", "2,0 0,3 3,2")
    const rover = tuple("0,0", "N")
    const commands = "RBBLBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(E.left(invalidSize(new Error("Input: ax4"))))
  })

  test.skip("invalid planet obstacle", () => {
    const planet = tuple("5x4", "2,0 03 3,2")
    const rover = tuple("0,0", "N")
    const commands = "RBBLBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(
      E.left(invalidObstacle(new Error("Input: 03"))),
    )
  })

  test.skip("invalid rover position", () => {
    const planet = tuple("5x4", "2,0 0,3 3,2")
    const rover = tuple("asd", "N")
    const commands = "RBBLBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(
      E.left(invalidPosition(new Error("Input: asd"))),
    )
  })

  test.skip("invalid rover direction", () => {
    const planet = tuple("5x4", "2,0 0,3 3,2")
    const rover = tuple("0,0", "X")
    const commands = "RBBLBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(
      E.left(invalidDirection(new Error("Input: X"))),
    )
  })

  test.skip("invalid command", () => {
    const planet = tuple("5x4", "2,0 0,3 3,2")
    const rover = tuple("0,0", "N")
    const commands = "RBBGBRF"

    const result = runApp(planet, rover, commands)

    expect(result).toStrictEqual(E.left(invalidCommand(new Error("Input: G"))))
  })
})
