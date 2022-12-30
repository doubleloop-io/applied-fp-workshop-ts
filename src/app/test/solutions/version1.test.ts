import { execute, executeAll } from "../../solutions/version1"

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
    const planet = { size: { width: 5, height: 4 } }
    const rover = { position: { x: 0, y: 0 }, direction: "N" as const }
    const command = "TurnRight"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "E" })
  })

  test("turn left command", () => {
    const planet = { size: { width: 5, height: 4 } }
    const rover = { position: { x: 0, y: 0 }, direction: "N" as const }
    const command = "TurnLeft"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "W" })
  })

  test("move forward command", () => {
    const planet = { size: { width: 5, height: 4 } }
    const rover = { position: { x: 0, y: 1 }, direction: "N" as const }
    const command = "MoveForward"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 2 }, direction: "N" })
  })

  test("move forward command, opposite direction", () => {
    const planet = { size: { width: 5, height: 4 } }
    const rover = { position: { x: 0, y: 1 }, direction: "S" as const }
    const command = "MoveForward"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "S" })
  })

  test("move backward command", () => {
    const planet = { size: { width: 5, height: 4 } }
    const rover = { position: { x: 0, y: 1 }, direction: "N" as const }
    const command = "MoveBackward"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "N" })
  })

  test("move forward command, opposite direction", () => {
    const planet = { size: { width: 5, height: 4 } }
    const rover = { position: { x: 0, y: 1 }, direction: "S" as const }
    const command = "MoveBackward"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 2 }, direction: "S" })
  })

  test("wrap on North", () => {
    const planet = { size: { width: 5, height: 4 } }
    const rover = { position: { x: 0, y: 3 }, direction: "N" as const }
    const command = "MoveForward"

    const result = execute(planet)(rover, command)

    expect(result).toStrictEqual({ position: { x: 0, y: 0 }, direction: "N" })
  })

  test("go to opposite angle", () => {
    const planet = { size: { width: 5, height: 4 } }
    const rover = { position: { x: 0, y: 0 }, direction: "N" as const }
    const commands = [
      "TurnLeft" as const,
      "MoveForward" as const,
      "TurnRight" as const,
      "MoveBackward" as const,
    ]

    const result = executeAll(planet, rover, commands)

    expect(result).toStrictEqual({ position: { x: 4, y: 3 }, direction: "N" })
  })
})
