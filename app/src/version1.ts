/*
    ## V1 - Focus on the center (pure domain logic)

    Develop an API (types and functions) that executes commands:
    - Implement all commands logic.
    - Commands are sent in batch and executed sequentially.
    - The planet grid has a wrapping effect from one edge to another (pacman).
    - For now, ignore obstacle detection logic
 */

import { match } from "ts-pattern"

// TODO 1: Those type alias are only placeholders,
//  use correct type definitions and feel free to add more...
type Rover = unknown
type Position = unknown
type Direction = unknown
type Planet = unknown
type Size = unknown
type Obstacle = unknown
type Command = unknown
type Commands = unknown

// TODO 2: Execute all commands and return final rover state
export const executeAll = (
  planet: Planet,
  rover: Rover,
  commands: Commands,
): Rover => {
  throw new Error("TODO")
}

// TODO 3: Dispatch each command to the specific function
export const execute =
  (planet: Planet) =>
  (rover: Rover, command: Command): Rover => {
    throw new Error("TODO")
  }

// TODO 4: Change rover direction
const turnRight = (rover: Rover): Rover => {
  throw new Error("TODO")
}

// TODO 5: Change rover direction
const turnLeft = (rover: Rover): Rover => {
  throw new Error("TODO")
}

// TODO 6: Change rover position
const moveForward = (planet: Planet, rover: Rover): Rover => {
  throw new Error("TODO")
}

// TODO 7: Change rover position
const moveBackward = (planet: Planet, rover: Rover): Rover => {
  throw new Error("TODO")
}

// NOTE: utility function for the pacman effect
const wrap = (value: number, limit: number, delta: number): number =>
  (((value + delta) % limit) + limit) % limit
