import {
  Commands,
  CommandsReader,
  DisplayWriter,
  ObstacleDetected,
  Planet,
  PlanetReader,
  renderComplete,
  renderError,
  renderObstacle,
  Rover,
  RoverReader,
  runApp,
  runAppWired,
} from "../version5"
import * as TE from "fp-ts/TaskEither"
import * as T from "fp-ts/Task"
import { constVoid, pipe } from "fp-ts/function"
import { green } from "../utils/infra-console"
import * as IR from "fp-ts/IORef"
import { IORef } from "fp-ts/IORef"

let stdinCommands = ""
jest.mock("readline", () => ({
  createInterface: jest.fn().mockReturnValue({
    question: jest
      .fn()
      .mockImplementation((_questionTest, cb) => cb(stdinCommands)),
    close: jest.fn().mockImplementation(() => undefined),
  }),
}))

// TODO 1: remove the skip marker and check that all tests are green
describe.skip("version 5", () => {
  // TODO 2: get familiar with stubs implementations
  const createPlanetReader = (planet: Planet): PlanetReader => ({
    read: () => TE.of(planet),
  })
  const createRoverReader = (rover: Rover): RoverReader => ({
    read: () => TE.of(rover),
  })
  const createCommandsReader = (commands: Commands): CommandsReader => ({
    read: () => TE.of(commands),
  })
  const createDisplayWriter = (output: IORef<string>): DisplayWriter => ({
    sequenceCompleted: (rover: Rover) =>
      T.fromIO(output.write(`[OK] ${renderComplete(rover)}`)),

    obstacleDetected: (rover: ObstacleDetected) =>
      T.fromIO(output.write(`[OK] ${renderObstacle(rover)}`)),

    missionFailed: (error: Error) =>
      T.fromIO(output.write(`[ERROR] ${renderError(error)}`)),
  })

  const runTestApp = async (
    planet: Planet,
    rover: Rover,
    commands: Commands,
  ): Promise<string> => {
    const run = pipe(
      IR.newIORef(""),
      T.fromIO,
      T.chain((output) =>
        pipe(
          runApp(
            createPlanetReader(planet),
            createRoverReader(rover),
            createCommandsReader(commands),
            createDisplayWriter(output),
          ),
          T.chain(() => T.fromIO(output.read)),
        ),
      ),
    )

    return await run()
  }

  // TODO 3: get familiar with wired app for testing
  // HINT: test completely run in memory thanks to runTestApp function
  test.skip("go to opposite angle", async () => {
    const result = await runTestApp(
      {
        size: { width: 5, height: 4 },
        obstacles: [{ position: { x: 2, y: 0 } }, { position: { x: 0, y: 3 } }],
      },
      {
        position: { x: 0, y: 0 },
        direction: "N" as const,
      },
      [
        "TurnRight",
        "MoveBackward",
        "MoveBackward",
        "TurnLeft",
        "MoveBackward",
        "TurnRight",
        "MoveForward",
      ],
    )
    expect(result).toStrictEqual("[OK] 4:3:E")
  })

  test.skip("hit an obstacle", async () => {
    const result = await runTestApp(
      {
        size: { width: 5, height: 4 },
        obstacles: [{ position: { x: 2, y: 0 } }, { position: { x: 0, y: 3 } }],
      },
      {
        position: { x: 0, y: 0 },
        direction: "N" as const,
      },
      ["TurnRight", "MoveForward", "MoveForward"],
    )
    expect(result).toStrictEqual("[OK] O:1:0:E")
  })

  describe.skip("wired app (integration tests)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let consoleLogSpy: any
    const lastStdout = () => consoleLogSpy.mock.calls[1][0]

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(global.console, "log").mockImplementation()
    })

    afterEach(() => {
      consoleLogSpy.mockRestore()
    })

    // TODO 5: test with real infrastructure are still possible via runAppWired
    test.skip("hit an obstacle (integration test)", async () => {
      stdinCommands = "RFF"
      const run = runAppWired("data/planet.txt", "data/rover.txt")

      const result = await run()

      expect(result).toStrictEqual(constVoid())
      expect(lastStdout()).toStrictEqual(green("[OK] O:1:0:E"))
    })
  })
})
