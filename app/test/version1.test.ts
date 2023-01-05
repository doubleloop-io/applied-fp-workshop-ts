import { execute, executeAll } from "../src/version1"

// TODO 1: gradually eliminate the "skip marker" and check that the test is green
describe.skip("version 1", () => {
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

  // NOTE: each test describe the scenario in pseudo-code

  test.skip("turn right command", () => {
    //    planet = Planet:  5 4 (no obstacles)
    //    rover = Rover: 0 0 N
    //    command = Command: R
    //    result = execute(planet, rover, command)
    //    expect(result).toBe(Rover: 0 0 E)
  })

  test.skip("turn left command", () => {
    //    planet = Planet: 5 4 (no obstacles)
    //    rover = Rover: 0 0 N
    //    command = Command: L
    //    result = execute(planet, rover, command)
    //    assertEquals(result, Rover: 0 0 W)
  })

  test.skip("move forward command", () => {
    //    planet = Planet: 5 4 (no obstacles)
    //    rover = Rover: 0 1 N
    //    command = Command: F
    //    result = execute(planet, rover, command)
    //    expect(result).toBe(Rover: 0 2 N)
  })

  test.skip("move forward command, opposite direction", () => {
    //    planet = Planet: 5 4 (no obstacles)
    //    rover = Rover: 0 1 S
    //    command = Command: F
    //    result = execute(planet, rover, command)
    //    expect(result).toBe(Rover: 0 0 S)
  })

  test.skip("move backward command", () => {
    //    planet = Planet: 5 4 (no obstacles)
    //    rover = Rover: 0 1 N
    //    command = Command: B
    //    result = execute(planet, rover, command)
    //    expect(result).toBe(Rover: 0 0 N)
  })

  test.skip("move forward command, opposite direction", () => {
    //    planet = Planet: 5 4 (no obstacles)
    //    rover = Rover: 0 1 S
    //    command = Command: B
    //    result = execute(planet, rover, command)
    //    expect(result).toBe(Rover: 0 2 S)
  })

  test.skip("wrap on North", () => {
    //    planet = Planet: 5 4 (no obstacles)
    //    rover = Rover: 0 3 N
    //    command = Command: F
    //    result = execute(planet, rover, command)
    //    expect(result).toBe(Rover: 0 0 N)
  })

  test.skip("go to opposite angle", () => {
    //    planet = Planet 5 4 (no obstacles)
    //    rover = Rover: 0 0 N
    //    commands = Commands: L F R B
    //    result = executeAll(planet, rover, commands)
    //    expect(result).toBe(Rover: 4 3 N)
  })
})
