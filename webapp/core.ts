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
export type Delta = Readonly<{ x: number; y: number }>
export type ObstacleDetected = Rover

export const planet =
  (size: Size) =>
  (obstacles: ReadonlyArray<Obstacle>): Planet => ({ size, obstacles })

export const rover =
  (position: Position) =>
  (direction: Direction): Rover => ({ position, direction })

export const position =
  (x: number) =>
  (y: number): Position => ({ x, y })

export const size =
  (width: number) =>
  (height: number): Size => ({ width, height })

export const obstacle =
  (x: number) =>
  (y: number): Obstacle => ({ position: { x, y } })

export const delta =
  (x: number) =>
  (y: number): Delta => ({ x, y })

export const updatePosition =
  (values: Partial<Position>) =>
  (actual: Position): Position => ({
    ...actual,
    ...values,
  })

export const updateRover =
  (values: Partial<Rover>) =>
  (actual: Rover): Rover => ({
    ...actual,
    ...values,
  })

export type ParseError =
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
