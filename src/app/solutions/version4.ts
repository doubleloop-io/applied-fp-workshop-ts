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
  | InvalidPlanetFile
  | InvalidRoverFile

type InvalidSize = { readonly _tag: "InvalidSize"; readonly error: Error }
type InvalidObstacle = { readonly _tag: "InvalidObstacle"; readonly error: Error }
type InvalidPosition = { readonly _tag: "InvalidPosition"; readonly error: Error }
type InvalidDirection = { readonly _tag: "InvalidDirection"; readonly error: Error }
type InvalidCommand = { readonly _tag: "InvalidCommand"; readonly error: Error }
type InvalidPlanetFile = { readonly _tag: "InvalidPlanetFile"; readonly error: Error }
type InvalidRoverFile = { readonly _tag: "InvalidRoverFile"; readonly error: Error }

export const invalidSize = (e: Error): ParseError => ({ _tag: "InvalidSize", error: e })
const invalidObstacle = (e: Error): ParseError => ({
  _tag: "InvalidObstacle",
  error: e,
})
const invalidPosition = (e: Error): ParseError => ({ _tag: "InvalidPosition", error: e })
const invalidDirection = (e: Error): ParseError => ({
  _tag: "InvalidDirection",
  error: e,
})
const invalidCommand = (e: Error): ParseError => ({ _tag: "InvalidCommand", error: e })
const invalidPlanetFile = (e: Error): ParseError => ({ _tag: "InvalidPlanetFile", error: e })
const invalidRoverFile = (e: Error): ParseError => ({ _tag: "InvalidRoverFile", error: e })

export const runMission = (pathPlanet: string, pathRover: string): Task<void> =>
  pipe(
    pipe(
      TE.of(executeAll),
      TE.ap(loadPlanet(pathPlanet)),
      TE.ap(loadRover(pathRover)),
      TE.ap(loadCommands()),
    ),
    TE.map(E.fold(writeObstacleDetected, writeSequenceCompleted)),
    TE.chain((t) => TE.fromTask(t)),
    TE.getOrElse(writeError),
  )

// INFRASTRUCTURE
export const loadPlanet = (path: string): TaskEither<ParseError, Planet> =>
  pipe(loadTuple(path), TE.mapLeft(invalidPlanetFile), TE.chain(flow(parsePlanet, TE.fromEither)))

export const loadRover = (path: string): TaskEither<ParseError, Rover> =>
  pipe(loadTuple(path), TE.mapLeft(invalidRoverFile), TE.chain(flow(parseRover, TE.fromEither)))

export const loadCommands = (): TaskEither<ParseError, ReadonlyArray<Command>> =>
  pipe(ask("Waiting commands..."), TE.fromTask, TE.chain(flow(parseCommands, TE.fromEither)))

const writeSequenceCompleted = (rover: Rover): Task<void> => pipe(renderComplete(rover), logInfo)

const writeObstacleDetected = (rover: Rover): Task<void> => pipe(renderObstacle(rover), logInfo)

const writeError = (error: ParseError): Task<void> => pipe(renderError(error), logError)

// PARSING

export const parseCommands = (input: string): Either<ParseError, ReadonlyArray<Command>> =>
  E.traverseArray(parseCommand)(input.split(""))

const parseCommand = (input: string): Either<ParseError, Command> =>
  match(input.toLocaleUpperCase())
    .with("R", () => E.right<ParseError, Command>("TurnRight"))
    .with("L", () => E.right<ParseError, Command>("TurnLeft"))
    .with("F", () => E.right<ParseError, Command>("MoveForward"))
    .with("B", () => E.right<ParseError, Command>("MoveBackward"))
    .otherwise(() => E.left(invalidCommand(new Error(`Input: ${input}`))))

const parseRover = (input: Tuple<string, string>): Either<ParseError, Rover> =>
  pipe(E.of(roverCtor), E.ap(parsePosition(input.first)), E.ap(parseDirection(input.second)))

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

const parsePlanet = (input: Tuple<string, string>): Either<ParseError, Planet> =>
  pipe(E.of(planetCtor), E.ap(parseSize(input.first)), E.ap(parseObstacles(input.second)))

const parseSize = (input: string): Either<ParseError, Size> =>
  pipe(
    parseTuple("x", input),
    E.mapLeft(invalidSize),
    E.map((tuple) => sizeCtor(tuple.first)(tuple.second)),
  )

const parseObstacles = (input: string): Either<ParseError, ReadonlyArray<Obstacle>> =>
  E.traverseArray(parseObstacle)(input.split(" "))

const parseObstacle = (input: string): Either<ParseError, Obstacle> =>
  pipe(
    parseTuple(",", input),
    E.mapLeft(invalidObstacle),
    E.map((tuple) => obstacleCtor(tuple.first)(tuple.second)),
  )

const parseTuple = (separator: string, input: string): Either<Error, Tuple<number, number>> =>
  E.tryCatch(() => unsafeParse(separator, input), E.toError)

// RENDERING

const renderError = (error: ParseError): string =>
  match(error)
    .with({ _tag: "InvalidCommand" }, (e) => `Invalid command: ${e.error.message}`)
    .with({ _tag: "InvalidDirection" }, (e) => `Invalid direction: ${e.error.message}`)
    .with({ _tag: "InvalidObstacle" }, (e) => `Invalid obstacle: ${e.error.message}`)
    .with({ _tag: "InvalidPosition" }, (e) => `Invalid position: ${e.error.message}`)
    .with({ _tag: "InvalidSize" }, (e) => `Invalid size: ${e.error.message}`)
    .with({ _tag: "InvalidPlanetFile" }, (e) => `Invalid planet file: ${e.error.message}`)
    .with({ _tag: "InvalidRoverFile" }, (e) => `Invalid rover file: ${e.error.message}`)
    .exhaustive()

const renderComplete = (rover: Rover): string =>
  `${rover.position.x}:${rover.position.y}:${rover.direction}`

const renderObstacle = (rover: Rover): string =>
  `O:${rover.position.x}:${rover.position.y}:${rover.direction}`

// DOMAIN

const executeAll =
  (planet: Planet) =>
  (rover: Rover) =>
  (commands: ReadonlyArray<Command>): Either<ObstacleDetected, Rover> =>
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

const moveForward = (planet: Planet, rover: Rover): Either<ObstacleDetected, Rover> =>
  pipe(
    next(planet, rover, delta(rover.direction)),
    E.map((position) => updateRover({ position })(rover)),
  )

const moveBackward = (planet: Planet, rover: Rover): Either<ObstacleDetected, Rover> =>
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

const next = (planet: Planet, rover: Rover, delta: Delta): Either<ObstacleDetected, Position> => {
  const position = rover.position
  const newX = wrap(position.x, planet.size.width, delta.x)
  const newY = wrap(position.y, planet.size.height, delta.y)
  const candidate = positionCtor(newX)(newY)

  const hitObstacle = planet.obstacles.findIndex(
    (x) => x.position.x == newX && x.position.y == newY,
  )

  return hitObstacle != -1 ? E.left(rover) : E.right(updatePosition(candidate)(position))
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
