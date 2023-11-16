/*
    ## V2 - Focus on boundaries (from primitive to domain types and vice versa)

    Our domain is declared with rich types but inputs/outputs are should be primitive types
    - Write a parser for input planet data (size, obstacles)
    - Write a parser for input rover data (position, orientation)
    - Write a parser for input commands
    - Render the final result as string: "positionX:positionY:orientation"
 */

import { match } from "ts-pattern"
import { pipe } from "fp-ts/function"
import * as E from "fp-ts/Either"
import { Either } from "fp-ts/Either"
import { Tuple, unsafeParse } from "../utils/tuple"

// TODO 1: get familiar with domain types and constructors
type Rover = Readonly<{ position: Position; direction: Direction }>
type Position = Readonly<{ x: number; y: number }>
type Direction = "N" | "E" | "W" | "S"
type Planet = Readonly<{ size: Size; obstacles: ReadonlyArray<Obstacle> }>
type Size = Readonly<{ width: number; height: number }>
type Obstacle = Readonly<{ position: Position }>
type Command = "TurnRight" | "TurnLeft" | "MoveForward" | "MoveBackward"
type Commands = ReadonlyArray<Command>
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

// TODO 2: get familiar with parsing types and constructors
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
export const invalidObstacle = (e: Error): ParseError => ({
  _tag: "InvalidObstacle",
  error: e,
})
export const invalidPosition = (e: Error): ParseError => ({
  _tag: "InvalidPosition",
  error: e,
})
export const invalidDirection = (e: Error): ParseError => ({
  _tag: "InvalidDirection",
  error: e,
})
export const invalidCommand = (e: Error): ParseError => ({
  _tag: "InvalidCommand",
  error: e,
})

// ENTRY POINT

// TODO 3: runMission and then render final rover
// HINT: removal phase
export const runApp = (
  inputPlanet: Tuple<string, string>,
  inputRover: Tuple<string, string>,
  inputCommands: string,
): Either<ParseError, string> => {
  throw new Error("TODO")
}

// TODO 4: executeAll with parsed planet, rover and commands
// HINT: combination phase many (Applicative)
const runMission = (
  inputPlanet: Tuple<string, string>,
  inputRover: Tuple<string, string>,
  inputCommands: string,
): Either<ParseError, Rover> => {
  throw new Error("TODO")
}

// PARSING

// TODO 5: parse each char in a command and combine in one result
// HINT: combination phase list (Traversal)
// INPUT EXAMPLE: "BFFLLR"
export const parseCommands = (
  input: string,
): Either<ParseError, ReadonlyArray<Command>> => {
  throw new Error("TODO")
}

// TODO 6: parse string in a command or returns an error
// HINT: creation phase
// INPUT EXAMPLE: "B"
const parseCommand = (input: string): Either<ParseError, Command> => {
  throw new Error("TODO")
}

// TODO 7: parse the tuple in a rover
// HINT: combine many value...what abstraction is needed?
// INPUT EXAMPLE: ("2,0", "N")
const parseRover = (
  input: Tuple<string, string>,
): Either<ParseError, Rover> => {
  throw new Error("TODO")
}

// TODO 8: first parse string in a tuple and then in a position
// HINT: combination phase normal (Functor)
// INPUT EXAMPLE: "2,0"
const parsePosition = (input: string): Either<ParseError, Position> => {
  throw new Error("TODO")
}

// TODO 9: parse string in a direction
// HINT: creation phase
// INPUT EXAMPLE: "N"
const parseDirection = (input: string): Either<ParseError, Direction> => {
  throw new Error("TODO")
}

// TODO 10: parse tuple in a planet
// HINT: combination phase many...what abstraction is needed?
// INPUT EXAMPLE: ("5x4", "2,0 0,3")
const parsePlanet = (
  input: Tuple<string, string>,
): Either<ParseError, Planet> => {
  throw new Error("TODO")
}

// TODO 11: parse string in a size
// HINT: combination phase normal...what abstraction is needed?
// INPUT EXAMPLE: "5x4"
const parseSize = (input: string): Either<ParseError, Size> => {
  throw new Error("TODO")
}

// TODO 12: parse each string part in an obstacle
// HINT: combination phase list...what abstraction is needed?
// INPUT EXAMPLE: "2,0 0,3"
const parseObstacles = (
  input: string,
): Either<ParseError, ReadonlyArray<Obstacle>> => {
  throw new Error("TODO")
}

// TODO 13: first parse the string in a tuple and then in an obstacle
// HINT: combination phase normal...what abstraction is needed?
// INPUT EXAMPLE: "2,0"
const parseObstacle = (input: string): Either<ParseError, Obstacle> => {
  throw new Error("TODO")
}

// NOTE: utility function to split a string in a pair of numbers
const parseTuple = (
  separator: string,
  input: string,
): Either<Error, Tuple<number, number>> =>
  E.tryCatch(() => unsafeParse(separator, input), E.toError)

// RENDERING

// TODO 14: convert a rover in a string
// OUTPUT EXAMPLE: "3:2:S"
const renderComplete = (rover: Rover): string => {
  throw new Error("TODO")
}

// DOMAIN

const executeAll =
  (planet: Planet) =>
  (rover: Rover) =>
  (commands: Commands): Rover =>
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

const moveForward = (planet: Planet, rover: Rover): Rover => {
  const newPosition = next(planet, rover, delta(rover.direction))
  return updateRover({ position: newPosition })(rover)
}

const moveBackward = (planet: Planet, rover: Rover): Rover => {
  const newPosition = next(planet, rover, delta(opposite(rover.direction)))
  return updateRover({ position: newPosition })(rover)
}

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

const next = (planet: Planet, rover: Rover, delta: Delta): Position => {
  const newX = wrap(rover.position.x, planet.size.width, delta.x)
  const newY = wrap(rover.position.y, planet.size.height, delta.y)
  const candidate = position(newX)(newY)
  return updatePosition(candidate)(rover.position)
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
