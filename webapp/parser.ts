import { Either } from "fp-ts/Either"
import * as E from "fp-ts/Either"
import { match } from "ts-pattern"
import { Tuple, parseTuple } from "../app/utils/tuple"
import { pipe } from "fp-ts/function"
import {
  Command,
  ParseError,
  Planet,
  Rover,
  Position,
  Direction,
  Size,
  Obstacle,
  rover,
  position,
  planet,
  size,
  obstacle,
  invalidSize,
  invalidDirection,
  invalidCommand,
  invalidPosition,
  invalidObstacle,
} from "./core"

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

export const parseRover = ({
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

export const parsePlanet = ({
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
