import { parseCommands } from "../../solutions/version2"
import * as E from "fp-ts/Either"

describe("version 2", () => {
  test("it works", () => {
    const result = parseCommands("RLFB")

    expect(result).toStrictEqual(E.right(["TurnRight", "TurnLeft", "MoveForward", "MoveBackward"]))
  })
})
