/*
    ## V1 - Focus on the center (pure domain logic)

    Develop an API (types and functions) that executes commands:
    - Implement all commands logic.
    - Commands are sent in batch and executed sequentially.
    - The planet grid has a wrapping effect from one edge to another (pacman).
    - For now, ignore obstacle detection logic
 */

import { match } from "ts-pattern"

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

// TODO 1: Execute all commands and return final rover state
export const executeAll = (
  planet: Planet,
  rover: Rover,
  commands: Commands,
): Rover => {
  throw new Error("TODO")
}

// TODO 2: Dispatch each command to the specific function
export const execute =
  (planet: Planet) =>
    (rover: Rover, command: Command): Rover => {
      throw new Error("TODO")
    }

// TODO 3: Change rover direction
const turnRight = (rover: Rover): Rover => {
  throw new Error("TODO")
}

// TODO 4: Change rover direction
const turnLeft = (rover: Rover): Rover => {
  throw new Error("TODO")
}

// TODO 5: Change rover position
const moveForward = (planet: Planet, rover: Rover): Rover => {
  throw new Error("TODO")
}

// TODO 6: Change rover position
const moveBackward = (planet: Planet, rover: Rover): Rover => {
  throw new Error("TODO")
}

// NOTE: utility functions
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