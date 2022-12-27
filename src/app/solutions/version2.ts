import { match } from "ts-pattern"
import { Either } from "fp-ts/Either"
import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/lib/function"

type Rover = { position: Position; direction: Direction }
type Planet = { size: Size; obstacles: ReadonlyArray<Obstacle> }
type Obstacle = { position: Position }
type Position = { x: number; y: number }
type Size = { width: number; height: number }
type Delta = { x: number; y: number }

type Tuple<A, B> = { first: A; second: B }

const planetCtor =
  (size: Size) =>
  (obstacles: ReadonlyArray<Obstacle>): Planet => ({ size, obstacles })

const roverCtor =
  (position: Position) =>
  (direction: Direction): Rover => ({ position, direction })

type Command = "TurnRight" | "TurnLeft" | "MoveForward" | "MoveBackward"
type Direction = "N" | "E" | "W" | "S"

type ParseError =
  | InvalidPlanetSize
  | InvalidPlanetObstacle
  | InvalidRoverPosition
  | InvalidRoverDirection
  | InvalidCommand

type InvalidPlanetSize = { readonly _tag: "InvalidPlanetSize"; readonly error: Error }
type InvalidPlanetObstacle = { readonly _tag: "InvalidPlanetObstacle"; readonly error: Error }
type InvalidRoverPosition = { readonly _tag: "InvalidRoverPosition"; readonly error: Error }
type InvalidRoverDirection = { readonly _tag: "InvalidRoverDirection"; readonly error: Error }
type InvalidCommand = { readonly _tag: "InvalidCommand"; readonly error: Error }

export const invalidPlanetSize = (e: Error): ParseError => ({ _tag: "InvalidPlanetSize", error: e })
const invalidPlanetObstacle = (e: Error): ParseError => ({
  _tag: "InvalidPlanetObstacle",
  error: e,
})
const invalidPosition = (e: Error): ParseError => ({ _tag: "InvalidRoverPosition", error: e })
const invalidRoverDirection = (e: Error): ParseError => ({
  _tag: "InvalidRoverDirection",
  error: e,
})
const invalidCommand = (e: Error): ParseError => ({ _tag: "InvalidCommand", error: e })

// PARSING
export const parseCommands = (input: string): Either<ParseError, ReadonlyArray<Command>> =>
  E.traverseArray(parseCommand)(input.split(""))

const parseCommand = (input: string): Either<ParseError, Command> =>
  match(input.toLocaleUpperCase())
    .with("R", () => E.right<ParseError, Command>("TurnRight"))
    .with("L", () => E.right<ParseError, Command>("TurnLeft"))
    .with("F", () => E.right<ParseError, Command>("MoveForward"))
    .with("B", () => E.right<ParseError, Command>("MoveBackward"))
    .otherwise(() => E.left(invalidCommand(new Error(`Cannot parse command: ${input}`))))

const parseRover = (input: Tuple<string, string>): Either<ParseError, Rover> =>
  pipe(E.of(roverCtor), E.ap(parsePosition(input.first)), E.ap(parseDirection(input.second)))

const parsePosition = (input: string): Either<ParseError, Position> =>
  pipe(
    parseInts("x", input),
    E.mapLeft(invalidPosition),
    E.map((tuple) => ({ x: tuple.first, y: tuple.second })),
  )

const parseDirection = (input: string): Either<ParseError, Direction> =>
  match(input.toLocaleUpperCase())
    .with("N", () => E.right<ParseError, Direction>("N"))
    .with("E", () => E.right<ParseError, Direction>("E"))
    .with("W", () => E.right<ParseError, Direction>("W"))
    .with("S", () => E.right<ParseError, Direction>("S"))
    .otherwise(() => E.left(invalidRoverDirection(new Error(`Cannot parse direction: ${input}`))))

const parsePlanet = (input: Tuple<string, string>): Either<ParseError, Planet> =>
  pipe(E.of(planetCtor), E.ap(parseSize(input.first)), E.ap(parseObstacles(input.second)))

const parseSize = (input: string): Either<ParseError, Size> =>
  pipe(
    parseInts("x", input),
    E.mapLeft(invalidPlanetSize),
    E.map((tuple) => ({ width: tuple.first, height: tuple.second })),
  )

const parseObstacles = (input: string): Either<ParseError, ReadonlyArray<Obstacle>> =>
  E.traverseArray(parseObstacle)(input.split(" "))

const parseObstacle = (input: string): Either<ParseError, Obstacle> =>
  pipe(
    parseInts("x", input),
    E.mapLeft(invalidPlanetObstacle),
    E.map((tuple) => ({ position: { x: tuple.first, y: tuple.second } })),
  )

const parseInts = (separator: string, input: string): Either<Error, Tuple<number, number>> =>
  E.tryCatch(() => unsafeParseInts(separator, input), E.toError)

const unsafeParseInts = (separator: string, input: string): Tuple<number, number> => {
  const parts = input.split(separator)
  const first = Number(parts[0])
  const second = Number(parts[1])

  if (!first || !second) throw new Error(`Cannot parse ints (${separator}): ${input}`)

  return { first, second }
}

// RENDERING

const render = (rover: Rover): string =>
  `${rover.position.x}:${rover.position.y}:${rover.direction}`

// DOMAIN

const executeAll = (planet: Planet, rover: Rover, commands: ReadonlyArray<Command>): Rover =>
  commands.reduce(execute(planet), rover)

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

const moveForward = (planet: Planet, rover: Rover): Rover => {
  const newPosition = next(planet, rover, delta(rover.direction))
  return updateRover({ position: newPosition })(rover)
}

const moveBackward = (planet: Planet, rover: Rover): Rover => {
  const newPosition = next(planet, rover, delta(opposite(rover.direction)))
  return updateRover({ position: newPosition })(rover)
}

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

const next = (planet: Planet, rover: Rover, delta: Delta): Position => {
  const position = rover.position
  const newX = wrap(position.x, planet.size.width, delta.x)
  const newY = wrap(position.y, planet.size.height, delta.y)
  return updatePosition({ x: newX, y: newY })(position)
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
