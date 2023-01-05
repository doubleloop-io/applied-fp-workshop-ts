// ENTRY POINT
import { Task } from "fp-ts/Task"
import { pipe } from "fp-ts/function"
import * as TE from "fp-ts/TaskEither"
import * as E from "fp-ts/Either"
import { TaskEither } from "fp-ts/TaskEither"
import { Either } from "fp-ts/Either"
import { ObstacleDetected, Rover } from "./core"
import { CommandsChannel, MissionReport, MissionSource } from "./ports"
import { executeAll } from "./domain"

export const runApp = (
  missionSource: MissionSource,
  commandsChannel: CommandsChannel,
  missionReport: MissionReport,
): Task<void> =>
  pipe(
    runMission(missionSource, commandsChannel),
    TE.map(
      E.fold(missionReport.obstacleDetected, missionReport.sequenceCompleted),
    ),
    TE.chain((t) => TE.fromTask(t)),
    TE.getOrElse(missionReport.missionFailed),
  )

const runMission = (
  missionSource: MissionSource,
  commandsChannel: CommandsChannel,
): TaskEither<Error, Either<ObstacleDetected, Rover>> =>
  pipe(
    TE.of(executeAll),
    TE.ap(missionSource.readPlanet()),
    TE.ap(missionSource.readRover()),
    TE.ap(commandsChannel.read()),
  )
