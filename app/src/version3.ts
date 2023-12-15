/*
    ## V3 - More domain logic (handle obstacles w/ effects)

    Extend the API to handle the obstacle detection logic:
    - Implement obstacle detection before move to a new position.
    - If the rover encounters an obstacle, rest in the same position and aborts the sequence.
    - Render the final result as string:
      - sequence completed: "positionX:positionY:orientation"
      - obstacle detected: "O:positionX:positionY:orientation"
 */

import { match } from "ts-pattern"
import { pipe } from "fp-ts/function"
import * as E from "fp-ts/Either"
import { Either } from "fp-ts/Either"
import { Tuple, parseTuple } from "../utils/tuple"

export type Rover = Readonly<{ position: Position; direction: Direction }>
export type Position = Readonly<{ x: number; y: number }>
export type Direction = "Nord" | "Est" | "West" | "South"
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

export const invalidSize = (e: Error): ParseError => ({
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

// TODO 8: fix the implementation in order to consume the domain Either
// HINT: keep the parsing Either
// HINT: use proper renderObstacle or renderComplete to produce the final string
// HINT: combine phase normal and then removal phase
export const runApp = (
  inputPlanet: Tuple<string, string>,
  inputRover: Tuple<string, string>,
  inputCommands: string,
): Either<ParseError, string> =>
  pipe(
    runMission(inputPlanet, inputRover, inputCommands),
    E.map(renderComplete),
  )

// TODO 7: fix return type in order to propagate the domain Either
// HINT: function implementation should not change
const runMission = (
  inputPlanet: Tuple<string, string>,
  inputRover: Tuple<string, string>,
  inputCommands: string,
): Either<ParseError, Rover> =>
  pipe(
    E.of(executeAll),
    E.ap(parsePlanet(inputPlanet)),
    E.ap(parseRover(inputRover)),
    E.ap(parseCommands(inputCommands)),
  )

// PARSING

export const parseCommands = (
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
    .with("N", () => E.right("Nord" as const))
    .with("E", () => E.right("Est" as const))
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

const renderComplete = (rover: Rover): string =>
  `${rover.position.x}:${rover.position.y}:${rover.direction}`

const renderObstacle = (rover: Rover): string =>
  `O:${rover.position.x}:${rover.position.y}:${rover.direction}`

// DOMAIN

// TODO 6: fix the implementation in order to propagate the domain Either
// HINT: lift initial value
// HINT: combine previous execute result with the current one
// HINT: combination phase effectful (Monad)
const executeAll =
  (planet: Planet) =>
  (rover: Rover) =>
  (commands: Commands): Rover =>
    commands.reduce(execute(planet), rover)

// TODO 5: fix the implementation in order to propagate the domain Either
// HINT: lift pure values to align return types
const execute =
  (planet: Planet) =>
  (rover: Rover, command: Command): Rover =>
    match(command)
      .with("TurnRight", () => turnRight(rover))
      .with("TurnLeft", () => turnLeft(rover))
      .with("MoveForward", () => moveForward(planet, rover))
      .with("MoveBackward", () => moveBackward(planet, rover))
      .exhaustive()

const turnRight = (rover: Rover): Rover => {
  const direction = match(rover.direction)
    .with("Nord", () => "Est" as const)
    .with("Est", () => "South" as const)
    .with("South", () => "West" as const)
    .with("West", () => "Nord" as const)
    .exhaustive()

  return pipe(rover, updateRover({ direction }))
}

const turnLeft = (rover: Rover): Rover => {
  const direction = match(rover.direction)
    .with("Nord", () => "West" as const)
    .with("West", () => "South" as const)
    .with("South", () => "Est" as const)
    .with("Est", () => "Nord" as const)
    .exhaustive()

  return pipe(rover, updateRover({ direction }))
}

// TODO 4: fix the implementation in order to propagate the domain Either
// HINT: combination phase normal
const moveForward = (planet: Planet, rover: Rover): Rover =>
  pipe(rover.direction, delta, nextPosition(planet, rover), (position) =>
    updateRover({ position })(rover),
  )

// TODO 3: fix the implementation in order to propagate the domain Either
// HINT: combination phase normal
const moveBackward = (planet: Planet, rover: Rover): Rover =>
  pipe(
    rover.direction,
    opposite,
    delta,
    nextPosition(planet, rover),
    (position) => updateRover({ position })(rover),
  )

const opposite = (direction: Direction): Direction =>
  match(direction)
    .with("Nord", () => "South" as const)
    .with("South", () => "Nord" as const)
    .with("Est", () => "West" as const)
    .with("West", () => "Est" as const)
    .exhaustive()

const delta = (direction: Direction): Delta =>
  match(direction)
    .with("Nord", () => ({ x: 0, y: 1 }))
    .with("South", () => ({ x: 0, y: -1 }))
    .with("Est", () => ({ x: 1, y: 0 }))
    .with("West", () => ({ x: -1, y: 0 }))
    .exhaustive()

// TODO 2: change return type (follow result type) in the domain Either
// HINT: the result should be either a ObstacleDetected or Position
const nextPosition =
  (planet: Planet, rover: Rover) =>
  (delta: Delta): Position => {
    const newX = wrap(rover.position.x, planet.size.width, delta.x)
    const newY = wrap(rover.position.y, planet.size.height, delta.y)
    const candidate = position(newX)(newY)

    return updatePosition(candidate)(rover.position)
    // TODO 1: remove previous line and uncomment the following to produce a domain Either
    // HINT: get familiar with following code
    // const hitObstacle = planet.obstacles.findIndex(
    //   (x) => x.position.x == newX && x.position.y == newY,
    // )
    //
    // return hitObstacle != -1
    //   ? E.left(rover)
    //   : E.right(updatePosition(candidate)(rover.position))
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
