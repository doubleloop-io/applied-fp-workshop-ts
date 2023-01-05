// ADAPTERS

import { CommandsChannel, MissionReport, MissionSource } from "./ports"
import { TaskEither } from "fp-ts/TaskEither"
import { flow, pipe } from "fp-ts/function"
import { loadTuple } from "../app/utils/infra-file"
import * as TE from "fp-ts/TaskEither"
import * as E from "fp-ts/Either"
import { logError, logInfo } from "../app/utils/infra-console"
import { Task } from "fp-ts/Task"
import { Planet, Rover, ParseError } from "./core"
import {
  renderComplete,
  renderError,
  renderObstacle,
  renderParseError,
} from "./rendering"
import { parsePlanet, parseRover, parseCommands } from "./parser"

export const createFileMissionSource = (
  pathPlanet: string,
  pathRover: string,
): MissionSource => ({
  readPlanet: () => loadPlanet(pathPlanet),
  readRover: () => loadRover(pathRover),
})

export const createRequestCommandsChannel = (params: {
  commands: string
}): CommandsChannel => ({
  read: () =>
    pipe(params.commands, parseCommands, E.mapLeft(toError), TE.fromEither),
})
export const createStdoutMissionReport = (): MissionReport => ({
  sequenceCompleted: writeSequenceCompleted,
  obstacleDetected: writeObstacleDetected,
  missionFailed: writeError,
})

const toError = (error: ParseError): Error => new Error(renderParseError(error))

export const loadPlanet = (path: string): TaskEither<Error, Planet> =>
  pipe(
    loadTuple(path),
    TE.chain(flow(parsePlanet, E.mapLeft(toError), TE.fromEither)),
  )

export const loadRover = (path: string): TaskEither<Error, Rover> =>
  pipe(
    loadTuple(path),
    TE.chain(flow(parseRover, E.mapLeft(toError), TE.fromEither)),
  )

export const writeSequenceCompleted = (rover: Rover): Task<void> =>
  pipe(renderComplete(rover), logInfo)

export const writeObstacleDetected = (rover: Rover): Task<void> =>
  pipe(renderObstacle(rover), logInfo)

export const writeError = (error: Error): Task<void> =>
  pipe(renderError(error), logError)
