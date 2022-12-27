import { Command, execute, executeAll, Planet, Rover } from "../../solutions/version1"

describe("version 1", () => {
  // Planet layout
  // +-----+-----+-----+-----+-----+
  // | 0,3 |     |     |     | 4,3 |
  // +-----+-----+-----+-----+-----+
  // |     |     |     |     |     |
  // +-----+-----+-----+-----+-----+
  // |     |     |     |     |     |
  // +-----+-----+-----+-----+-----+
  // | 0,0 |     |     |     | 4,0 |
  // +-----+-----+-----+-----+-----+

  test("turn right command", () => {
    const planet: Planet = { size: { width: 5, height: 4 } }
    const rover: Rover = { position: { x: 0, y: 0 }, direction: "N" }
    const command: Command = "TurnRight"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "E" })
  })

  test("turn left command", () => {
    const planet: Planet = { size: { width: 5, height: 4 } }
    const rover: Rover = { position: { x: 0, y: 0 }, direction: "N" }
    const command: Command = "TurnLeft"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "W" })
  })

  test("move forward command", () => {
    const planet: Planet = { size: { width: 5, height: 4 } }
    const rover: Rover = { position: { x: 0, y: 1 }, direction: "N" }
    const command: Command = "MoveForward"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 2 }, direction: "N" })
  })

  test("move forward command, opposite direction", () => {
    const planet: Planet = { size: { width: 5, height: 4 } }
    const rover: Rover = { position: { x: 0, y: 1 }, direction: "S" }
    const command: Command = "MoveForward"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "S" })
  })

  test("move backward command", () => {
    const planet: Planet = { size: { width: 5, height: 4 } }
    const rover: Rover = { position: { x: 0, y: 1 }, direction: "N" }
    const command: Command = "MoveBackward"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "N" })
  })

  test("move forward command, opposite direction", () => {
    const planet: Planet = { size: { width: 5, height: 4 } }
    const rover: Rover = { position: { x: 0, y: 1 }, direction: "S" }
    const command: Command = "MoveBackward"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 2 }, direction: "S" })
  })

  test("wrap on North", () => {
    const planet: Planet = { size: { width: 5, height: 4 } }
    const rover: Rover = { position: { x: 0, y: 3 }, direction: "N" }
    const command: Command = "MoveForward"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "N" })
  })

  test("go to opposite angle", () => {
    const planet: Planet = { size: { width: 5, height: 4 } }
    const rover: Rover = { position: { x: 0, y: 0 }, direction: "N" }
    const commands: ReadonlyArray<Command> = [
      "TurnLeft",
      "MoveForward",
      "TurnRight",
      "MoveBackward",
    ]

    const result = executeAll(planet, rover, commands)

    expect(result).toStrictEqual({ position: { x: 4, y: 3 }, direction: "N" })
  })
})
