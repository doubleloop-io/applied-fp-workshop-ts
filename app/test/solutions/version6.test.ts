import {
  appFailed,
  appLoading,
  appReady,
  askCommands,
  commandsReceived,
  infrastructure,
  init,
  loadMission,
  loadMissionFailed,
  loadMissionSuccessful,
  reportError,
  reportObstacleDetected,
  reportSequenceCompleted,
  update,
} from "../../src/solutions/version6"
import { tuple } from "../../utils/tuple"
import * as O from "fp-ts/Option"

describe.skip("version 6", () => {
  test("load mission data", () => {
    const result = init("planet-file", "rover-file")()

    expect(result).toStrictEqual(
      tuple(appLoading(), loadMission("planet-file", "rover-file")),
    )
  })

  test("load mission successful", () => {
    const planet = { size: { width: 5, height: 5 }, obstacles: [] }
    const rover = { position: { x: 0, y: 0 }, direction: "Nord" as const }

    const result = update(appLoading(), loadMissionSuccessful(planet, rover))

    expect(result).toStrictEqual(tuple(appReady(planet, rover), askCommands()))
  })

  test("load mission failed", () => {
    const result = update(appLoading(), loadMissionFailed(new Error("any")))

    expect(result).toStrictEqual(
      tuple(appFailed(), reportError(new Error("any"))),
    )
  })

  test("all commands executed", () => {
    const planet = { size: { width: 5, height: 5 }, obstacles: [] }
    const rover = { position: { x: 0, y: 0 }, direction: "Nord" as const }

    const result = update(
      appReady(planet, rover),
      commandsReceived(["MoveForward", "MoveForward", "MoveForward"]),
    )

    const updatedRover = { ...rover, position: { x: 0, y: 3 } }
    expect(result).toStrictEqual(
      tuple(
        appReady(planet, updatedRover),
        reportSequenceCompleted(updatedRover),
      ),
    )
  })

  test("hit obstacle", () => {
    const planet = {
      size: { width: 5, height: 5 },
      obstacles: [{ position: { x: 0, y: 2 } }],
    }
    const rover = { position: { x: 0, y: 0 }, direction: "Nord" as const }

    const result = update(
      appReady(planet, rover),
      commandsReceived(["MoveForward", "MoveForward", "MoveForward"]),
    )

    const updatedRover = { ...rover, position: { x: 0, y: 1 } }
    expect(result).toStrictEqual(
      tuple(
        appReady(planet, updatedRover),
        reportObstacleDetected(updatedRover),
      ),
    )
  })

  describe("infrastructure tests", () => {
    test("load planet (integration test)", async () => {
      const load = infrastructure(
        loadMission("data/planet.txt", "data/rover.txt"),
      )

      const result = await load()

      const planet = {
        size: { width: 5, height: 4 },
        obstacles: [{ position: { x: 2, y: 0 } }, { position: { x: 0, y: 3 } }],
      }
      const rover = { position: { x: 0, y: 0 }, direction: "Nord" as const }
      expect(result).toStrictEqual(O.some(loadMissionSuccessful(planet, rover)))
    })
  })
})
