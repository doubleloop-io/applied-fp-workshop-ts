import { loadCommands, loadPlanet, loadRover } from "../../solutions/version4"
import * as E from "fp-ts/Either"

jest.mock("readline")

describe("version 4", () => {
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
    const consoleLogSpy = jest.spyOn(global.console, "log").mockImplementation()
    const load = loadCommands()
    const result = await load()
    expect(result).toEqual(E.right(["TurnRight", "TurnRight", "MoveForward"]))
    consoleLogSpy.mockRestore()
  })
})
