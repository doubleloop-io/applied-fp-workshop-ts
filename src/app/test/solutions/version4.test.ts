import {
  loadCommands,
  loadPlanet,
  loadRover,
  runApp,
} from "../../solutions/version4"
import * as E from "fp-ts/Either"
import { constVoid } from "fp-ts/function"
import { green, red } from "../../infra-console"

let stdinCommands = ""

jest.mock("readline", () => ({
  createInterface: jest.fn().mockReturnValue({
    question: jest
      .fn()
      .mockImplementation((_questionTest, cb) => cb(stdinCommands)),
    close: jest.fn().mockImplementation(() => undefined),
  }),
}))

describe("version 4", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleLogSpy: any
  const lastStdout = () => consoleLogSpy.mock.calls[1][0]

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(global.console, "log").mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  test("load planet (integration test)", async () => {
    const load = loadPlanet("data/planet.txt")

    const result = await load()

    expect(result).toStrictEqual(
      E.right({
        size: { width: 5, height: 4 },
        obstacles: [{ position: { x: 2, y: 0 } }, { position: { x: 0, y: 3 } }],
      }),
    )
  })

  test("load rover (integration test)", async () => {
    const load = loadRover("data/rover.txt")

    const result = await load()

    expect(result).toStrictEqual(
      E.right({
        position: { x: 0, y: 0 },
        direction: "N",
      }),
    )
  })

  test("load commands (integration test)", async () => {
    stdinCommands = "RBB"
    const load = loadCommands()

    const result = await load()

    expect(result).toEqual(
      E.right(["TurnRight", "MoveBackward", "MoveBackward"]),
    )
  })

  test("go to opposite angle (integration test)", async () => {
    stdinCommands = "RBBLBRF"
    const run = runApp("data/planet.txt", "data/rover.txt")

    const result = await run()

    expect(result).toStrictEqual(constVoid())
    expect(lastStdout()).toStrictEqual(green("[OK] 4:3:E"))
  })

  test("hit an obstacle (integration test)", async () => {
    stdinCommands = "RFF"
    const run = runApp("data/planet.txt", "data/rover.txt")

    const result = await run()

    expect(result).toStrictEqual(constVoid())
    expect(lastStdout()).toStrictEqual(green("[OK] O:1:0:E"))
  })

  test("planet file contains invalid size", async () => {
    const run = runApp("data/planet_invalid_size.txt", "data/rover.txt")

    const result = await run()

    expect(result).toStrictEqual(constVoid())
    expect(lastStdout()).toStrictEqual(red("[ERROR] Invalid size. Input: ax4"))
  })

  test("invalid planet file content", async () => {
    const run = runApp("data/planet_invalid_content.txt", "data/rover.txt")

    const result = await run()

    expect(result).toStrictEqual(constVoid())
    expect(lastStdout()).toStrictEqual(
      red(
        "[ERROR] Invalid file content: data/planet_invalid_content.txt",
      ),
    )
  })
})
