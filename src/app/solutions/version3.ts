import { match } from "ts-pattern"
import { pipe, flip } from "fp-ts/function"
import { Either } from "fp-ts/Either"
import * as E from "fp-ts/Either"
import { tuple, Tuple } from "../tuple"

type Rover = { position: Position; direction: Direction }
type Planet = { size: Size; obstacles: ReadonlyArray<Obstacle> }
type Command = "TurnRight" | "TurnLeft" | "MoveForward" | "MoveBackward"
type Obstacle = { position: Position }
type Position = { x: number; y: number }
type Size = { width: number; height: number }
type Delta = { x: number; y: number }
type Direction = "N" | "E" | "W" | "S"

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
type InvalidObstacle = { readonly _tag: "InvalidObstacle"; readonly error: Error }
type InvalidPosition = { readonly _tag: "InvalidPosition"; readonly error: Error }
type InvalidDirection = { readonly _tag: "InvalidDirection"; readonly error: Error }
type InvalidCommand = { readonly _tag: "InvalidCommand"; readonly error: Error }

export const invalidSize = (e: Error): ParseError => ({ _tag: "InvalidSize", error: e })
export const invalidObstacle = (e: Error): ParseError => ({
  _tag: "InvalidObstacle",
  error: e,
})
export const invalidPosition = (e: Error): ParseError => ({ _tag: "InvalidPosition", error: e })
export const invalidDirection = (e: Error): ParseError => ({
  _tag: "InvalidDirection",
  error: e,
})
export const invalidCommand = (e: Error): ParseError => ({ _tag: "InvalidCommand", error: e })

export const runMission = (
  inputPlanet: Tuple<string, string>,
  inputRover: Tuple<string, string>,
  inputCommands: string,
): Either<ParseError, string> =>
  pipe(
    pipe(
      E.of(executeAll),
      E.ap(parsePlanet(inputPlanet)),
      E.ap(parseRover(inputRover)),
      E.ap(parseCommands(inputCommands)),
    ),
    E.map(E.fold(renderObstacle, renderComplete)),
  )

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
  E.tryCatch(() => unsafeParseTuple(separator, input), E.toError)

const unsafeParseTuple = (separator: string, input: string): Tuple<number, number> => {
  const parts = input.split(separator)
  const first = Number(parts[0])
  const second = Number(parts[1])

  if (Number.isNaN(first) || Number.isNaN(second)) throw new Error(`Input: ${input}`)

  return tuple(first, second)
}

// RENDERING

const renderComplete = (rover: Rover): string =>
  `${rover.position.x}:${rover.position.y}:${rover.direction}`

const renderObstacle = (rover: Rover): string =>
  `O:${rover.position.x}:${rover.position.y}:${rover.direction}`

// DOMAIN

const executeAll =
  (planet: Planet) =>
  (rover: Rover) =>
  (commands: ReadonlyArray<Command>): Either<Rover, Rover> =>
    commands.reduce(
      (prev, cmd) => pipe(prev, E.chain(flip(execute(planet))(cmd))),
      E.of<Rover, Rover>(rover),
    )

const execute =
  (planet: Planet) =>
  (rover: Rover) =>
  (command: Command): Either<Rover, Rover> =>
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

const moveForward = (planet: Planet, rover: Rover): Either<Rover, Rover> =>
  pipe(
    next(planet, rover, delta(rover.direction)),
    E.map((position) => updateRover({ position })(rover)),
  )

const moveBackward = (planet: Planet, rover: Rover): Either<Rover, Rover> =>
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

const next = (planet: Planet, rover: Rover, delta: Delta): Either<Rover, Position> => {
  const position = rover.position
  const newX = wrap(position.x, planet.size.width, delta.x)
  const newY = wrap(position.y, planet.size.height, delta.y)
  const candidate = positionCtor(newX)(newY)

  const hitObstacle = planet.obstacles.findIndex(
    (x) => x.position.x == newX && x.position.y == newY,
  )

  return hitObstacle ? E.left(rover) : E.right(updatePosition(candidate)(position))
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
