// ADAPTERS

import { CommandsChannel, MissionReport, MissionSource } from "./ports"
import {
  loadPlanet,
  loadRover,
  loadCommands,
  writeSequenceCompleted,
  writeObstacleDetected,
  writeError,
} from "./infrastructure"

export const createFileMissionSource = (
  pathPlanet: string,
  pathRover: string,
): MissionSource => ({
  readPlanet: () => loadPlanet(pathPlanet),
  readRover: () => loadRover(pathRover),
})
export const createStdinCommandsChannel = (): CommandsChannel => ({
  read: loadCommands,
})
export const createStdoutMissionReport = (): MissionReport => ({
  sequenceCompleted: writeSequenceCompleted,
  obstacleDetected: writeObstacleDetected,
  missionFailed: writeError,
})
