import Fastify from "fastify"
import {
  createFileMissionSource,
  createRequestCommandsChannel,
  createStdoutMissionReport,
} from "./adapterts"
import { runApp } from "./handler"

const fastify = Fastify({
  logger: true,
})

const pathPlanet = "data/planet.txt"
const pathRover = "data/rover.txt"

interface RoverParams {
  commands: string
}

fastify.get<{
  Params: RoverParams
}>("/rover/:commands", async (request, reply) => {
  const missionSource = createFileMissionSource(pathPlanet, pathRover)
  const commandsSource = createRequestCommandsChannel(request.params)
  // TODO: mission report from reply
  const missionReport = createStdoutMissionReport()

  const app = runApp(missionSource, commandsSource, missionReport)
  await app()
  reply.type("application/json").code(200)
  return { hello: "world" }
})

fastify.get("/", async (request, reply) => {
  reply.type("application/json").code(200)
  return { hello: "world" }
})

fastify.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}/rover/RFF`)
})
