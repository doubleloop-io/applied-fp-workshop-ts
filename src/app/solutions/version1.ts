import { match } from "ts-pattern"

type Rover = { position: Position; direction: Direction }
type Planet = { size: Size }
type Position = { x: number; y: number }
type Size = { width: number; height: number }
type Delta = { x: number; y: number }

type Command = "TurnRight" | "TurnLeft" | "MoveForward" | "MoveBackward"
type Direction = "N" | "E" | "W" | "S"

const executeAll = (
    planet: Planet,
    rover: Rover,
    commands: ReadonlyArray<Command>,
): Rover => commands.reduce(execute(planet), rover)

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
    const newDirection = match(rover.direction)
        .with("N", () => "E" as const)
        .with("E", () => "S" as const)
        .with("S", () => "W" as const)
        .with("W", () => "N" as const)
        .exhaustive()

    return updateRover({ direction: newDirection })(rover)
}

const turnLeft = (rover: Rover): Rover => {
    const newDirection = match(rover.direction)
        .with("N", () => "W" as const)
        .with("W", () => "S" as const)
        .with("S", () => "E" as const)
        .with("E", () => "N" as const)
        .exhaustive()

    return updateRover({ direction: newDirection })(rover)
}

const moveForward = (planet: Planet, rover: Rover): Rover => {
    const newPosition = next(planet, rover, delta(rover.direction))
    return updateRover({ position: newPosition })(rover)
}

const moveBackward = (planet: Planet, rover: Rover): Rover => {
    const newPosition = next(planet, rover, delta(opposite(rover.direction)))
    return updateRover({ position: newPosition })(rover)
}

const opposite = (direction: Direction): Direction => {
    return match(direction)
        .with("N", () => "S" as const)
        .with("S", () => "N" as const)
        .with("E", () => "W" as const)
        .with("W", () => "E" as const)
        .exhaustive()
}

const delta = (direction: Direction): Delta => {
    return match(direction)
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
    return updatePosition({ x: newX, y: newY })(position)
}

const wrap = (value: number, limit: number, delta: number): number =>
    (((value + delta) % limit) + limit) % limit

const updatePosition =
    (params: Partial<Position>) =>
    (p: Position): Position => ({
        x: params.x || p.x,
        y: params.y || p.y,
    })

const updateRover =
    (params: Partial<Rover>) =>
    (r: Rover): Rover => ({
        position: params.position || r.position,
        direction: params.direction || r.direction,
    })
