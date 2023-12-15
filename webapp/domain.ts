import * as E from "fp-ts/Either"
import { Either } from "fp-ts/Either"
import { pipe } from "fp-ts/function"
import { match } from "ts-pattern"
import {
  Command,
  Commands,
  delta,
  Delta,
  Direction,
  ObstacleDetected,
  Planet,
  Position,
  position,
  Rover,
  updatePosition,
  updateRover,
} from "./core"

export const executeAll =
  (planet: Planet) =>
  (rover: Rover) =>
  (commands: Commands): Either<ObstacleDetected, Rover> =>
    commands.reduce(
      (prev, cmd) =>
        pipe(
          prev,
          E.flatMap((next) => execute(planet)(next)(cmd)),
        ),
      E.of<ObstacleDetected, Rover>(rover),
    )

const execute =
  (planet: Planet) =>
  (rover: Rover) =>
  (command: Command): Either<ObstacleDetected, Rover> =>
    match(command)
      .with("TurnRight", () => E.of(turnRight(rover)))
      .with("TurnLeft", () => E.of(turnLeft(rover)))
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

const moveForward = (
  planet: Planet,
  rover: Rover,
): Either<ObstacleDetected, Rover> =>
  pipe(
    rover.direction,
    toDelta,
    nextPosition(planet, rover),
    E.map((position) => updateRover({ position })(rover)),
  )

const moveBackward = (
  planet: Planet,
  rover: Rover,
): Either<ObstacleDetected, Rover> =>
  pipe(
    rover.direction,
    opposite,
    toDelta,
    nextPosition(planet, rover),
    E.map((position) => updateRover({ position })(rover)),
  )

const opposite = (direction: Direction): Direction =>
  match(direction)
    .with("Nord", () => "South" as const)
    .with("South", () => "Nord" as const)
    .with("Est", () => "West" as const)
    .with("West", () => "Est" as const)
    .exhaustive()

const toDelta = (direction: Direction): Delta =>
  match(direction)
    .with("Nord", () => delta(0)(1))
    .with("South", () => delta(0)(-1))
    .with("Est", () => delta(1)(0))
    .with("West", () => delta(-1)(0))
    .exhaustive()

const nextPosition =
  (planet: Planet, rover: Rover) =>
  (delta: Delta): Either<ObstacleDetected, Position> => {
    const newX = wrap(rover.position.x, planet.size.width, delta.x)
    const newY = wrap(rover.position.y, planet.size.height, delta.y)
    const candidate = position(newX)(newY)

    const hitObstacle = planet.obstacles.findIndex(
      (x) => x.position.x == newX && x.position.y == newY,
    )

    return hitObstacle != -1
      ? E.left(rover)
      : E.right(updatePosition(candidate)(rover.position))
  }

const wrap = (value: number, limit: number, delta: number): number =>
  (((value + delta) % limit) + limit) % limit
