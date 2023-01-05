export type Rover = { position: Position; direction: Direction }
export type Position = { x: number; y: number }
export type Direction = "N" | "E" | "W" | "S"
export type Planet = { size: Size; obstacles: ReadonlyArray<Obstacle> }
export type Size = { width: number; height: number }
export type Obstacle = { position: Position }
export type Command = "TurnRight" | "TurnLeft" | "MoveForward" | "MoveBackward"
export type Commands = ReadonlyArray<Command>
export type Delta = { x: number; y: number }
export type ObstacleDetected = Rover

export const planetCtor =
  (size: Size) =>
  (obstacles: ReadonlyArray<Obstacle>): Planet => ({ size, obstacles })

export const roverCtor =
  (position: Position) =>
  (direction: Direction): Rover => ({ position, direction })

export const positionCtor =
  (x: number) =>
  (y: number): Position => ({ x, y })

export const sizeCtor =
  (width: number) =>
  (height: number): Size => ({ width, height })

export const obstacleCtor =
  (x: number) =>
  (y: number): Obstacle => ({ position: { x, y } })

export const updatePosition =
  (values: Partial<Position>) =>
  (actual: Position): Position => ({
    x: values.x != null ? values.x : actual.x,
    y: values.y != null ? values.y : actual.y,
  })

export const updateRover =
  (values: Partial<Rover>) =>
  (actual: Rover): Rover => ({
    position: values.position != null ? values.position : actual.position,
    direction: values.direction != null ? values.direction : actual.direction,
  })

export type ParseError =
  | InvalidSize
  | InvalidObstacle
  | InvalidPosition
  | InvalidDirection
  | InvalidCommand

type InvalidSize = { readonly _tag: "InvalidSize"; readonly error: Error }
type InvalidObstacle = {
  readonly _tag: "InvalidObstacle"
  readonly error: Error
}
type InvalidPosition = {
  readonly _tag: "InvalidPosition"
  readonly error: Error
}
type InvalidDirection = {
  readonly _tag: "InvalidDirection"
  readonly error: Error
}
type InvalidCommand = { readonly _tag: "InvalidCommand"; readonly error: Error }

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
