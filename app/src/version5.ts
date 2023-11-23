import { Tuple, unsafeParse } from "../utils/tuple"
import { ask, logError, logInfo } from "../utils/infra-console"
import { match } from "ts-pattern"
import { flip, flow, pipe } from "fp-ts/function"
import * as E from "fp-ts/Either"
import { Either } from "fp-ts/Either"
import { Task } from "fp-ts/Task"
import * as TE from "fp-ts/TaskEither"
import { TaskEither } from "fp-ts/TaskEither"
import { loadTuple } from "../utils/infra-file"

export type Rover = Readonly<{ position: Position; direction: Direction }>
export type Position = Readonly<{ x: number; y: number }>
export type Direction = "N" | "E" | "W" | "S"
export type Planet = Readonly<{
  size: Size
  obstacles: ReadonlyArray<Obstacle>
}>
export type Size = Readonly<{ width: number; height: number }>
export type Obstacle = Readonly<{ position: Position }>
export type Command = "TurnRight" | "TurnLeft" | "MoveForward" | "MoveBackward"
export type Commands = ReadonlyArray<Command>
export type ObstacleDetected = Rover
type Delta = Readonly<{ x: number; y: number }>

const planet =
  (size: Size) =>
  (obstacles: ReadonlyArray<Obstacle>): Planet => ({ size, obstacles })

const rover =
  (position: Position) =>
  (direction: Direction): Rover => ({ position, direction })

const position =
  (x: number) =>
  (y: number): Position => ({ x, y })

const size =
  (width: number) =>
  (height: number): Size => ({ width, height })

const obstacle =
  (x: number) =>
  (y: number): Obstacle => ({ position: { x, y } })

type ParseError =
  | InvalidSize
  | InvalidObstacle
  | InvalidPosition
  | InvalidDirection
  | InvalidCommand

type InvalidSize = Readonly<{ _tag: "InvalidSize"; error: Error }>
type InvalidObstacle = Readonly<{ _tag: "InvalidObstacle"; error: Error }>
type InvalidPosition = Readonly<{ _tag: "InvalidPosition"; error: Error }>
type InvalidDirection = Readonly<{ _tag: "InvalidDirection"; error: Error }>
type InvalidCommand = Readonly<{ _tag: "InvalidCommand"; error: Error }>

const invalidSize = (e: Error): ParseError => ({
  _tag: "InvalidSize",
  error: e,
})
const invalidObstacle = (e: Error): ParseError => ({
  _tag: "InvalidObstacle",
  error: e,
})
const invalidPosition = (e: Error): ParseError => ({
  _tag: "InvalidPosition",
  error: e,
})
const invalidDirection = (e: Error): ParseError => ({
  _tag: "InvalidDirection",
  error: e,
})
const invalidCommand = (e: Error): ParseError => ({
  _tag: "InvalidCommand",
  error: e,
})

// PORTS

// TODO 1: get familiar with the following types
export type MissionSource = {
  readPlanet: () => TaskEither<Error, Planet>
  readRover: () => TaskEither<Error, Rover>
}
export type CommandsChannel = {
  read: () => TaskEither<Error, ReadonlyArray<Command>>
}
export type MissionReport = {
  sequenceCompleted: (_: Rover) => Task<void>
  obstacleDetected: (_: ObstacleDetected) => Task<void>
  missionFailed: (_: Error) => Task<void>
}

// ADAPTERS

const createFileMissionSource = (
  pathPlanet: string,
  pathRover: string,
): MissionSource => ({
  // TODO 2: implement with loadPlanet
  readPlanet: () => {
    throw new Error("TODO")
  },
  // TODO 3: implement with loadRover
  readRover: () => {
    throw new Error("TODO")
  },
})
const createStdinCommandsChannel = (): CommandsChannel => ({
  // TODO 4: implement with loadCommands
  read: () => {
    throw new Error("TODO")
  },
})
const createStdoutMissionReport = (): MissionReport => ({
  // TODO 5: implement with writeSequenceCompleted
  sequenceCompleted: (rover: Rover) => {
    throw new Error("TODO")
  },
  // TODO 6: implement with writeObstacleDetected
  obstacleDetected: (rover: ObstacleDetected) => {
    throw new Error("TODO")
  },
  // TODO 7: implement with writeError
  missionFailed: (error: Error) => {
    throw new Error("TODO")
  },
})

// ENTRY POINT
export const runAppWired = (
  pathPlanet: string,
  pathRover: string,
): Task<void> =>
  runApp(
    createFileMissionSource(pathPlanet, pathRover),
    createStdinCommandsChannel(),
    createStdoutMissionReport(),
  )

// TODO 8: get familiar with injected function
// HINT: dependencies are normal parameters
export const runApp = (
  missionSource: MissionSource,
  commandsChannel: CommandsChannel,
  missionReport: MissionReport,
): Task<void> =>
  // TODO 9: compare with version4 implementation
  pipe(
    runMission(missionSource, commandsChannel),
    TE.map(
      E.fold(missionReport.obstacleDetected, missionReport.sequenceCompleted),
    ),
    TE.flatMap((t) => TE.fromTask(t)),
    TE.getOrElse(missionReport.missionFailed),
  )

// TODO 10: compare with version4 implementation
const runMission = (
  missionSource: MissionSource,
  commandsChannel: CommandsChannel,
): TaskEither<Error, Either<ObstacleDetected, Rover>> =>
  pipe(
    TE.of(executeAll),
    TE.ap(missionSource.readPlanet()),
    TE.ap(missionSource.readRover()),
    TE.ap(commandsChannel.read()),
  )

// INFRASTRUCTURE

const toError = (error: ParseError): Error => new Error(renderParseError(error))

const loadPlanet = (path: string): TaskEither<Error, Planet> =>
  pipe(
    loadTuple(path),
    TE.flatMap(flow(parsePlanet, E.mapLeft(toError), TE.fromEither)),
  )

const loadRover = (path: string): TaskEither<Error, Rover> =>
  pipe(
    loadTuple(path),
    TE.flatMap(flow(parseRover, E.mapLeft(toError), TE.fromEither)),
  )

const loadCommands = (): TaskEither<Error, Commands> =>
  pipe(
    ask("Waiting commands..."),
    TE.fromTask,
    TE.flatMap(flow(parseCommands, E.mapLeft(toError), TE.fromEither)),
  )

const writeSequenceCompleted = (rover: Rover): Task<void> =>
  pipe(renderComplete(rover), logInfo)

const writeObstacleDetected = (rover: Rover): Task<void> =>
  pipe(renderObstacle(rover), logInfo)

const writeError = (error: Error): Task<void> =>
  pipe(renderError(error), logError)

// PARSING

const parseCommands = (
  input: string,
): Either<ParseError, ReadonlyArray<Command>> =>
  E.traverseArray(parseCommand)(input.split(""))

const parseCommand = (input: string): Either<ParseError, Command> =>
  match(input.toLocaleUpperCase())
    .with("R", () => E.right("TurnRight" as const))
    .with("L", () => E.right("TurnLeft" as const))
    .with("F", () => E.right("MoveForward" as const))
    .with("B", () => E.right("MoveBackward" as const))
    .otherwise(() => E.left(invalidCommand(new Error(`Input: ${input}`))))

const parseRover = (input: Tuple<string, string>): Either<ParseError, Rover> =>
  pipe(
    E.of(rover),
    E.ap(parsePosition(input.first)),
    E.ap(parseDirection(input.second)),
  )

const parsePosition = (input: string): Either<ParseError, Position> =>
  pipe(
    parseTuple(",", input),
    E.mapLeft(invalidPosition),
    E.map((tuple) => position(tuple.first)(tuple.second)),
  )

const parseDirection = (input: string): Either<ParseError, Direction> =>
  match(input.toLocaleUpperCase())
    .with("N", () => E.right("N" as const))
    .with("E", () => E.right("E" as const))
    .with("W", () => E.right("W" as const))
    .with("S", () => E.right("S" as const))
    .otherwise(() => E.left(invalidDirection(new Error(`Input: ${input}`))))

const parsePlanet = (
  input: Tuple<string, string>,
): Either<ParseError, Planet> =>
  pipe(
    E.of(planet),
    E.ap(parseSize(input.first)),
    E.ap(parseObstacles(input.second)),
  )

const parseSize = (input: string): Either<ParseError, Size> =>
  pipe(
    parseTuple("x", input),
    E.mapLeft(invalidSize),
    E.map((tuple) => size(tuple.first)(tuple.second)),
  )

const parseObstacles = (
  input: string,
): Either<ParseError, ReadonlyArray<Obstacle>> =>
  E.traverseArray(parseObstacle)(input.split(" "))

const parseObstacle = (input: string): Either<ParseError, Obstacle> =>
  pipe(
    parseTuple(",", input),
    E.mapLeft(invalidObstacle),
    E.map((tuple) => obstacle(tuple.first)(tuple.second)),
  )

const parseTuple = (
  separator: string,
  input: string,
): Either<Error, Tuple<number, number>> =>
  E.tryCatch(() => unsafeParse(separator, input), E.toError)

// RENDERING

export const renderError = (error: Error): string => error.message

const renderParseError = (error: ParseError): string =>
  match(error)
    .with(
      { _tag: "InvalidCommand" },
      (e) => `Invalid command. ${e.error.message}`,
    )
    .with(
      { _tag: "InvalidDirection" },
      (e) => `Invalid direction. ${e.error.message}`,
    )
    .with(
      { _tag: "InvalidObstacle" },
      (e) => `Invalid obstacle. ${e.error.message}`,
    )
    .with(
      { _tag: "InvalidPosition" },
      (e) => `Invalid position. ${e.error.message}`,
    )
    .with({ _tag: "InvalidSize" }, (e) => `Invalid size. ${e.error.message}`)
    .exhaustive()

export const renderComplete = (rover: Rover): string =>
  `${rover.position.x}:${rover.position.y}:${rover.direction}`

export const renderObstacle = (rover: Rover): string =>
  `O:${rover.position.x}:${rover.position.y}:${rover.direction}`

// DOMAIN

const executeAll =
  (planet: Planet) =>
  (rover: Rover) =>
  (commands: Commands): Either<ObstacleDetected, Rover> =>
    commands.reduce(
      (prev, cmd) => pipe(prev, E.flatMap(flip(execute(planet))(cmd))),
      E.of<Rover, Rover>(rover),
    )

const execute =
  (planet: Planet) =>
  (rover: Rover) =>
  (command: Command): Either<ObstacleDetected, Rover> =>
    match(command)
      .with("TurnRight", () => E.of(turnRight(rover)))
      .with("TurnLeft", () => E.of(turnLeft(rover)))
      .with("MoveForward", () => moveForward(planet, rover))
      .with("MoveBackward", () => moveBackward(planet, rover))
      .exhaustive()

const turnRight = (rover: Rover): Rover => {
  const direction = match(rover.direction)
    .with("N", () => "E" as const)
    .with("E", () => "S" as const)
    .with("S", () => "W" as const)
    .with("W", () => "N" as const)
    .exhaustive()

  return pipe(rover, updateRover({ direction }))
}

const turnLeft = (rover: Rover): Rover => {
  const direction = match(rover.direction)
    .with("N", () => "W" as const)
    .with("W", () => "S" as const)
    .with("S", () => "E" as const)
    .with("E", () => "N" as const)
    .exhaustive()

  return pipe(rover, updateRover({ direction }))
}

const moveForward = (
  planet: Planet,
  rover: Rover,
): Either<ObstacleDetected, Rover> =>
  pipe(
    pipe(rover.direction, delta, nextPosition(planet, rover)),
    E.map((position) => updateRover({ position })(rover)),
  )

const moveBackward = (
  planet: Planet,
  rover: Rover,
): Either<ObstacleDetected, Rover> =>
  pipe(
    pipe(rover.direction, opposite, delta, nextPosition(planet, rover)),
    E.map((position) => updateRover({ position })(rover)),
  )

const opposite = (direction: Direction): Direction =>
  match(direction)
    .with("N", () => "S" as const)
    .with("S", () => "N" as const)
    .with("E", () => "W" as const)
    .with("W", () => "E" as const)
    .exhaustive()

const delta = (direction: Direction): Delta =>
  match(direction)
    .with("N", () => ({ x: 0, y: 1 }))
    .with("S", () => ({ x: 0, y: -1 }))
    .with("E", () => ({ x: 1, y: 0 }))
    .with("W", () => ({ x: -1, y: 0 }))
    .exhaustive()

const nextPosition =
  (planet: Planet, rover: Rover) =>
  (delta: Delta): Either<ObstacleDetected, Position> => {
    const newX = wrap(rover.position.x, planet.size.width, delta.x)
    const newY = wrap(rover.position.y, planet.size.height, delta.y)
    const candidate = position(newX)(newY)

    const hitObstacle = planet.obstacles.findIndex(
      (x) => x.position.x == newX && x.position.y == newY,
    )

    return hitObstacle != -1
      ? E.left(rover)
      : E.right(updatePosition(candidate)(rover.position))
  }

const wrap = (value: number, limit: number, delta: number): number =>
  (((value + delta) % limit) + limit) % limit

const updatePosition =
  (values: Partial<Position>) =>
  (actual: Position): Position => ({
    ...actual,
    ...values,
  })

const updateRover =
  (values: Partial<Rover>) =>
  (actual: Rover): Rover => ({
    ...actual,
    ...values,
  })
