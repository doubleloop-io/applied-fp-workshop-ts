import { Either } from "fp-ts/Either"
import * as E from "fp-ts/Either"
import { match } from "ts-pattern"
import { Tuple, unsafeParse } from "../app/utils/tuple"
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
  roverCtor,
  positionCtor,
  planetCtor,
  sizeCtor,
  obstacleCtor,
  invalidSize,
  invalidDirection,
  invalidCommand,
  invalidPosition,
  invalidObstacle,
} from "./core"

export const parseCommands = (
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

export const parseRover = (
  input: Tuple<string, string>,
): Either<ParseError, Rover> =>
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

export const parsePlanet = (
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
