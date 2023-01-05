import { TaskEither } from "fp-ts/TaskEither"
import { Task } from "fp-ts/Task"
import { ObstacleDetected, Planet, Rover, Command } from "./core"

export type MissionSource = {
  readPlanet: () => TaskEither<Error, Planet>
  readRover: () => TaskEither<Error, Rover>
}
export type CommandsChannel = {
  read: () => TaskEither<Error, ReadonlyArray<Command>>
}
export type MissionReport = {
  sequenceCompleted: (_: Rover) => Task<void>
  obstacleDetected: (_: ObstacleDetected) => Task<void>
  missionFailed: (_: Error) => Task<void>
}
