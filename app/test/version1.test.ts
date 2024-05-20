import {
  Command,
  Commands,
  execute,
  executeAll,
  Planet,
  Rover,
} from "../src/version1"

// TODO 1: gradually eliminate the "skip marker" and check that tests are green
describe.skip("version 1", () => {
  test.skip("turn right command", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = {
      position: { x: 0, y: 0 },
      direction: "North" as const,
    }
    const command: Command = "TurnRight"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "E" })
  })

  test.skip("turn left command", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = {
      position: { x: 0, y: 0 },
      direction: "North" as const,
    }
    const command: Command = "TurnLeft"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "W" })
  })

  test.skip("move forward command", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = {
      position: { x: 0, y: 1 },
      direction: "North" as const,
    }
    const command: Command = "MoveForward"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 2 }, direction: "N" })
  })

  test.skip("move forward command, opposite direction", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = {
      position: { x: 0, y: 1 },
      direction: "South" as const,
    }
    const command: Command = "MoveForward"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "S" })
  })

  test.skip("move backward command", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = {
      position: { x: 0, y: 1 },
      direction: "North" as const,
    }
    const command: Command = "MoveBackward"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "N" })
  })

  test.skip("move forward command, opposite direction", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = {
      position: { x: 0, y: 1 },
      direction: "South" as const,
    }
    const command: Command = "MoveBackward"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 2 }, direction: "S" })
  })

  test.skip("wrap on North", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = {
      position: { x: 0, y: 3 },
      direction: "North" as const,
    }
    const command: Command = "MoveForward"

    const result: Rover = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "N" })
  })

  test.skip("go to opposite angle", () => {
    const planet: Planet = { size: { width: 5, height: 4 }, obstacles: [] }
    const rover: Rover = {
      position: { x: 0, y: 0 },
      direction: "North" as const,
    }
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
