import { CommandsChannel, MissionReport, MissionSource } from "./ports"
import * as TE from "fp-ts/TaskEither"
import * as T from "fp-ts/Task"
import { constVoid, flow, pipe } from "fp-ts/function"
import { loadTuple } from "../app/utils/infra-file"
import * as E from "fp-ts/Either"
import { Task } from "fp-ts/Task"
import { ParseError, Rover } from "./core"
import {
  renderComplete,
  renderError,
  renderObstacle,
  renderParseError,
} from "./rendering"
import { parseCommands, parsePlanet, parseRover } from "./parser"
import {
  FastifyReply,
  FastifyRequest,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify"
import { RouteGenericInterface } from "fastify/types/route"

const toError = (error: ParseError): Error => new Error(renderParseError(error))

export const createFileMissionSource = (
  pathPlanet: string,
  pathRover: string,
): MissionSource => ({
  readPlanet: () =>
    pipe(
      loadTuple(pathPlanet),
      TE.chain(flow(parsePlanet, E.mapLeft(toError), TE.fromEither)),
    ),
  readRover: () =>
    pipe(
      loadTuple(pathRover),
      TE.chain(flow(parseRover, E.mapLeft(toError), TE.fromEither)),
    ),
})


interface MissionResult {
  result: string
}
interface Mission extends RouteGenericInterface {
  Params: { commands: string }
  Reply: MissionResult // put the response payload interface here
}
export type MissionRequest = FastifyRequest<Mission>
export type MissionResponse = FastifyReply<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  Mission
>

export const createRequestCommandsChannel = (params: Mission['Params']): CommandsChannel => ({
  read: () =>
    pipe(params.commands, parseCommands, E.mapLeft(toError), TE.fromEither),
})

const setReply =
  (code: number, reply: { code: number; result: string }) =>
  (result: string) => {
    reply.code = code
    reply.result = result
    return T.of(constVoid())
  }

export const createResponseMissionReport = (reply: {
  code: number
  result: string
}): MissionReport => ({
  sequenceCompleted: (rover: Rover): Task<void> =>
    // 200 OK
    pipe(renderComplete(rover), setReply(200, reply)),
  obstacleDetected: (rover: Rover): Task<void> =>
    // 200 OK
    pipe(renderObstacle(rover), setReply(200, reply)),
  missionFailed: (error: Error): Task<void> =>
    // 422 Unprocessable Entity
    pipe(renderError(error), setReply(422, reply)),
})

