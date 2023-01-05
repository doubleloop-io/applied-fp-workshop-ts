// RENDERING

import { match } from "ts-pattern"
import { ParseError, Rover } from "./core"

export const renderError = (error: Error): string => error.message

export const renderParseError = (error: ParseError): string =>
  match(error)
    .with(
      { _tag: "InvalidCommand" },
      (e) => `Invalid command. ${e.error.message}`,
    )
    .with(
      { _tag: "InvalidDirection" },
      (e) => `Invalid direction. ${e.error.message}`,
    )
    .with(
      { _tag: "InvalidObstacle" },
      (e) => `Invalid obstacle. ${e.error.message}`,
    )
    .with(
      { _tag: "InvalidPosition" },
      (e) => `Invalid position. ${e.error.message}`,
    )
    .with({ _tag: "InvalidSize" }, (e) => `Invalid size. ${e.error.message}`)
    .exhaustive()

export const renderComplete = (rover: Rover): string =>
  `${rover.position.x}:${rover.position.y}:${rover.direction}`

export const renderObstacle = (rover: Rover): string =>
  `O:${rover.position.x}:${rover.position.y}:${rover.direction}`
