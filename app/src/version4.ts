/*
    ## V4 - Focus on infrastructure (compose I/O operations)

    Extend the pure way of work also to the infrastructural layer
    - Read planet data from file into IO (size and obstacles)
    - Read rover from file into IO (position and orientation)
    - Ask and read commands from console into IO
    - Implement an entrypoint that:
      - orchestrate domain, infrastructure, parsing and error handling
      - run the whole app lifted in the IO monad
      - print final rover output to the console if everything is ok
      - recover from any unhandled error and print it
 */

import { Tuple, parseTuple } from "../utils/tuple"
import { match } from "ts-pattern"
import { pipe } from "fp-ts/function"
import * as E from "fp-ts/Either"
import { Either } from "fp-ts/Either"
import { Task } from "fp-ts/Task"
import * as TE from "fp-ts/TaskEither"
import { TaskEither } from "fp-ts/TaskEither"

export type Rover = Readonly<{ position: Position; direction: Direction }>
export type Position = Readonly<{ x: number; y: number }>
export type Direction = "North" | "East" | "West" | "South"
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

const delta =
  (x: number) =>
  (y: number): Delta => ({ x, y })

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

// ENTRY POINT

// TODO 1: runMission, writeSequenceCompleted or writeObstacleDetected and
//  then resolve any Error just by writeMissionFailed
// HINT: runMission returns TaskEither but runApp only Task
// HINT: combine phase normal and then removal phase
export const runApp = (pathPlanet: string, pathRover: string): Task<void> => {
  throw new Error("TODO")
}

const runMission = (
  pathPlanet: string,
  pathRover: string,
): TaskEither<Error, Either<ObstacleDetected, Rover>> =>
  pipe(
    TE.of(executeAll),
    TE.ap(loadPlanet(pathPlanet)),
    TE.ap(loadRover(pathRover)),
    TE.ap(loadCommands()),
  )

// INFRASTRUCTURE

// NOTE: utility function to convert ParseError in Error
const toError = (error: ParseError): Error => new Error(renderParseError(error))

// TODO 2: load file as tuple (see infra-file) and then parse to a rover
// HINT: combination phase effectful
// HINT: align error and effect types
export const loadPlanet = (path: string): TaskEither<Error, Planet> => {
  throw new Error("TODO")
}

// TODO 3: load file as tuple (see infra-file) and then parse to a planet
// HINT: combination phase effectful
// HINT: align error and effect types
export const loadRover = (path: string): TaskEither<Error, Rover> => {
  throw new Error("TODO")
}

// TODO 4: ask for commands string (see infra-console) and then parse to commands
// HINT: combination phase effectful
// HINT: align error and effect types
export const loadCommands = (): TaskEither<Error, Commands> => {
  throw new Error("TODO")
}

// TODO 5: render the rover and log it as info (see infra-console)
const writeSequenceCompleted = (rover: Rover): Task<void> => {
  throw new Error("TODO")
}

// TODO 6: render the rover and log it as info (see infra-console)
const writeObstacleDetected = (rover: Rover): Task<void> => {
  throw new Error("TODO")
}

// TODO 7: render the error and log it as error (see infra-console)
const writeMissionFailed = (error: Error): Task<void> => {
  throw new Error("TODO")
}

// PARSING

const parseCommands = (
  input: string,
): Either<ParseError, ReadonlyArray<Command>> =>
  pipe(input.split(""), E.traverseArray(parseCommand))

const parseCommand = (input: string): Either<ParseError, Command> =>
  match(input.toLocaleUpperCase())
    .with("R", () => E.right("TurnRight" as const))
    .with("L", () => E.right("TurnLeft" as const))
    .with("F", () => E.right("MoveForward" as const))
    .with("B", () => E.right("MoveBackward" as const))
    .otherwise(() => E.left(invalidCommand(new Error(`Input: ${input}`))))

const parseRover = ({
  first,
  second,
}: Tuple<string, string>): Either<ParseError, Rover> =>
  pipe(E.of(rover), E.ap(parsePosition(first)), E.ap(parseDirection(second)))

const parsePosition = (input: string): Either<ParseError, Position> =>
  pipe(
    input,
    parseTuple(","),
    E.mapLeft(invalidPosition),
    E.map(({ first, second }) => position(first)(second)),
  )

const parseDirection = (input: string): Either<ParseError, Direction> =>
  match(input.toLocaleUpperCase())
    .with("N", () => E.right("North" as const))
    .with("E", () => E.right("East" as const))
    .with("W", () => E.right("West" as const))
    .with("S", () => E.right("South" as const))
    .otherwise(() => E.left(invalidDirection(new Error(`Input: ${input}`))))

const parsePlanet = ({
  first,
  second,
}: Tuple<string, string>): Either<ParseError, Planet> =>
  pipe(E.of(planet), E.ap(parseSize(first)), E.ap(parseObstacles(second)))

const parseSize = (input: string): Either<ParseError, Size> =>
  pipe(
    input,
    parseTuple("x"),
    E.mapLeft(invalidSize),
    E.map((tuple) => size(tuple.first)(tuple.second)),
  )

const parseObstacles = (
  input: string,
): Either<ParseError, ReadonlyArray<Obstacle>> =>
  pipe(input.split(" "), E.traverseArray(parseObstacle))

const parseObstacle = (input: string): Either<ParseError, Obstacle> =>
  pipe(
    input,
    parseTuple(","),
    E.mapLeft(invalidObstacle),
    E.map((tuple) => obstacle(tuple.first)(tuple.second)),
  )

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
      (prev, cmd) =>
        pipe(
          prev,
          E.flatMap((next) => execute(planet)(next)(cmd)),
        ),
      E.of<ObstacleDetected, Rover>(rover),
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
    .with("North", () => "East" as const)
    .with("East", () => "South" as const)
    .with("South", () => "West" as const)
    .with("West", () => "North" as const)
    .exhaustive()

  return pipe(rover, updateRover({ direction }))
}

const turnLeft = (rover: Rover): Rover => {
  const direction = match(rover.direction)
    .with("North", () => "West" as const)
    .with("West", () => "South" as const)
    .with("South", () => "East" as const)
    .with("East", () => "North" as const)
    .exhaustive()

  return pipe(rover, updateRover({ direction }))
}

const moveForward = (
  planet: Planet,
  rover: Rover,
): Either<ObstacleDetected, Rover> =>
  pipe(
    rover.direction,
    toDelta,
    nextPosition(planet, rover),
    E.map((position) => updateRover({ position })(rover)),
  )

const moveBackward = (
  planet: Planet,
  rover: Rover,
): Either<ObstacleDetected, Rover> =>
  pipe(
    rover.direction,
    opposite,
    toDelta,
    nextPosition(planet, rover),
    E.map((position) => updateRover({ position })(rover)),
  )

const opposite = (direction: Direction): Direction =>
  match(direction)
    .with("North", () => "South" as const)
    .with("South", () => "North" as const)
    .with("East", () => "West" as const)
    .with("West", () => "East" as const)
    .exhaustive()

const toDelta = (direction: Direction): Delta =>
  match(direction)
    .with("North", () => delta(0)(1))
    .with("South", () => delta(0)(-1))
    .with("East", () => delta(1)(0))
    .with("West", () => delta(-1)(0))
    .exhaustive()

const nextPosition =
  (planet: Planet, rover: Rover) =>
  (delta: Delta): Either<ObstacleDetected, Position> => {
    const newX = wrap(rover.position.x, planet.size.width, delta.x)
    const newY = wrap(rover.position.y, planet.size.height, delta.y)
    const candidate = position(newX)(newY)

    const hitObstacle =
      planet.obstacles.findIndex(
        (x) => x.position.x == newX && x.position.y == newY,
      ) != -1

    return hitObstacle
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
