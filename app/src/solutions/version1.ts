import { match } from "ts-pattern"
import { pipe } from "fp-ts/function"
import { Either } from "fp-ts/Either"
import * as E from "fp-ts/Either"
import { ObstacleDetected } from "./version5"

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
type Delta = Readonly<{ x: number; y: number }>

export const executeAll = (
  planet: Planet,
  rover: Rover,
  commands: Commands,
): Rover => commands.reduce(execute(planet), rover)

export const execute =
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

const moveForward = (planet: Planet, rover: Rover): Rover =>
  pipe(rover.direction, delta, nextPosition(planet, rover), (position) =>
    updateRover({ position })(rover),
  )

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

const nextPosition =
  (planet: Planet, rover: Rover) =>
  (delta: Delta): Position => {
    const newX = wrap(rover.position.x, planet.size.width, delta.x)
    const newY = wrap(rover.position.y, planet.size.height, delta.y)
    return pipe(rover.position, updatePosition({ x: newX, y: newY }))
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
