import {
  Command,
  Commands,
  execute,
  executeAll,
  Planet,
  Rover,
} from "../../src/solutions/version1"

describe.skip("version 1", () => {

  test("turn right command", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = { position: { x: 0, y: 0 }, direction: "N" as const }
    const command: Command = "TurnRight"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "E" })
  })

  test("turn left command", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = { position: { x: 0, y: 0 }, direction: "N" as const }
    const command: Command = "TurnLeft"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "W" })
  })

  test("move forward command", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = { position: { x: 0, y: 1 }, direction: "N" as const }
    const command: Command = "MoveForward"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 2 }, direction: "N" })
  })

  test("move forward command, opposite direction", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = { position: { x: 0, y: 1 }, direction: "S" as const }
    const command: Command = "MoveForward"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "S" })
  })

  test("move backward command", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = { position: { x: 0, y: 1 }, direction: "N" as const }
    const command: Command = "MoveBackward"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "N" })
  })

  test("move forward command, opposite direction", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = { position: { x: 0, y: 1 }, direction: "S" as const }
    const command: Command = "MoveBackward"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 2 }, direction: "S" })
  })

  test("wrap on North", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = { position: { x: 0, y: 3 }, direction: "N" as const }
    const command: Command = "MoveForward"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "N" })
  })

  test("go to opposite angle", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = { position: { x: 0, y: 0 }, direction: "N" as const }
    const commands: Commands = [
      "TurnLeft" as const,
      "MoveForward" as const,
      "TurnRight" as const,
      "MoveBackward" as const,
    ]

    const result: Rover = executeAll(planet, rover, commands)

    expect(result).toStrictEqual({ position: { x: 4, y: 3 }, direction: "N" })
  })
})
