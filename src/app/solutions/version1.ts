import { match } from "ts-pattern"

type Rover = { position: Position; orientation: Orientation }
type Planet = { size: Size }
type Position = { x: number; y: number }
type Size = { width: number; height: number }
type Delta = { x: number; y: number }

type Command = "TurnRight" | "TurnLeft" | "MoveForward" | "MoveBackward"
type Orientation = "N" | "E" | "W" | "S"

const moveForward = (planet: Planet, rover: Rover): Rover => {
    const newPosition = next(planet, rover, delta(rover.orientation))
    return updateRover(newPosition)(rover)
}

const moveBackward = (planet: Planet, rover: Rover): Rover => {
    const newPosition = next(planet, rover, delta(opposite(rover.orientation)))
    return updateRover(newPosition)(rover)
}

const opposite = (orientation: Orientation): Orientation => {
    return match(orientation)
        .with("N", () => "S" as const)
        .with("S", () => "N" as const)
        .with("E", () => "W" as const)
        .with("W", () => "E" as const)
        .exhaustive()
}

const delta = (orientation: Orientation): Delta => {
    return match(orientation)
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
    return updatePosition(newX, newY)(position)
}

const wrap = (value: number, limit: number, delta: number): number =>
    (((value + delta) % limit) + limit) % limit

const updatePosition =
    (x: number | null = null, y: number | null = null) =>
    (p: Position): Position => ({
        x: x != null ? x : p.x,
        y: y != null ? y : p.y,
    })

const updateRover =
    (
        position: Position | null = null,
        orientation: Orientation | null = null,
    ) =>
    (r: Rover): Rover => ({
        position: position != null ? position : r.position,
        orientation: orientation != null ? orientation : r.orientation,
    })
