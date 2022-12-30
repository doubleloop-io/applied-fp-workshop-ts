import { Tuple, unsafeParse } from "../tuple"
import { ask, logError, logInfo } from "../infra-console"
import { match } from "ts-pattern"
import { flip, flow, pipe } from "fp-ts/function"
import * as E from "fp-ts/Either"
import { Either } from "fp-ts/Either"
import { Task } from "fp-ts/Task"
import * as TE from "fp-ts/TaskEither"
import { TaskEither } from "fp-ts/TaskEither"
import { loadTuple } from "../infra-file"

type Rover = { position: Position; direction: Direction }
type Planet = { size: Size; obstacles: ReadonlyArray<Obstacle> }
type Command = "TurnRight" | "TurnLeft" | "MoveForward" | "MoveBackward"
type Commands = ReadonlyArray<Command>
type Obstacle = { position: Position }
type Position = { x: number; y: number }
type Size = { width: number; height: number }
type Delta = { x: number; y: number }
type Direction = "N" | "E" | "W" | "S"
type ObstacleDetected = Rover

const planetCtor =
  (size: Size) =>
  (obstacles: ReadonlyArray<Obstacle>): Planet => ({ size, obstacles })

const roverCtor =
  (position: Position) =>
  (direction: Direction): Rover => ({ position, direction })

const positionCtor =
  (x: number) =>
  (y: number): Position => ({ x, y })

const sizeCtor =
  (width: number) =>
  (height: number): Size => ({ width, height })

const obstacleCtor =
  (x: number) =>
  (y: number): Obstacle => ({ position: { x, y } })

type ParseError =
  | InvalidSize
  | InvalidObstacle
  | InvalidPosition
  | InvalidDirection
  | InvalidCommand

type InvalidSize = { readonly _tag: "InvalidSize"; readonly error: Error }
type InvalidObstacle = {
  readonly _tag: "InvalidObstacle"
  readonly error: Error
}
type InvalidPosition = {
  readonly _tag: "InvalidPosition"
  readonly error: Error
}
type InvalidDirection = {
  readonly _tag: "InvalidDirection"
  readonly error: Error
}
type InvalidCommand = { readonly _tag: "InvalidCommand"; readonly error: Error }

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

type PlanetReader = {
  read: () => TaskEither<Error, Planet>
}
type RoverReader = {
  read: () => TaskEither<Error, Rover>
}
type CommandsReader = {
  read: () => TaskEither<Error, ReadonlyArray<Command>>
}
type DisplayWriter = {
  sequenceCompleted: (_: Rover) => Task<void>
  obstacleDetected: (_: ObstacleDetected) => Task<void>
  missionFailed: (_: Error) => Task<void>
}

// ADAPTERS

const createFilePlanetReader = (pathPlanet: string): PlanetReader => ({
  read: () => loadPlanet(pathPlanet),
})
const createFileRoverReader = (pathRover: string): RoverReader => ({
  read: () => loadRover(pathRover),
})
const createStdinCommandsReader = (): CommandsReader => ({
  read: loadCommands,
})
const createStdoutDisplayWriter = (): DisplayWriter => ({
  sequenceCompleted: writeSequenceCompleted,
  obstacleDetected: writeObstacleDetected,
  missionFailed: writeError,
})

// ENTRY POINT
const runAppWired = (pathPlanet: string, pathRover: string): Task<void> =>
  runApp(
    createFilePlanetReader(pathPlanet),
    createFileRoverReader(pathRover),
    createStdinCommandsReader(),
    createStdoutDisplayWriter(),
  )

const runApp = (
  planetReader: PlanetReader,
  roverReader: RoverReader,
  commandsReader: CommandsReader,
  displayWriter: DisplayWriter,
): Task<void> =>
  pipe(
    runMission(planetReader, roverReader, commandsReader),
    TE.map(
      E.fold(displayWriter.obstacleDetected, displayWriter.sequenceCompleted),
    ),
    TE.chain((t) => TE.fromTask(t)),
    TE.getOrElse(displayWriter.missionFailed),
  )

const runMission = (
  planetReader: PlanetReader,
  roverReader: RoverReader,
  commandsReader: CommandsReader,
): TaskEither<Error, Either<ObstacleDetected, Rover>> =>
  pipe(
    TE.of(executeAll),
    TE.ap(planetReader.read()),
    TE.ap(roverReader.read()),
    TE.ap(commandsReader.read()),
  )

// INFRASTRUCTURE

const toError = (error: ParseError): Error => new Error(renderParseError(error))

const loadPlanet = (path: string): TaskEither<Error, Planet> =>
  pipe(
    loadTuple(path),
    TE.chain(flow(parsePlanet, E.mapLeft(toError), TE.fromEither)),
  )

const loadRover = (path: string): TaskEither<Error, Rover> =>
  pipe(
    loadTuple(path),
    TE.chain(flow(parseRover, E.mapLeft(toError), TE.fromEither)),
  )

const loadCommands = (): TaskEither<Error, Commands> =>
  pipe(
    ask("Waiting commands..."),
    TE.fromTask,
    TE.chain(flow(parseCommands, E.mapLeft(toError), TE.fromEither)),
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
    .with("R", () => E.right<ParseError, Command>("TurnRight"))
    .with("L", () => E.right<ParseError, Command>("TurnLeft"))
    .with("F", () => E.right<ParseError, Command>("MoveForward"))
    .with("B", () => E.right<ParseError, Command>("MoveBackward"))
    .otherwise(() => E.left(invalidCommand(new Error(`Input: ${input}`))))

const parseRover = (input: Tuple<string, string>): Either<ParseError, Rover> =>
  pipe(
    E.of(roverCtor),
    E.ap(parsePosition(input.first)),
    E.ap(parseDirection(input.second)),
  )

const parsePosition = (input: string): Either<ParseError, Position> =>
  pipe(
    parseTuple(",", input),
    E.mapLeft(invalidPosition),
    E.map((tuple) => positionCtor(tuple.first)(tuple.second)),
  )

const parseDirection = (input: string): Either<ParseError, Direction> =>
  match(input.toLocaleUpperCase())
    .with("N", () => E.right<ParseError, Direction>("N"))
    .with("E", () => E.right<ParseError, Direction>("E"))
    .with("W", () => E.right<ParseError, Direction>("W"))
    .with("S", () => E.right<ParseError, Direction>("S"))
    .otherwise(() => E.left(invalidDirection(new Error(`Input: ${input}`))))

const parsePlanet = (
  input: Tuple<string, string>,
): Either<ParseError, Planet> =>
  pipe(
    E.of(planetCtor),
    E.ap(parseSize(input.first)),
    E.ap(parseObstacles(input.second)),
  )

const parseSize = (input: string): Either<ParseError, Size> =>
  pipe(
    parseTuple("x", input),
    E.mapLeft(invalidSize),
    E.map((tuple) => sizeCtor(tuple.first)(tuple.second)),
  )

const parseObstacles = (
  input: string,
): Either<ParseError, ReadonlyArray<Obstacle>> =>
  E.traverseArray(parseObstacle)(input.split(" "))

const parseObstacle = (input: string): Either<ParseError, Obstacle> =>
  pipe(
    parseTuple(",", input),
    E.mapLeft(invalidObstacle),
    E.map((tuple) => obstacleCtor(tuple.first)(tuple.second)),
  )

const parseTuple = (
  separator: string,
  input: string,
): Either<Error, Tuple<number, number>> =>
  E.tryCatch(() => unsafeParse(separator, input), E.toError)

// RENDERING

const renderError = (error: Error): string => error.message

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

const renderComplete = (rover: Rover): string =>
  `${rover.position.x}:${rover.position.y}:${rover.direction}`

const renderObstacle = (rover: Rover): string =>
  `O:${rover.position.x}:${rover.position.y}:${rover.direction}`

// DOMAIN

const executeAll =
  (planet: Planet) =>
  (rover: Rover) =>
  (commands: Commands): Either<ObstacleDetected, Rover> =>
    commands.reduce(
      (prev, cmd) => pipe(prev, E.chain(flip(execute(planet))(cmd))),
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
  const newDirection = match(rover.direction)
    .with("N", () => "E" as const)
    .with("E", () => "S" as const)
    .with("S", () => "W" as const)
    .with("W", () => "N" as const)
    .exhaustive()

  return updateRover({ direction: newDirection })(rover)
}

const turnLeft = (rover: Rover): Rover => {
  const newDirection = match(rover.direction)
    .with("N", () => "W" as const)
    .with("W", () => "S" as const)
    .with("S", () => "E" as const)
    .with("E", () => "N" as const)
    .exhaustive()

  return updateRover({ direction: newDirection })(rover)
}

const moveForward = (
  planet: Planet,
  rover: Rover,
): Either<ObstacleDetected, Rover> =>
  pipe(
    next(planet, rover, delta(rover.direction)),
    E.map((position) => updateRover({ position })(rover)),
  )

const moveBackward = (
  planet: Planet,
  rover: Rover,
): Either<ObstacleDetected, Rover> =>
  pipe(
    next(planet, rover, delta(opposite(rover.direction))),
    E.map((position) => updateRover({ position })(rover)),
  )

const opposite = (direction: Direction): Direction => {
  return match(direction)
    .with("N", () => "S" as const)
    .with("S", () => "N" as const)
    .with("E", () => "W" as const)
    .with("W", () => "E" as const)
    .exhaustive()
}

const delta = (direction: Direction): Delta => {
  return match(direction)
    .with("N", () => ({ x: 0, y: 1 }))
    .with("S", () => ({ x: 0, y: -1 }))
    .with("E", () => ({ x: 1, y: 0 }))
    .with("W", () => ({ x: -1, y: 0 }))
    .exhaustive()
}

const next = (
  planet: Planet,
  rover: Rover,
  delta: Delta,
): Either<ObstacleDetected, Position> => {
  const position = rover.position
  const newX = wrap(position.x, planet.size.width, delta.x)
  const newY = wrap(position.y, planet.size.height, delta.y)
  const candidate = positionCtor(newX)(newY)

  const hitObstacle = planet.obstacles.findIndex(
    (x) => x.position.x == newX && x.position.y == newY,
  )

  return hitObstacle != -1
    ? E.left(rover)
    : E.right(updatePosition(candidate)(position))
}

const wrap = (value: number, limit: number, delta: number): number =>
  (((value + delta) % limit) + limit) % limit

const updatePosition =
  (values: Partial<Position>) =>
  (actual: Position): Position => ({
    x: values.x != null ? values.x : actual.x,
    y: values.y != null ? values.y : actual.y,
  })

const updateRover =
  (values: Partial<Rover>) =>
  (actual: Rover): Rover => ({
    position: values.position != null ? values.position : actual.position,
    direction: values.direction != null ? values.direction : actual.direction,
  })
